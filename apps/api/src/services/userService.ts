import { v4 as uuidv4 } from 'uuid';
import { query } from '@/config/database';
import { logger } from '@/utils/logger';
import { hashPassword, verifyPassword } from './authService';

export interface UserInput {
  email: string;
  firstName: string;
  lastName: string;
  role?: 'super_admin' | 'admin' | 'editor';
  status?: 'active' | 'inactive' | 'suspended';
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Get all users with pagination and filters
export async function getUsers(
  limit: number = 50,
  offset: number = 0,
  filters?: { role?: string; status?: string; search?: string }
) {
  try {
    let baseQuery = 'SELECT * FROM users WHERE 1=1';
    const params: any[] = [];

    if (filters?.role) {
      baseQuery += ' AND role = $' + (params.length + 1);
      params.push(filters.role);
    }

    if (filters?.status) {
      baseQuery += ' AND status = $' + (params.length + 1);
      params.push(filters.status);
    }

    if (filters?.search) {
      baseQuery += ' AND (email ILIKE $' + (params.length + 1) + ' OR first_name ILIKE $' + (params.length + 1) + ' OR last_name ILIKE $' + (params.length + 1) + ')';
      params.push(`%${filters.search}%`);
    }

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM users WHERE 1=1' +
        (filters?.role ? ' AND role = $1' : '') +
        (filters?.status ? ' AND status = $' + (filters?.role ? '2' : '1') : '') +
        (filters?.search ? ' AND (email ILIKE $' + (filters?.role || filters?.status ? (filters?.role && filters?.status ? '3' : '2') : '1') + ')' : ''),
      filters?.role ? [filters.role, ...(filters.status ? [filters.status] : []), ...(filters.search ? [`%${filters.search}%`] : [])] : filters?.status ? [filters.status, ...(filters.search ? [`%${filters.search}%`] : [])] : filters?.search ? [`%${filters.search}%`] : []
    );

    // Get paginated results
    baseQuery += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await query(baseQuery, params);

    return {
      users: result.rows.map(mapRowToUser),
      total: parseInt(countResult.rows[0].count),
      limit,
      offset,
    };
  } catch (error) {
    logger.error('Get users error:', error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, role, status, last_login, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    return result.rows.length > 0 ? mapRowToUser(result.rows[0]) : null;
  } catch (error) {
    logger.error('Get user by ID error:', error);
    throw error;
  }
}

// Create new user
export async function createUser(input: UserInput & { password: string }): Promise<User> {
  try {
    // Check if user exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [input.email]);
    if (existing.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const userId = uuidv4();

    const result = await query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, first_name, last_name, role, status, last_login, created_at, updated_at`,
      [userId, input.email, passwordHash, input.firstName, input.lastName, input.role || 'editor', input.status || 'active']
    );

    logger.info(`User created: ${input.email}`);
    return mapRowToUser(result.rows[0]);
  } catch (error) {
    logger.error('Create user error:', error);
    throw error;
  }
}

// Update user
export async function updateUser(userId: string, input: Partial<UserInput>): Promise<User> {
  try {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (input.email) {
      updates.push(`email = $${paramIndex++}`);
      params.push(input.email);
    }
    if (input.firstName) {
      updates.push(`first_name = $${paramIndex++}`);
      params.push(input.firstName);
    }
    if (input.lastName) {
      updates.push(`last_name = $${paramIndex++}`);
      params.push(input.lastName);
    }
    if (input.role) {
      updates.push(`role = $${paramIndex++}`);
      params.push(input.role);
    }
    if (input.status) {
      updates.push(`status = $${paramIndex++}`);
      params.push(input.status);
    }

    if (updates.length === 0) {
      return (await getUserById(userId))!;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(userId);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, first_name, last_name, role, status, last_login, created_at, updated_at`,
      params
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    logger.info(`User updated: ${userId}`);
    return mapRowToUser(result.rows[0]);
  } catch (error) {
    logger.error('Update user error:', error);
    throw error;
  }
}

// Delete user (soft delete)
export async function deleteUser(userId: string): Promise<void> {
  try {
    const result = await query(
      'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      ['inactive', userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    logger.info(`User deleted: ${userId}`);
  } catch (error) {
    logger.error('Delete user error:', error);
    throw error;
  }
}

// Reset user password
export async function resetUserPassword(userId: string, newPassword: string): Promise<void> {
  try {
    const hash = await hashPassword(newPassword);
    const result = await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [hash, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    logger.info(`Password reset for user: ${userId}`);
  } catch (error) {
    logger.error('Reset password error:', error);
    throw error;
  }
}

// Map database row to User object
function mapRowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    status: row.status,
    lastLogin: row.last_login,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

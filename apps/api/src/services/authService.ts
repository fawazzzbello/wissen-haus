import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { query } from '@/config/database';
import { logger } from '@/utils/logger';

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'editor';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: Date | null;
}

export interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT tokens
export function generateTokens(user: User): AuthToken {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: 900, // 15 minutes in seconds
  };
}

// Verify access token
export function verifyAccessToken(token: string): DecodedToken {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    logger.error('Invalid access token:', error);
    throw new Error('Invalid or expired token');
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): DecodedToken {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as DecodedToken;
  } catch (error) {
    logger.error('Invalid refresh token:', error);
    throw new Error('Invalid or expired refresh token');
  }
}

// Register new user (admin only)
export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: 'admin' | 'editor' = 'editor'
): Promise<User> {
  try {
    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role, status, last_login`,
      [email, passwordHash, firstName, lastName, role, 'active']
    );

    logger.info(`User registered: ${email}`);

    return mapRowToUser(result.rows[0]);
  } catch (error) {
    logger.error('Registration error:', error);
    throw error;
  }
}

// Login user
export async function loginUser(email: string, password: string): Promise<User & AuthToken> {
  try {
    // Find user
    const result = await query(
      'SELECT id, email, password_hash, first_name, last_name, role, status, last_login FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const userRow = result.rows[0];

    // Check if user is active
    if (userRow.status !== 'active') {
      throw new Error(`User account is ${userRow.status}`);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, userRow.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [userRow.id]
    );

    const user = mapRowToUser(userRow);
    const tokens = generateTokens(user);

    logger.info(`User logged in: ${email}`);

    return {
      ...user,
      ...tokens,
    };
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, role, status, last_login FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapRowToUser(result.rows[0]);
  } catch (error) {
    logger.error('Get user error:', error);
    throw error;
  }
}

// Refresh tokens
export async function refreshTokens(refreshToken: string): Promise<AuthToken> {
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Get user
    const user = await getUserById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new tokens
    return generateTokens(user);
  } catch (error) {
    logger.error('Token refresh error:', error);
    throw error;
  }
}

// Change password
export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  try {
    // Get user with password hash
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    // Verify old password
    const isValid = await verifyPassword(oldPassword, result.rows[0].password_hash);
    if (!isValid) {
      throw new Error('Incorrect password');
    }

    // Hash new password and update
    const newHash = await hashPassword(newPassword);
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newHash, userId]
    );

    logger.info(`Password changed for user: ${userId}`);
  } catch (error) {
    logger.error('Change password error:', error);
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
  };
}

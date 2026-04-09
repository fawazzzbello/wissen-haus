import { Request, Response } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
} from '@/services/userService';
import { logger } from '@/utils/logger';

// List users (admin only)
export async function listUsers(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const role = req.query.role as string;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const result = await getUsers(limit, offset, { role, status, search });
    res.json(result);
  } catch (error: any) {
    logger.error('List users error:', error);
    res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch users' } });
  }
}

// Get user by ID
export async function getUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
    }

    const { id } = req.params;
    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    res.json({ user });
  } catch (error: any) {
    logger.error('Get user error:', error);
    res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch user' } });
  }
}

// Create new user (super_admin only)
export async function createNewUser(req: Request, res: Response) {
  try {
    if (!req.user || req.user.role !== 'super_admin') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Super admin only' } });
    }

    const { email, firstName, lastName, password, role } = req.body;

    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Password must be 8+ chars' } });
    }

    const user = await createUser({ email, firstName, lastName, password, role });
    res.status(201).json({ user, message: 'User created successfully' });
  } catch (error: any) {
    logger.error('Create user error:', error);

    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: { code: 'USER_EXISTS', message: error.message } });
    }

    res.status(500).json({ error: { code: 'CREATE_FAILED', message: 'Failed to create user' } });
  }
}

// Update user
export async function updateUserProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
    }

    const { id } = req.params;
    const { firstName, lastName, role, status } = req.body;

    // Only super_admin can update role/status
    if ((role || status) && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Super admin only' } });
    }

    // Users can only update their own profile (except super_admin)
    if (id !== req.user.userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Cannot update other users' } });
    }

    const user = await updateUser(id, { firstName, lastName, role, status });
    res.json({ user, message: 'User updated successfully' });
  } catch (error: any) {
    logger.error('Update user error:', error);
    res.status(500).json({ error: { code: 'UPDATE_FAILED', message: 'Failed to update user' } });
  }
}

// Delete user (super_admin only)
export async function deleteUserHandler(req: Request, res: Response) {
  try {
    if (!req.user || req.user.role !== 'super_admin') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Super admin only' } });
    }

    const { id } = req.params;

    if (id === req.user.userId) {
      return res.status(400).json({ error: { code: 'INVALID_REQUEST', message: 'Cannot delete yourself' } });
    }

    await deleteUser(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    logger.error('Delete user error:', error);
    res.status(500).json({ error: { code: 'DELETE_FAILED', message: 'Failed to delete user' } });
  }
}

// Reset user password (super_admin only)
export async function resetPassword(req: Request, res: Response) {
  try {
    if (!req.user || req.user.role !== 'super_admin') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Super admin only' } });
    }

    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Password must be 8+ chars' } });
    }

    await resetUserPassword(id, newPassword);
    res.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    logger.error('Reset password error:', error);
    res.status(500).json({ error: { code: 'RESET_FAILED', message: 'Failed to reset password' } });
  }
}

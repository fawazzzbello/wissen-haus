import { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  getUserById,
  refreshTokens,
  changePassword,
} from '@/services/authService';
import { logger } from '@/utils/logger';

// Register new admin user
export async function register(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, password, first name, and last name are required',
        },
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 8 characters long',
        },
      });
    }

    const user = await registerUser(email, password, firstName, lastName, role || 'editor');

    res.status(201).json({
      user,
      message: 'User registered successfully',
    });
  } catch (error: any) {
    logger.error('Register error:', error);

    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: {
          code: 'USER_EXISTS',
          message: error.message,
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'REGISTRATION_FAILED',
        message: 'Failed to register user',
      },
    });
  }
}

// Login
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
        },
      });
    }

    const userWithTokens = await loginUser(email, password);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', userWithTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return user and tokens
    const { refreshToken, ...userResponse } = userWithTokens;
    res.json({
      user: {
        id: userResponse.id,
        email: userResponse.email,
        firstName: userResponse.firstName,
        lastName: userResponse.lastName,
        role: userResponse.role,
        status: userResponse.status,
      },
      accessToken: userResponse.accessToken,
      expiresIn: userResponse.expiresIn,
    });
  } catch (error: any) {
    logger.error('Login error:', error);

    res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: error.message || 'Invalid email or password',
      },
    });
  }
}

// Get current user
export async function getCurrentUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const user = await getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.json({ user });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get user information',
      },
    });
  }
}

// Refresh token
export async function refresh(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token is required',
        },
      });
    }

    const tokens = await refreshTokens(refreshToken);

    // Update refresh token in cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      error: {
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token',
      },
    });
  }
}

// Logout
export async function logout(req: Request, res: Response) {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: {
        code: 'LOGOUT_FAILED',
        message: 'Failed to logout',
      },
    });
  }
}

// Change password
export async function changeUserPassword(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Old password, new password, and confirm password are required',
        },
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'New passwords do not match',
        },
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'New password must be at least 8 characters long',
        },
      });
    }

    await changePassword(req.user.userId, oldPassword, newPassword);

    res.json({
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    logger.error('Change password error:', error);

    if (error.message === 'Incorrect password') {
      return res.status(401).json({
        error: {
          code: 'INVALID_PASSWORD',
          message: error.message,
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'PASSWORD_CHANGE_FAILED',
        message: 'Failed to change password',
      },
    });
  }
}

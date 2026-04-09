import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/services/authService';
import { logger } from '@/utils/logger';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

// Auth middleware - verify JWT token
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Authorization token is required',
        },
      });
    }

    // Extract token from "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN_FORMAT',
          message: 'Invalid authorization header format',
        },
      });
    }

    const token = parts[1];

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);

    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      },
    });
  }
};

// Optional auth - doesn't fail if no token
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const decoded = verifyAccessToken(parts[1]);
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        };
      }
    }
    next();
  } catch (error) {
    // Don't fail for optional auth
    logger.debug('Optional auth failed:', error);
    next();
  }
};

// Role-based authorization middleware
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        `Unauthorized access attempt: ${req.user.email} (${req.user.role}) tried to access ${req.path}`
      );

      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource',
        },
      });
    }

    next();
  };
};

// Admin only middleware
export const adminOnly = authorize(['super_admin', 'admin']);

// Super admin only middleware
export const superAdminOnly = authorize(['super_admin']);

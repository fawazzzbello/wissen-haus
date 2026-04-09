import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.http(`${req.method} ${req.path}`);
  next();
};

// API Error response interface
export interface ApiError extends Error {
  status?: number;
  code?: string;
}

// Error handler middleware
export const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  logger.error(`[${status}] ${code}: ${message}`, {
    path: req.path,
    method: req.method,
    error: err,
  });

  res.status(status).json({
    error: {
      code,
      message,
      status,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

// Auth middleware (will implement properly in Phase 2)
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Placeholder - will be implemented in Phase 2
  next();
};

// Role-based middleware
export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Placeholder - will be implemented in Phase 2
    next();
  };
};

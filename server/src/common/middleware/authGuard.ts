// ──────────────────────────────────────────────
// Auth Middleware — JWT verification
// ──────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env.config.js';
import { UnauthorizedError } from '../errors/AppError.js';

export interface AuthPayload {
  userId: string;
  email: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * Middleware that verifies the JWT authentication token from the Authorization header.
 * Populates req.user with the verified userId and email.
 */
export function authGuard(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token is missing or invalid');
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    throw new UnauthorizedError(err.message || 'Invalid or expired authentication token');
  }
}

/**
 * Optional auth — populates req.user if a valid token is provided.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
      req.user = decoded;
    } catch {
      // Ignore token verification errors for optional authentication
    }
  }
  next();
}

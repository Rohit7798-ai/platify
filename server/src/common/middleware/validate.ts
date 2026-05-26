// ──────────────────────────────────────────────
// Validation Middleware — Zod schema validation
// ──────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors/AppError.js';

/**
 * Creates middleware that validates request body against a Zod schema.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.') || 'body';
          if (!details[path]) details[path] = [];
          details[path].push(issue.message);
        }
        next(new ValidationError(details));
        return;
      }
      next(error);
    }
  };
}

/**
 * Creates middleware that validates request query parameters.
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.') || 'query';
          if (!details[path]) details[path] = [];
          details[path].push(issue.message);
        }
        next(new ValidationError(details));
        return;
      }
      next(error);
    }
  };
}

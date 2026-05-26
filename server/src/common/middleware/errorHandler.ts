// ──────────────────────────────────────────────
// Global Error Handler Middleware
// ──────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors/AppError.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  // Log errors appropriately
  if (err instanceof AppError && err.statusCode < 500) {
    console.warn(`[WARN] ${err.statusCode} - ${err.message}`);
  } else {
    console.error(`[ERROR] ${err.message}`, err.stack);
  }

  // Handle our custom errors
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      details: err.details,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
    });
    return;
  }

  // Handle Multer errors
  if (err.message?.includes('File too large')) {
    res.status(413).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.',
      code: 'FILE_TOO_LARGE',
      statusCode: 413,
    });
    return;
  }

  // Unknown errors
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  });
}

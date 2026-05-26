// ──────────────────────────────────────────────
// Auth Controller — handles auth HTTP endpoints
// ──────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { sendSuccess, sendCreated } from '../../common/utils/response.utils.js';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, fullName } = req.body;
    const result = await authService.register(email, password, fullName);
    sendCreated(res, result);
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, redirectUrl } = req.body;
    const result = await authService.resetPassword(email, redirectUrl || `${req.headers.origin}`);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function updatePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7) || '';
    const { password } = req.body;
    const result = await authService.updatePassword(token, password);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    sendSuccess(res, { tokens });
  } catch (error) {
    next(error);
  }
}

// ──────────────────────────────────────────────
// Chat Controller & Routes
// ──────────────────────────────────────────────

import { Router, Request, Response, NextFunction } from 'express';
import { chatService } from './chat.service.js';
import { authGuard } from '../../common/middleware/authGuard.js';
import { sendSuccess } from '../../common/utils/response.utils.js';
import { validateBody } from '../../common/middleware/validate.js';
import { z } from 'zod';

// ─── Validation ─────────────────────────────

const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000),
  sessionId: z.string().optional(),
  imageBase64: z.string().optional(),
});

// ─── Controller ─────────────────────────────

async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { message, sessionId, imageBase64 } = req.body;
    const result = await chatService.sendMessage(
      req.user!.userId,
      sessionId || null,
      message,
      imageBase64
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

async function clearSession(req: Request, res: Response, next: NextFunction) {
  try {
    chatService.clearSession(req.params.sessionId);
    sendSuccess(res, { message: 'Session cleared' });
  } catch (error) {
    next(error);
  }
}

// ─── Routes ─────────────────────────────────

const router = Router();
router.use(authGuard);

router.post('/message',                  validateBody(chatMessageSchema), sendMessage);
router.delete('/sessions/:sessionId',    clearSession);

export default router;

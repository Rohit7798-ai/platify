// ──────────────────────────────────────────────
// Auth Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validateBody } from '../../common/middleware/validate.js';
import { loginSchema, registerSchema, resetPasswordSchema, updatePasswordSchema, refreshTokenSchema } from './auth.dto.js';

const router = Router();

router.post('/login',           validateBody(loginSchema),          authController.login);
router.post('/register',        validateBody(registerSchema),       authController.register);
router.post('/reset-password',  validateBody(resetPasswordSchema),  authController.resetPassword);
router.put('/update-password',  validateBody(updatePasswordSchema), authController.updatePassword);
router.post('/refresh',         validateBody(refreshTokenSchema),   authController.refreshToken);

export default router;

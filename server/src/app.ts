// ──────────────────────────────────────────────
// Express Application Setup
// ──────────────────────────────────────────────

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.config.js';
import { errorHandler } from './common/middleware/errorHandler.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import plantsRoutes from './modules/plants/plants.routes.js';
import collectionRoutes from './modules/collection/collection.routes.js';
import scansRoutes from './modules/scans/scans.routes.js';
import chatRoutes from './modules/chat/chat.routes.js';
import toolsRoutes from './modules/tools/tools.routes.js';

const app = express();

// ─── Security ─────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: config.isDev ? '*' : config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body Parsing ─────────────────────────────
app.use(express.json({ limit: '15mb' }));  // for base64 images
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// ─── Rate Limiting ────────────────────────────
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxGeneral,
  message: { success: false, message: 'Too many requests', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxAi,
  message: { success: false, message: 'AI rate limit exceeded. Please wait.', code: 'AI_RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/v1/plants/identify', aiLimiter);
app.use('/api/v1/plants/diagnose', aiLimiter);
app.use('/api/v1/chat', aiLimiter);

// ─── Health Check ─────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  });
});

// ─── API Routes (v1) ──────────────────────────
app.use('/api/v1/auth',        authRoutes);
app.use('/api/v1/plants',      plantsRoutes);
app.use('/api/v1/collection',  collectionRoutes);
app.use('/api/v1/scans',       scansRoutes);
app.use('/api/v1/chat',        chatRoutes);
app.use('/api/v1/tools',       toolsRoutes);

// ─── 404 Handler ──────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    code: 'NOT_FOUND',
    statusCode: 404,
  });
});

// ─── Global Error Handler ─────────────────────
app.use(errorHandler);

export default app;

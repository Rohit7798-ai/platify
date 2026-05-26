// ──────────────────────────────────────────────
// Plants Controller
// ──────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { plantsService } from './plants.service.js';
import { sendSuccess } from '../../common/utils/response.utils.js';
import { BadRequestError } from '../../common/errors/AppError.js';

/**
 * GET /api/v1/plants/scan
 * Unified scan endpoint with SSE streaming support.
 */
export async function scanPlant(req: Request, res: Response, next: NextFunction) {
  try {
    const isStream = req.query.stream === 'true';
    const mode = (req.query.mode as any) || 'both';

    let buffer: Buffer;

    if (req.file) {
      buffer = req.file.buffer;
    } else if (req.body.imageBase64) {
      const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
    } else {
      throw new BadRequestError('No image provided.');
    }

    if (isStream) {
      // Setup SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const stream = plantsService.scanStream(buffer, mode);
      for await (const event of stream) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
      res.end();
    } else {
      const result = await plantsService.scan(buffer, mode);
      sendSuccess(res, { plantData: result });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/plants/identify
 * Legacy compatibility: Uses optimized scan service logic.
 */
export async function identifyPlant(req: Request, res: Response, next: NextFunction) {
  try {
    let result;
    if (req.file) {
      result = await plantsService.identifyFromBuffer(req.file.buffer);
    } else if (req.body.imageBase64) {
      result = await plantsService.identifyFromBase64(req.body.imageBase64);
    } else {
      throw new BadRequestError('No image provided.');
    }
    sendSuccess(res, { plantData: result });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/plants/diagnose
 */
export async function diagnosePlant(req: Request, res: Response, next: NextFunction) {
  try {
    let result;
    if (req.file) {
      result = await plantsService.diagnoseFromBuffer(req.file.buffer);
    } else if (req.body.imageBase64) {
      result = await plantsService.diagnoseFromBase64(req.body.imageBase64);
    } else {
      throw new BadRequestError('No image provided.');
    }
    sendSuccess(res, { plantData: result });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/plants/search
 */
export async function searchPlants(req: Request, res: Response, next: NextFunction) {
  try {
    const query = (req.query.q as string) || '';
    const results = await plantsService.searchPlants(query);
    sendSuccess(res, results);
  } catch (error) {
    next(error);
  }
}

// ──────────────────────────────────────────────
// Collection Controller
// ──────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { collectionService } from './collection.service.js';
import { sendSuccess, sendCreated, sendNoContent, buildPaginationMeta } from '../../common/utils/response.utils.js';

export async function getCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;

    const result = await collectionService.getCollection(userId, page, limit, search);
    const meta = buildPaginationMeta(result.page, result.limit, result.total);
    sendSuccess(res, result.items, 200, meta);
  } catch (error) {
    next(error);
  }
}

export async function getPlant(req: Request, res: Response, next: NextFunction) {
  try {
    const plant = await collectionService.getPlantById(req.user!.userId, req.params.id);
    sendSuccess(res, plant);
  } catch (error) {
    next(error);
  }
}

export async function addPlant(req: Request, res: Response, next: NextFunction) {
  try {
    const plant = await collectionService.addToCollection(req.user!.userId, req.body);
    sendCreated(res, plant);
  } catch (error) {
    next(error);
  }
}

export async function removePlant(req: Request, res: Response, next: NextFunction) {
  try {
    await collectionService.removeFromCollection(req.user!.userId, req.params.id);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}

export async function updatePlant(req: Request, res: Response, next: NextFunction) {
  try {
    const plant = await collectionService.updatePlant(req.user!.userId, req.params.id, req.body);
    sendSuccess(res, plant);
  } catch (error) {
    next(error);
  }
}

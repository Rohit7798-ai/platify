// ──────────────────────────────────────────────
// Collection Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import * as collectionController from './collection.controller.js';
import { authGuard } from '../../common/middleware/authGuard.js';

const router = Router();

router.use(authGuard); // All collection routes require auth

router.get('/',        collectionController.getCollection);
router.get('/:id',     collectionController.getPlant);
router.post('/',       collectionController.addPlant);
router.put('/:id',     collectionController.updatePlant);
router.delete('/:id',  collectionController.removePlant);

export default router;

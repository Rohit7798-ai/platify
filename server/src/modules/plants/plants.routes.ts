// ──────────────────────────────────────────────
// Plants Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import multer from 'multer';
import * as plantsController from './plants.controller.js';
import { authGuard } from '../../common/middleware/authGuard.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const router = Router();

router.post('/scan',      authGuard, upload.single('image'), plantsController.scanPlant);
router.post('/identify',  authGuard, upload.single('image'), plantsController.identifyPlant);
router.post('/diagnose',  authGuard, upload.single('image'), plantsController.diagnosePlant);
router.get('/search',     plantsController.searchPlants);

export default router;

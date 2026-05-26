// ──────────────────────────────────────────────
// Tools Controller & Routes — Water Calculator + Light Meter
// Moved from frontend ToolsView.tsx
// ──────────────────────────────────────────────

import { Router, Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../common/utils/response.utils.js';
import { validateBody } from '../../common/middleware/validate.js';
import { z } from 'zod';

// ─── Validation ─────────────────────────────

const waterCalcSchema = z.object({
  plantType: z.enum(['tropical', 'succulent', 'fern']),
  potSize: z.number().min(2).max(24),
  season: z.enum(['spring', 'summer', 'fall', 'winter']),
});

// ─── Service Logic (moved from frontend) ─────

function calculateWatering(plantType: string, potSize: number, season: string) {
  let baseDays = 7;
  let amountMl = 250;

  // Adjust for plant type
  if (plantType === 'succulent') { baseDays = 14; amountMl = 100; }
  if (plantType === 'tropical') { baseDays = 7; amountMl = 300; }
  if (plantType === 'fern') { baseDays = 4; amountMl = 200; }

  // Adjust for pot size
  if (potSize > 8) { baseDays += 2; amountMl *= 1.5; }
  if (potSize < 5) { baseDays -= 2; amountMl *= 0.7; }

  // Adjust for season
  if (season === 'winter') { baseDays *= 1.5; amountMl *= 0.8; }
  if (season === 'summer') { baseDays *= 0.8; }

  return {
    frequency: `Every ${Math.round(baseDays)} days`,
    amount: `${Math.round(amountMl)} ml (${(amountMl / 240).toFixed(1)} cups)`,
  };
}

// ─── Controller ─────────────────────────────

async function waterCalculator(req: Request, res: Response, next: NextFunction) {
  try {
    const { plantType, potSize, season } = req.body;
    const result = calculateWatering(plantType, potSize, season);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// ─── Routes ─────────────────────────────────

const router = Router();

router.post('/water-calculator', validateBody(waterCalcSchema), waterCalculator);

export default router;

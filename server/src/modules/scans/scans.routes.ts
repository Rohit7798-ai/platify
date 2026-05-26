// ──────────────────────────────────────────────
// Scans Routes — scan history management with offline fallback
// ──────────────────────────────────────────────

import { Router, Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/env.config.js';
import { authGuard } from '../../common/middleware/authGuard.js';
import { sendSuccess, buildPaginationMeta } from '../../common/utils/response.utils.js';
import { InternalError } from '../../common/errors/AppError.js';
import { compressImageBuffer, stripDataUriPrefix } from '../../common/utils/image.utils.js';
import fs from 'fs';
import path from 'path';

// Define a local database file path in the workspace
const SCANS_FILE = path.join(process.cwd(), 'scratch', 'local_scans.json');

// Ensure scratch directory exists
const scratchDir = path.join(process.cwd(), 'scratch');
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

// Helpers to read/write local scans data
function readLocalScans(): any[] {
  if (!fs.existsSync(SCANS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(SCANS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeLocalScans(data: any[]): void {
  fs.writeFileSync(SCANS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

const supabaseKey = config.supabaseServiceKey && config.supabaseServiceKey !== 'your_supabase_service_role_key'
  ? config.supabaseServiceKey
  : config.supabaseAnonKey;

const supabase = createClient(config.supabaseUrl, supabaseKey);

// ─── Helpers ─────────────────────────────────

async function processImage(image: string): Promise<string> {
  if (image && image.startsWith('data:image')) {
    try {
      const base64Data = stripDataUriPrefix(image);
      const buffer = Buffer.from(base64Data, 'base64');
      const compressed = await compressImageBuffer(buffer, 1024, 75);
      return `data:image/jpeg;base64,${compressed}`;
    } catch (err) {
      console.error('Scan image compression failed:', err);
      return image;
    }
  }
  return image;
}

// ─── Controller ─────────────────────────────

async function getScans(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    try {
      const { data, error, count } = await supabase
        .from('scans')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      const meta = buildPaginationMeta(page, limit, count || 0);
      sendSuccess(res, data || [], 200, meta);
    } catch (dbErr: any) {
      console.warn('⚠️ [ScansRoutes] Supabase fetch failed. Falling back to local offline DB:', dbErr.message);
      
      const scans = readLocalScans();
      const userScans = scans
        .filter(item => item.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      const total = userScans.length;
      const paginated = userScans.slice((page - 1) * limit, page * limit);
      const meta = buildPaginationMeta(page, limit, total);
      
      sendSuccess(res, paginated, 200, meta);
    }
  } catch (error) {
    next(error);
  }
}

async function getRecentScans(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      sendSuccess(res, data || []);
    } catch (dbErr: any) {
      console.warn('⚠️ [ScansRoutes] Supabase fetch failed. Falling back to local offline DB:', dbErr.message);
      
      const scans = readLocalScans();
      const userScans = scans
        .filter(item => item.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      
      sendSuccess(res, userScans);
    }
  } catch (error) {
    next(error);
  }
}

async function saveScan(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { name, scientificName, imageUrl, type, data: scanData } = req.body;

    // Compress image to avoid payload size issues
    const processedImage = await processImage(imageUrl);

    try {
      const { data, error } = await supabase
        .from('scans')
        .insert({
          user_id: userId,
          name, scientific_name: scientificName,
          image_url: processedImage, type, data: scanData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      sendSuccess(res, data, 201);
    } catch (dbErr: any) {
      console.warn('⚠️ [ScansRoutes] Supabase write failed. Saving to local offline DB:', dbErr.message);
      
      const scans = readLocalScans();
      const newId = crypto.randomUUID ? crypto.randomUUID() : `scan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      const newScan = {
        id: newId,
        user_id: userId,
        name,
        scientific_name: scientificName,
        image_url: processedImage,
        type,
        data: scanData,
        created_at: new Date().toISOString(),
      };
      
      scans.push(newScan);
      writeLocalScans(scans);
      
      sendSuccess(res, newScan, 201);
    }
  } catch (error) {
    next(error);
  }
}

// ─── Routes ─────────────────────────────────

const router = Router();
router.use(authGuard);

router.get('/',        getScans);
router.get('/recent',  getRecentScans);
router.post('/',       saveScan);

export default router;

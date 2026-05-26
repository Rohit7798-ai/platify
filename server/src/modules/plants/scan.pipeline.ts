// ──────────────────────────────────────────────
// Scan Pipeline Utility — Persistent File-based Caching and Deduplication
// ──────────────────────────────────────────────

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

interface CachedResult {
  data: any;
  timestamp: number;
}

// Define the persistent cache file path in the workspace
const CACHE_FILE = path.join(process.cwd(), 'scratch', 'scan_cache.json');

// Ensure scratch directory exists
const scratchDir = path.join(process.cwd(), 'scratch');
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

class ScanPipeline {
  private cache = new Map<string, CachedResult>();
  private activeScans = new Map<string, Promise<any>>();
  private readonly CACHE_TTL = 1000 * 60 * 60 * 24; // Extend to 24 hours for persistent cache

  constructor() {
    this.loadCache();
  }

  /**
   * Loads cached entries from the local file
   */
  private loadCache() {
    if (fs.existsSync(CACHE_FILE)) {
      try {
        const fileContent = fs.readFileSync(CACHE_FILE, 'utf8');
        const parsed = JSON.parse(fileContent);
        
        // Populate the in-memory cache map
        const now = Date.now();
        for (const [hash, entry] of Object.entries(parsed)) {
          const cachedEntry = entry as CachedResult;
          if (now - cachedEntry.timestamp < this.CACHE_TTL) {
            this.cache.set(hash, cachedEntry);
          }
        }
        console.log(`[ScanPipeline] Loaded ${this.cache.size} persistent cache entries.`);
      } catch (err) {
        console.error('[ScanPipeline] Failed to load persistent cache file:', err);
      }
    }
  }

  /**
   * Saves the current cache map to the local file
   */
  private saveCache() {
    try {
      this.cleanup(); // Clean expired items before saving
      const obj: Record<string, CachedResult> = {};
      for (const [hash, entry] of this.cache.entries()) {
        obj[hash] = entry;
      }
      fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf8');
    } catch (err) {
      console.error('[ScanPipeline] Failed to save persistent cache file:', err);
    }
  }

  /**
   * Retrieves a cached result if it exists and is not expired
   */
  getCached(hash: string): any | null {
    const cached = this.cache.get(hash);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`[ScanPipeline] Cache hit (persistent) for ${hash}`);
      return cached.data;
    }
    return null;
  }

  /**
   * Caches a result and persists it to the file
   */
  setCache(hash: string, data: any): void {
    this.cache.set(hash, { data, timestamp: Date.now() });
    this.saveCache();
  }

  /**
   * Generates a unique hash for an image buffer/string
   */
  generateHash(input: Buffer | string): string {
    const data = Buffer.isBuffer(input) ? input : Buffer.from(input);
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * Wraps an AI call with deduplication and caching
   */
  async execute<T>(
    hash: string,
    operation: () => Promise<T>
  ): Promise<T> {
    // 1. Check Cache
    const cached = this.cache.get(hash);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`[ScanPipeline] Cache hit (persistent) for ${hash}`);
      return cached.data as T;
    }

    // 2. Check Active Scans (Deduplication)
    const active = this.activeScans.get(hash);
    if (active) {
      console.log(`[ScanPipeline] Deduplicating request for ${hash}`);
      return active;
    }

    // 3. Execute, Store, and Persist
    const scanPromise = (async () => {
      try {
        const result = await operation();
        this.cache.set(hash, { data: result, timestamp: Date.now() });
        this.saveCache(); // Persist to file
        return result;
      } finally {
        this.activeScans.delete(hash);
      }
    })();

    this.activeScans.set(hash, scanPromise);
    return scanPromise;
  }

  /**
   * Cleanup old cache entries
   */
  cleanup() {
    const now = Date.now();
    for (const [hash, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.cache.delete(hash);
      }
    }
  }
}

export const scanPipeline = new ScanPipeline();

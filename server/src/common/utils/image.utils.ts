// ──────────────────────────────────────────────
// Image Processing Utility — server-side compression
// ──────────────────────────────────────────────

import sharp from 'sharp';

/**
 * Compresses an image buffer for AI processing.
 * Returns a base64-encoded JPEG string (no data URI prefix).
 */
export async function compressImageBuffer(buffer: Buffer, maxWidth = 800, quality = 70): Promise<string> {
  const compressed = await sharp(buffer)
    .resize(maxWidth, undefined, { withoutEnlargement: true, fit: 'inside' })
    .jpeg({ quality })
    .toBuffer();

  return compressed.toString('base64');
}

/**
 * Converts a base64 data URI to a raw base64 string.
 */
export function stripDataUriPrefix(base64: string): string {
  const commaIndex = base64.indexOf(',');
  return commaIndex > -1 ? base64.substring(commaIndex + 1) : base64;
}

/**
 * Generates a thumbnail from an image buffer.
 */
export async function generateThumbnail(buffer: Buffer, size = 200): Promise<Buffer> {
  return sharp(buffer)
    .resize(size, size, { fit: 'cover' })
    .jpeg({ quality: 60 })
    .toBuffer();
}

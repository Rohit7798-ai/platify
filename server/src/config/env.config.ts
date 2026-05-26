// ──────────────────────────────────────────────
// Environment Configuration — validated at startup
// ──────────────────────────────────────────────

import 'dotenv/config';


function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || process.env[`VITE_${key}`] || fallback;
}

function requireEnv(key: string): string {
  const value = optionalEnv(key, '');
  if (!value) {
    // Also check for common aliases
    if (key === 'SUPABASE_ANON_KEY') {
      const alt = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      if (alt) return alt;
    }
    throw new Error(`❌ Missing required environment variable: ${key} (or VITE_${key})`);
  }
  return value;
}

export const config = {
  port: parseInt(optionalEnv('PORT', '8000'), 10),
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  isDev: optionalEnv('NODE_ENV', 'development') === 'development',

  // AI APIs
  geminiApiKey: optionalEnv('GEMINI_API_KEY', ''),
  nvidiaApiKey: requireEnv('NVIDIA_API_KEY'),

  // Supabase
  supabaseUrl: requireEnv('SUPABASE_URL'),
  supabaseAnonKey: requireEnv('SUPABASE_ANON_KEY'),
  supabaseServiceKey: optionalEnv('SUPABASE_SERVICE_ROLE_KEY', ''),

  // Validation
  isServiceKeyValid: !!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_supabase_service_role_key',

  // JWT
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtRefreshSecret: optionalEnv('JWT_REFRESH_SECRET', requireEnv('JWT_SECRET') + '_refresh'),
  jwtExpiresIn: '15m',
  jwtRefreshExpiresIn: '7d',

  // Redis (optional)
  redisUrl: optionalEnv('REDIS_URL', ''),

  // CORS
  clientUrl: optionalEnv('CLIENT_URL', 'http://localhost:3000'),

  // Rate limiting
  rateLimit: {
    windowMs: 60 * 1000,       // 1 minute
    maxGeneral: 100,           // 100 req/min general
    maxAi: 10,                 // 10 req/min for AI endpoints
  },
} as const;

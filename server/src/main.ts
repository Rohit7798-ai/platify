// ──────────────────────────────────────────────
// Server Entry Point
// ──────────────────────────────────────────────

import app from './app.js';
import { config } from './config/env.config.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log('');
  console.log('  🌿 ─── Plantify API Server ─── 🌿');
  console.log('');
  console.log(`  ✅ Environment:  ${config.nodeEnv}`);
  console.log(`  ✅ Port:         ${PORT}`);
  console.log(`  ✅ API Base:     http://localhost:${PORT}/api/v1`);
  console.log(`  ✅ Health:       http://localhost:${PORT}/health`);
  
  if (config.isServiceKeyValid) {
    console.log('  ✅ Database:    Using Service Role (Full Access)');
  } else {
    console.warn('  ⚠️  Database:    Using Anon Key (Restricted Access - SAVE WILL FAIL)');
    console.warn('     Please update SUPABASE_SERVICE_ROLE_KEY in .env');
  }
  
  console.log('');
  console.log('  Available endpoints:');
  console.log('    POST   /api/v1/auth/login');
  console.log('    POST   /api/v1/auth/register');
  console.log('    POST   /api/v1/plants/scan');
  console.log('    POST   /api/v1/plants/identify');
  console.log('    POST   /api/v1/plants/diagnose');
  console.log('    GET    /api/v1/plants/search?q=...');
  console.log('    GET    /api/v1/collection');
  console.log('    POST   /api/v1/collection');
  console.log('    GET    /api/v1/scans');
  console.log('    POST   /api/v1/chat/message');
  console.log('    POST   /api/v1/tools/water-calculator');
  console.log('');
});

// Trigger watch restart

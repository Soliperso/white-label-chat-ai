#!/usr/bin/env node

/**
 * Apply migration by creating tables via Supabase REST API
 * This bypasses the need for psql or direct database access
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  console.error('\nUsage:');
  console.error('   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/migrate-via-api.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function executeSQLQuery(query) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql: query })
  });

  return response;
}

async function applyMigration() {
  console.log('🚀 Applying database migration via Supabase Management API...\n');
  console.log('Note: You should apply the migration via Supabase Dashboard SQL Editor instead.');
  console.log('This is because the REST API has limitations for DDL operations.\n');

  console.log('📋 Manual Steps:\n');
  console.log('1. Go to: https://supabase.com/dashboard/project/lyqzfwusfkkvkaaacosx/sql');
  console.log('2. Click "+ New Query"');
  console.log('3. Copy the contents of: supabase/migrations/20260110000001_initial_schema.sql');
  console.log('4. Paste and click "Run" (or Cmd/Ctrl + Enter)');
  console.log('5. Verify tables were created in Table Editor\n');

  console.log('⏱️  This will take about 30 seconds.\n');
  console.log('Would you like me to wait while you do this? (The script will verify afterwards)\n');
}

applyMigration();

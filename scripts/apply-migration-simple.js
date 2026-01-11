#!/usr/bin/env node

/**
 * Simple script to apply Supabase migration
 * Usage: node scripts/apply-migration-simple.js [service-role-key]
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.argv[2] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nUsage:');
  console.error('   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/apply-migration-simple.js');
  console.error('   or: SUPABASE_URL=<url> node scripts/apply-migration-simple.js <service-role-key>');
  process.exit(1);
}

async function applyMigration() {
  try {
    console.log('📦 Reading migration file...');
    const migrationPath = join(__dirname, '../supabase/migrations/20260110000001_initial_schema.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('🚀 Applying migration via Supabase REST API...');
    console.log(`   URL: ${SUPABASE_URL}/rest/v1/rpc/exec_sql`);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log('✅ Migration applied successfully!');
    console.log('Result:', result);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n💡 Alternative: Apply the migration manually via Supabase Dashboard');
    console.error('   1. Go to your Supabase project dashboard');
    console.error('   2. Navigate to SQL Editor');
    console.error('   3. Paste the contents of supabase/migrations/20260110000001_initial_schema.sql');
    console.error('   4. Click Run');
    process.exit(1);
  }
}

applyMigration();

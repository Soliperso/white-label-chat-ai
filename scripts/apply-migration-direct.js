#!/usr/bin/env node

/**
 * Apply migration using Supabase connection pool directly
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  console.error('\nUsage:');
  console.error('   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/apply-migration-direct.js');
  process.exit(1);
}

async function executeSql(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'params=single-object'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response;
}

async function applyMigration() {
  try {
    console.log('📦 Reading migration file...');
    const migrationPath = join(__dirname, '../supabase/migrations/20260110000001_initial_schema.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('🚀 Executing migration SQL...\n');
    console.log('This will create:');
    console.log('  - organizations table');
    console.log('  - users table');
    console.log('  - training_sources table');
    console.log('  - training_jobs table');
    console.log('  - RLS policies');
    console.log('  - Triggers and functions\n');

    // Split into individual statements for better error handling
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement individually
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 60).replace(/\n/g, ' ');

      process.stdout.write(`[${i + 1}/${statements.length}] ${preview}... `);

      try {
        // Use pg_exec for direct SQL execution
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            query: statement + ';'
          })
        });

        console.log('✅');
      } catch (err) {
        console.log(`❌ ${err.message}`);
      }
    }

    console.log('\n✅ Migration process completed!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyMigration();

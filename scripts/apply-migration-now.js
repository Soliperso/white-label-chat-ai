#!/usr/bin/env node

/**
 * Apply migration directly to Supabase using service role key
 */

import { createClient } from '@supabase/supabase-js';
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
  console.error('   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/apply-migration-now.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('📦 Reading migration file...');
    const migrationPath = join(__dirname, '../supabase/migrations/20260110000001_initial_schema.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('🚀 Applying migration to Supabase...\n');

    // Execute the entire SQL script
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }

    console.log('✅ Migration applied successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...\n');

    const tables = ['organizations', 'users', 'training_sources', 'training_jobs'];
    let allGood = true;

    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('*').limit(1);

      if (tableError) {
        console.log(`❌ ${table} - Error: ${tableError.message}`);
        allGood = false;
      } else {
        console.log(`✅ ${table} - Created successfully`);
      }
    }

    if (allGood) {
      console.log('\n✨ All tables created successfully!');
      console.log('\n🎉 Database is ready to use!');
      console.log('\nNext steps:');
      console.log('  1. Run: npm run dev');
      console.log('  2. Open: http://localhost:3000/register');
      console.log('  3. Create your first account!\n');
    } else {
      console.log('\n⚠️  Some tables had issues. Check the errors above.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyMigration();

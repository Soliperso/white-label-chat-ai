#!/usr/bin/env node

/**
 * Test Supabase connection and check if migration is needed
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Required: SUPABASE_URL and SUPABASE_ANON_KEY');
  console.error('\nUsage:');
  console.error('   SUPABASE_URL=<url> SUPABASE_ANON_KEY=<anon_key> node scripts/test-supabase-connection.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');
  console.log(`URL: ${SUPABASE_URL}`);
  console.log(`Using anon key: ${SUPABASE_ANON_KEY.substring(0, 20)}...\n`);

  try {
    // Test basic connection
    console.log('✓ Supabase client created successfully');

    // Check if tables exist by trying to query them (will fail if migration not applied)
    const tables = ['organizations', 'users', 'training_sources', 'training_jobs'];
    const results = {};

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          results[table] = { exists: false, error: error.message };
        } else {
          results[table] = { exists: true, count: data?.length || 0 };
        }
      } catch (err) {
        results[table] = { exists: false, error: err.message };
      }
    }

    console.log('\n📊 Table Status:\n');
    let allTablesExist = true;

    for (const [table, result] of Object.entries(results)) {
      if (result.exists) {
        console.log(`✅ ${table.padEnd(20)} - EXISTS`);
      } else {
        console.log(`❌ ${table.padEnd(20)} - MISSING`);
        console.log(`   Error: ${result.error}`);
        allTablesExist = false;
      }
    }

    console.log('\n');

    if (!allTablesExist) {
      console.log('⚠️  Migration Required!\n');
      console.log('The database schema has not been set up yet.');
      console.log('Please follow these steps:\n');
      console.log('1. Open https://supabase.com/dashboard/project/lyqzfwusfkkvkaaacosx/sql');
      console.log('2. Click "+ New Query"');
      console.log('3. Copy the contents of: supabase/migrations/20260110000001_initial_schema.sql');
      console.log('4. Paste and click "Run"');
      console.log('5. Re-run this script to verify\n');
      console.log('Or read SUPABASE_SETUP.md for detailed instructions.\n');
      process.exit(1);
    } else {
      console.log('✅ All tables exist! Database is ready to use.\n');
      console.log('You can now run: npm run dev\n');
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();

#!/usr/bin/env node

/**
 * Fix Authentication RLS Policies - Direct API Approach
 *
 * This script uses the Supabase Management API to execute raw SQL
 * without relying on the exec_sql RPC function.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get credentials from environment
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Error: Missing required environment variables\n');
  console.error('Required:');
  console.error('  - SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY\n');
  console.error('Usage:');
  console.error('  SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/fix-auth-direct.js');
  process.exit(1);
}

async function executeSQL(sql) {
  // Extract the project reference from the Supabase URL
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  if (!projectRef) {
    throw new Error('Could not extract project reference from SUPABASE_URL');
  }

  // Use Supabase Management API to execute SQL
  const managementApiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

  console.log('🔗 Connecting to Supabase Management API...');
  console.log(`   Project: ${projectRef}`);

  const response = await fetch(managementApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY
    },
    body: JSON.stringify({
      query: sql
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return await response.json();
}

async function applySQLMigration() {
  try {
    console.log('🔧 Fixing Supabase RLS policies for authentication...\n');

    // Read the migration file
    console.log('📦 Reading migration file...');
    const migrationPath = join(__dirname, '../supabase/migrations/20260110000007_final_rls_fix.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('   ✅ Loaded migration: 20260110000007_final_rls_fix.sql\n');

    console.log('🚀 Executing SQL migration via Management API...\n');

    // Execute the entire SQL file
    try {
      const result = await executeSQL(sql);
      console.log('   ✅ SQL executed successfully');
      console.log('\n📊 Migration Result:', JSON.stringify(result, null, 2));
    } catch (error) {
      // If the management API doesn't work, provide fallback instructions
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('404')) {
        console.error('\n❌ Management API authentication failed.');
        console.error('   The service role key may not have access to the Management API.\n');
        console.error('📋 Alternative Solution - Manual SQL Editor:');
        console.error('   1. Go to https://app.supabase.com');
        console.error('   2. Navigate to SQL Editor');
        console.error('   3. Copy the contents of:');
        console.error(`      ${migrationPath}`);
        console.error('   4. Paste into SQL Editor and click Run\n');

        console.error('💡 Or use the PostgreSQL connection string:');
        console.error('   psql <connection-string> -f supabase/migrations/20260110000007_final_rls_fix.sql\n');
        process.exit(1);
      }
      throw error;
    }

    console.log('\n✅ Migration applied successfully!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Run verification: npm run verify:auth');
    console.log('   2. Test login at http://localhost:3000/login');
    console.log('   3. Check browser console for errors\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Fallback options:');
    console.error('   1. Manual SQL Editor (most reliable)');
    console.error('   2. Use PostgreSQL CLI with connection string');
    console.error('   3. Contact Supabase support for API access\n');
    process.exit(1);
  }
}

applySQLMigration();

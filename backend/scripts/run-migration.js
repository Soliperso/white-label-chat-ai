const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running widgets table migration...\n');

  const migrationFile = path.join(__dirname, '../migrations/001_create_widgets_table.sql');
  const sql = fs.readFileSync(migrationFile, 'utf8');

  try {
    // Execute the SQL using Supabase REST API
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      console.error('\nTrying alternative method...\n');

      // Alternative: Use postgres connection string if available
      const pgUrl = process.env.DATABASE_URL;
      if (pgUrl) {
        console.log('Using direct PostgreSQL connection...');
        const { Client } = require('pg');
        const client = new Client({ connectionString: pgUrl });

        await client.connect();
        await client.query(sql);
        await client.end();

        console.log('✅ Migration completed successfully!');
      } else {
        console.error('❌ No DATABASE_URL found. Please run the migration manually.');
        console.error('Copy the contents of backend/migrations/001_create_widgets_table.sql');
        console.error('and paste it into Supabase SQL Editor: https://app.supabase.com/project/_/sql/new');
      }
    } else {
      console.log('✅ Migration completed successfully!');
      console.log('   The widgets table has been created with RLS policies.');
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    console.error('\nPlease run the migration manually via Supabase Dashboard:');
    console.error('1. Go to: https://app.supabase.com/project/_/sql/new');
    console.error('2. Copy all contents from: backend/migrations/001_create_widgets_table.sql');
    console.error('3. Paste and click "Run"');
    process.exit(1);
  }
}

runMigration();

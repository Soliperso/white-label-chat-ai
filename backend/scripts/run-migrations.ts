import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../migrations');
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  console.log('🚀 Running database migrations...\n');

  for (const file of migrationFiles) {
    console.log(`📄 Running migration: ${file}`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    try {
      // Note: Supabase JS client doesn't support raw SQL execution directly
      // You need to run migrations via Supabase Dashboard or CLI
      console.log(`⚠️  Please run this migration manually via Supabase Dashboard:`);
      console.log(`   File: ${file}`);
      console.log(`   Path: ${filePath}\n`);
    } catch (error) {
      console.error(`❌ Error running migration ${file}:`, error);
      process.exit(1);
    }
  }

  console.log('\n✅ Please run the migrations manually via Supabase Dashboard');
  console.log('   Go to: https://app.supabase.com/project/_/sql/new');
  console.log(`   Copy contents from: ${migrationsDir}\n`);
}

runMigrations();

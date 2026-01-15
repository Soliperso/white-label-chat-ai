#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  // Get database connection string from environment
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in .env file');
    console.error('Please add your Supabase PostgreSQL connection string to .env:');
    console.error('DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/postgres');
    process.exit(1);
  }

  console.log('🚀 Running database migration...\n');

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const migrationFile = path.join(__dirname, '../migrations/001_create_widgets_table.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    console.log('📄 Executing migration: 001_create_widgets_table.sql');

    await client.query(sql);

    console.log('✅ Migration completed successfully!');
    console.log('   - widgets table created');
    console.log('   - RLS policies enabled');
    console.log('   - Triggers and functions created\n');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();

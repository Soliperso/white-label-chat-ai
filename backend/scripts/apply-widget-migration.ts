import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to apply the widget schema migration
 * Run with: npm run ts-node scripts/apply-widget-migration.ts
 */
async function applyMigration() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'chatforge',
  });

  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('Connected successfully');

    const migrationPath = path.join(__dirname, '../migrations/fix_widgets_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration: fix_widgets_schema.sql');
    await dataSource.query(sql);
    console.log('Migration applied successfully!');

    console.log('\nVerifying schema...');
    const result = await dataSource.query(`
      SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'widgets'
      ORDER BY ordinal_position;
    `);

    console.log('\nWidgets table schema:');
    console.table(result);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

applyMigration();

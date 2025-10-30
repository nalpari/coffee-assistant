/**
 * Run Migration Script
 *
 * This script executes the SQL migration file to insert menu and image data.
 * Run this script with: npx tsx scripts/run-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('📥 Starting data insertion via migration...\n');

  try {
    // Read migration file
    console.log('📝 Step 1: Reading migration file...');
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20250030000002_insert_menu_and_image_data.sql');
    const migrationSql = readFileSync(migrationPath, 'utf-8');

    // Split SQL into individual statements (excluding comments)
    const statements = migrationSql
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each INSERT statement
    let menuInserted = 0;
    let imageInserted = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      if (statement.includes('INSERT INTO public.menu')) {
        console.log(`📝 Executing menu insert statement ${i + 1}...`);

        // Count how many rows this will insert
        const valueMatches = statement.match(/\([^)]+\)/g);
        const rowCount = valueMatches ? valueMatches.length - 1 : 0; // -1 for column definition

        const { error } = await supabase.rpc('exec', {
          sql: statement + ';'
        });

        if (error) {
          // Try direct insertion using REST API
          console.log('⚠️  RPC failed, trying direct REST API...');

          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ sql: statement + ';' })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error executing menu insert:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        menuInserted += rowCount;
        console.log(`✅ Inserted ${rowCount} menu records\n`);

      } else if (statement.includes('INSERT INTO public.image')) {
        console.log(`📝 Executing image insert statement ${i + 1}...`);

        // Count how many rows this will insert
        const valueMatches = statement.match(/\([^)]+\)/g);
        const rowCount = valueMatches ? valueMatches.length - 1 : 0; // -1 for column definition

        const { error } = await supabase.rpc('exec', {
          sql: statement + ';'
        });

        if (error) {
          // Try direct insertion using REST API
          console.log('⚠️  RPC failed, trying direct REST API...');

          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ sql: statement + ';' })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error executing image insert:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        imageInserted += rowCount;
        console.log(`✅ Inserted ${rowCount} image records\n`);
      }
    }

    console.log('📊 Insertion summary:');
    console.log(`   - menu records: ${menuInserted} inserted`);
    console.log(`   - image records: ${imageInserted} inserted\n`);

    // Verify insertion
    console.log('📝 Verifying data insertion...');
    const { count: menuCount, error: menuCountError } = await supabase
      .from('menu')
      .select('*', { count: 'exact', head: true });

    const { count: imageCount, error: imageCountError } = await supabase
      .from('image')
      .select('*', { count: 'exact', head: true });

    if (menuCountError || imageCountError) {
      console.error('❌ Error verifying insertion');
      throw menuCountError || imageCountError;
    }

    console.log(`📊 Verified records in database:`);
    console.log(`   - menu table: ${menuCount || 0} records`);
    console.log(`   - image table: ${imageCount || 0} records\n`);

    console.log('✅ Data insertion completed successfully!');

  } catch (error) {
    console.error('\n❌ Data insertion failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();

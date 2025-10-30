/**
 * Database Insert Script
 *
 * This script inserts data from SQL files into menu and image tables.
 * Run this script with: npx tsx scripts/insert-data.ts
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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Parse INSERT SQL statements and convert to JavaScript objects
 */
function parseSQLInsert(sql: string, tableName: string): any[] {
  const results: any[] = [];

  // Find all INSERT statements
  const insertPattern = new RegExp(`INSERT INTO public\\.${tableName}[\\s\\S]*?VALUES([\\s\\S]*?)(?=INSERT INTO|$)`, 'gi');
  const matches = sql.matchAll(insertPattern);

  for (const match of matches) {
    const valuesSection = match[1];

    // Extract column names from the first INSERT statement
    const columnMatch = sql.match(new RegExp(`INSERT INTO public\\.${tableName}\\s*\\(([^)]+)\\)`, 'i'));
    if (!columnMatch) continue;

    const columns = columnMatch[1].split(',').map(col => col.trim());

    // Extract value tuples
    const valuePattern = /\(([^)]+(?:\([^)]*\))?[^)]*)\)/g;
    const valueMatches = valuesSection.matchAll(valuePattern);

    for (const valueMatch of valueMatches) {
      const values = valueMatch[1].split(',').map(val => {
        val = val.trim();

        // Remove quotes and handle NULL
        if (val === 'NULL' || val === 'null') return null;
        if (val.startsWith("'") && val.endsWith("'")) {
          return val.slice(1, -1);
        }
        if (val === 'true') return true;
        if (val === 'false') return false;

        // Try to parse as number
        const num = parseFloat(val);
        if (!isNaN(num)) return num;

        return val;
      });

      // Create object from columns and values
      const obj: any = {};
      columns.forEach((col, idx) => {
        obj[col] = values[idx];
      });

      results.push(obj);
    }
  }

  return results;
}

async function insertData() {
  console.log('📥 Starting data insertion...\n');

  try {
    // Step 1: Read and insert menu data
    console.log('📝 Step 1: Reading menu data from SQL file...');
    const menuSqlPath = join(process.cwd(), 'supabase', 'data', 'menu_202510281452.sql');
    const menuSql = readFileSync(menuSqlPath, 'utf-8');

    console.log('📝 Step 2: Executing menu data insertion...');

    // Execute SQL directly using Supabase's SQL query
    const { data: menuData, error: menuError } = await supabase
      .rpc('exec_sql', {
        query: menuSql
      });

    if (menuError) {
      console.error('❌ Error inserting menu data:', menuError);
      console.log('💡 Trying alternative method with direct client...');

      // Alternative: Use postgrest client
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey!,
          'Authorization': `Bearer ${supabaseServiceKey}`
        } as HeadersInit,
        body: JSON.stringify({ query: menuSql })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    console.log('✅ Menu data inserted successfully\n');

    // Step 2: Read and insert image data
    console.log('📝 Step 3: Reading image data from SQL file...');
    const imageSqlPath = join(process.cwd(), 'supabase', 'data', 'image_202510281454.sql');
    const imageSql = readFileSync(imageSqlPath, 'utf-8');

    console.log('📝 Step 4: Executing image data insertion...');
    const { error: imageError } = await supabase
      .rpc('exec_sql', {
        query: imageSql
      });

    if (imageError) {
      console.error('❌ Error inserting image data:', imageError);
      console.log('💡 Trying alternative method with direct client...');

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey!,
          'Authorization': `Bearer ${supabaseServiceKey}`
        } as HeadersInit,
        body: JSON.stringify({ query: imageSql })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    console.log('✅ Image data inserted successfully\n');

    // Step 3: Verify insertion
    console.log('📝 Step 5: Verifying data insertion...');
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

    console.log(`📊 Inserted records:`);
    console.log(`   - menu table: ${menuCount || 0} records`);
    console.log(`   - image table: ${imageCount || 0} records\n`);

    console.log('✅ Data insertion completed successfully!');

  } catch (error) {
    console.error('\n❌ Data insertion failed:', error);
    process.exit(1);
  }
}

// Run the insertion
insertData();

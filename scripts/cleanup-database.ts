/**
 * Database Cleanup Script
 *
 * This script deletes all data from menu and image tables.
 * Run this script with: npx tsx scripts/cleanup-database.ts
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupDatabase() {
  console.log('🗑️  Starting database cleanup...\n');

  try {
    // Step 1: Delete all data from image table (must be first due to FK)
    console.log('📝 Step 1: Deleting all data from image table...');
    const { error: imageError, count: imageCount } = await supabase
      .from('image')
      .delete()
      .neq('file_uuid', ''); // Delete all records

    if (imageError) {
      console.error('❌ Error deleting from image table:', imageError);
      throw imageError;
    }
    console.log(`✅ Deleted ${imageCount || 0} records from image table\n`);

    // Step 2: Delete all data from menu table
    console.log('📝 Step 2: Deleting all data from menu table...');
    const { error: menuError, count: menuCount } = await supabase
      .from('menu')
      .delete()
      .neq('id', 0); // Delete all records

    if (menuError) {
      console.error('❌ Error deleting from menu table:', menuError);
      throw menuError;
    }
    console.log(`✅ Deleted ${menuCount || 0} records from menu table\n`);

    // Step 3: Verify deletion
    console.log('📝 Step 3: Verifying deletion...');
    const { count: remainingImages, error: verifyImageError } = await supabase
      .from('image')
      .select('*', { count: 'exact', head: true });

    const { count: remainingMenus, error: verifyMenuError } = await supabase
      .from('menu')
      .select('*', { count: 'exact', head: true });

    if (verifyImageError || verifyMenuError) {
      console.error('❌ Error verifying deletion');
      throw verifyImageError || verifyMenuError;
    }

    console.log(`📊 Remaining records:`);
    console.log(`   - image table: ${remainingImages || 0} records`);
    console.log(`   - menu table: ${remainingMenus || 0} records\n`);

    if (remainingImages === 0 && remainingMenus === 0) {
      console.log('✅ Database cleanup completed successfully!');
    } else {
      console.warn('⚠️  Warning: Some records may still remain in the database');
    }

  } catch (error) {
    console.error('\n❌ Database cleanup failed:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupDatabase();

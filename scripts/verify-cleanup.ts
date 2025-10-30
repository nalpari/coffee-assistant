/**
 * Database Verification Script
 *
 * This script verifies that menu and image tables are empty.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyCleanup() {
  console.log('🔍 Verifying database cleanup...\n');

  try {
    // Check image table
    const { count: imageCount, error: imageError } = await supabase
      .from('image')
      .select('*', { count: 'exact', head: true });

    if (imageError) throw imageError;

    // Check menu table
    const { count: menuCount, error: menuError } = await supabase
      .from('menu')
      .select('*', { count: 'exact', head: true });

    if (menuError) throw menuError;

    console.log('📊 Current database state:');
    console.log(`   - image table: ${imageCount || 0} records`);
    console.log(`   - menu table: ${menuCount || 0} records\n`);

    if (imageCount === 0 && menuCount === 0) {
      console.log('✅ Database is clean!');
    } else {
      console.log('⚠️  Warning: Database still contains data');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyCleanup();

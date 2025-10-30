/**
 * Delete Images Script
 *
 * image 테이블의 모든 데이터를 삭제합니다.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env.local manually
const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    envVars[key] = value;
    process.env[key] = value;
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteImages() {
  console.log('🗑️  Starting image table deletion...\n');

  try {
    // Step 1: Check current record count
    console.log('📝 Step 1: Checking current record count...');
    const { count: beforeCount, error: countError } = await supabase
      .from('image')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count query error:', countError);
      throw countError;
    }

    console.log(`✅ Current records: ${beforeCount || 0}`);
    console.log();

    if (beforeCount === 0) {
      console.log('ℹ️  Image table is already empty. Nothing to delete.');
      return;
    }

    // Step 2: Create backup table
    console.log('📝 Step 2: Creating backup table...');
    const backupTableName = `image_backup_${new Date().toISOString().split('T')[0].replace(/-/g, '')}`;

    // Note: Supabase doesn't support CREATE TABLE AS SELECT via client
    // We'll use the migration file instead
    console.log(`ℹ️  Backup will be created via migration: ${backupTableName}`);
    console.log();

    // Step 3: Delete all records
    console.log('📝 Step 3: Deleting all records from image table...');
    const { error: deleteError } = await supabase
      .from('image')
      .delete()
      .neq('file_uuid', ''); // Delete all records (workaround for delete all)

    if (deleteError) {
      console.error('❌ Delete error:', deleteError);
      throw deleteError;
    }

    console.log('✅ All records deleted successfully');
    console.log();

    // Step 4: Verify deletion
    console.log('📝 Step 4: Verifying deletion...');
    const { count: afterCount, error: verifyError } = await supabase
      .from('image')
      .select('*', { count: 'exact', head: true });

    if (verifyError) {
      console.error('❌ Verification error:', verifyError);
      throw verifyError;
    }

    console.log(`✅ Remaining records: ${afterCount || 0}`);
    console.log();

    // Step 5: Summary
    console.log('📊 Deletion summary:');
    console.log(`   - Records before: ${beforeCount || 0}`);
    console.log(`   - Records after: ${afterCount || 0}`);
    console.log(`   - Deleted: ${(beforeCount || 0) - (afterCount || 0)}`);
    console.log();

    if (afterCount === 0) {
      console.log('✅ Image table deletion completed successfully!');
    } else {
      console.log('⚠️  Warning: Some records remain in the table.');
    }

  } catch (error) {
    console.error('\n❌ Image deletion failed:', error);
    process.exit(1);
  }
}

deleteImages();

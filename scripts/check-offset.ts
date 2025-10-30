/**
 * Check Offset Script
 *
 * menu 테이블과 image 테이블의 정확한 오프셋을 계산합니다.
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

async function checkOffset() {
  console.log('🔍 Checking offset between menu and image tables...\n');

  try {
    // Step 1: menu 테이블 ID 범위 확인
    console.log('📝 Step 1: Checking menu table ID range...');
    const { data: menuData, error: menuError } = await supabase
      .from('menu')
      .select('id')
      .order('id', { ascending: true });

    if (menuError) {
      console.error('❌ Menu query error:', menuError);
      throw menuError;
    }

    const menuIds = menuData?.map(m => m.id) || [];
    const minMenuId = Math.min(...menuIds);
    const maxMenuId = Math.max(...menuIds);
    console.log(`✅ Menu IDs: ${minMenuId} ~ ${maxMenuId} (${menuIds.length} records)`);
    console.log();

    // Step 2: image 테이블 menu_id 범위 확인
    console.log('📝 Step 2: Checking image table menu_id range...');
    const { data: imageData, error: imageError } = await supabase
      .from('image')
      .select('menu_id')
      .order('menu_id', { ascending: true });

    if (imageError) {
      console.error('❌ Image query error:', imageError);
      throw imageError;
    }

    const menuIdsInImage = imageData?.map(i => i.menu_id) || [];
    const minImageMenuId = Math.min(...menuIdsInImage);
    const maxImageMenuId = Math.max(...menuIdsInImage);
    console.log(`✅ Image menu_ids: ${minImageMenuId} ~ ${maxImageMenuId} (${menuIdsInImage.length} records)`);
    console.log();

    // Step 3: 오프셋 계산
    console.log('📝 Step 3: Calculating offset...');
    const offset = minMenuId - minImageMenuId;
    console.log(`✅ Calculated offset: ${offset}`);
    console.log(`   → image.menu_id + ${offset} = menu.id`);
    console.log();

    // Step 4: 검증
    console.log('📝 Step 4: Validating offset...');
    const updatedMinImageMenuId = minImageMenuId + offset;
    const updatedMaxImageMenuId = maxImageMenuId + offset;
    console.log(`   After update: image.menu_id range = ${updatedMinImageMenuId} ~ ${updatedMaxImageMenuId}`);
    console.log(`   Menu ID range: ${minMenuId} ~ ${maxMenuId}`);

    if (updatedMinImageMenuId === minMenuId && updatedMaxImageMenuId <= maxMenuId) {
      console.log('✅ Offset validation: PASS');
      console.log('   → All image records will map to existing menu records');
    } else if (updatedMaxImageMenuId > maxMenuId) {
      console.log('⚠️  Warning: Some image records will point to non-existent menu IDs');
      console.log(`   → ${updatedMaxImageMenuId - maxMenuId} records will be orphaned`);
    }
    console.log();

    // Step 5: 유니크 menu_id 개수 확인
    console.log('📝 Step 5: Checking unique menu_ids in image table...');
    const uniqueMenuIds = [...new Set(menuIdsInImage)];
    console.log(`✅ Unique menu_ids: ${uniqueMenuIds.length}`);
    console.log(`   Menu records: ${menuIds.length}`);

    if (uniqueMenuIds.length === menuIds.length) {
      console.log('✅ Perfect match: Each menu has at least one image');
    } else if (uniqueMenuIds.length > menuIds.length) {
      console.log('⚠️  Some images reference non-existent menu records');
    } else {
      console.log('ℹ️  Some menus don\'t have images');
    }
    console.log();

    // Step 6: 추천 SQL
    console.log('📝 Step 6: Recommended SQL migration...');
    console.log('```sql');
    console.log('-- Backup first (IMPORTANT!)');
    console.log('CREATE TABLE image_backup AS SELECT * FROM image;');
    console.log('');
    console.log('-- Update image.menu_id with offset');
    console.log(`UPDATE image SET menu_id = menu_id + ${offset};`);
    console.log('');
    console.log('-- Verify the update');
    console.log('SELECT MIN(menu_id), MAX(menu_id) FROM image;');
    console.log('');
    console.log('-- Restore FK constraint (if needed)');
    console.log('ALTER TABLE image');
    console.log('ADD CONSTRAINT fk_image_menu_id');
    console.log('FOREIGN KEY (menu_id) REFERENCES menu(id)');
    console.log('ON DELETE CASCADE;');
    console.log('```');
    console.log();

    console.log('✅ Offset calculation completed successfully!');

  } catch (error) {
    console.error('\n❌ Offset calculation failed:', error);
    process.exit(1);
  }
}

checkOffset();

/**
 * Test Query Script
 *
 * Supabase 쿼리를 직접 테스트하여 데이터 조회가 정상적으로 작동하는지 확인합니다.
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
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testQuery() {
  console.log('🔍 Testing Supabase query...\n');

  try {
    // Step 1: Check category table
    console.log('📝 Step 1: Checking category table...');
    const { data: categories, error: catError } = await supabase
      .from('category')
      .select('*')
      .eq('status', 'D0101')
      .order('order_no', { ascending: true });

    if (catError) {
      console.error('❌ Category query error:', catError);
      throw catError;
    }

    console.log(`✅ Found ${categories?.length || 0} categories`);
    console.log('Categories:', categories?.map(c => ({ id: c.id, name: c.name })));
    console.log();

    // Step 2: Check menu table
    console.log('📝 Step 2: Checking menu table...');
    const { data: menus, error: menuError } = await supabase
      .from('menu')
      .select('id, name, category_id, status')
      .eq('status', 'E0101')
      .order('order_no', { ascending: true })
      .limit(5);

    if (menuError) {
      console.error('❌ Menu query error:', menuError);
      throw menuError;
    }

    console.log(`✅ Found ${menus?.length || 0} menus (showing first 5)`);
    console.log('Menus:', menus);
    console.log();

    // Step 3: Check image table
    console.log('📝 Step 3: Checking image table...');
    const { data: images, error: imageError } = await supabase
      .from('image')
      .select('*')
      .limit(10);

    if (imageError) {
      console.error('❌ Image query error:', imageError);
      throw imageError;
    }

    console.log(`✅ Found ${images?.length || 0} images (showing first 10)`);
    console.log('Images:', images?.map(i => ({ menu_id: i.menu_id, file_uuid: i.file_uuid })));
    console.log();

    // Step 4: Test the actual query used by the app
    console.log('📝 Step 4: Testing actual app query with JOIN...');
    const { data: fullData, error: fullError } = await supabase
      .from('menu')
      .select(`
        id,
        name,
        description,
        price,
        discount_price,
        cold,
        hot,
        category_id,
        status,
        marketing,
        order_no,
        category:category_id (
          id,
          name
        ),
        image:image (
          file_uuid,
          file_name,
          menu_id,
          menu_type,
          ordering,
          created_by,
          created_date
        )
      `, { count: 'exact' })
      .eq('status', 'E0101')
      .order('order_no', { ascending: true })
      .range(0, 4);

    if (fullError) {
      console.error('❌ Full query error:', fullError);
      throw fullError;
    }

    console.log(`✅ Query successful! Found ${fullData?.length || 0} results`);
    console.log('\n📊 Sample results:');
    fullData?.forEach((item, idx) => {
      console.log(`\n${idx + 1}. ${item.name} (ID: ${item.id})`);
      console.log(`   Category: ${item.category?.name || 'N/A'} (ID: ${item.category_id})`);
      console.log(`   Images: ${Array.isArray(item.image) ? item.image.length : 0}`);
      if (Array.isArray(item.image) && item.image.length > 0) {
        console.log(`   First image: ${item.image[0].file_uuid}`);
      }
    });

    console.log('\n✅ All queries completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testQuery();

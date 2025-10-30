/**
 * Insert Image Data Script
 *
 * supabase/data/image_202510281454.sql 파일을 읽어서
 * menu_id에 오프셋(+149)를 적용하여 image 테이블에 데이터를 삽입합니다.
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

// 오프셋 상수 (이전에 계산된 값)
const MENU_ID_OFFSET = 149;

interface ImageRecord {
  file_uuid: string;
  created_by: string;
  created_date: string;
  file_name: string;
  menu_id: number;
  menu_type: string;
  ordering: number;
}

/**
 * SQL 파일을 파싱하여 image 레코드 배열로 변환
 */
function parseSQLFile(filePath: string): ImageRecord[] {
  const content = readFileSync(filePath, 'utf-8');
  const records: ImageRecord[] = [];

  // VALUES 다음의 데이터를 추출하는 정규식
  const valuePattern = /\('([^']+)','([^']+)','([^']+)','([^']+)',(\d+),'([^']+)',(\d+)\)/g;

  let match;
  while ((match = valuePattern.exec(content)) !== null) {
    const [, file_uuid, created_by, created_date, file_name, menu_id, menu_type, ordering] = match;

    records.push({
      file_uuid,
      created_by,
      created_date,
      file_name,
      menu_id: parseInt(menu_id, 10),
      menu_type,
      ordering: parseInt(ordering, 10),
    });
  }

  return records;
}

async function insertImageData() {
  console.log('📥 Starting image data insertion...\n');

  try {
    // Step 1: SQL 파일 읽기 및 파싱
    console.log('📝 Step 1: Reading and parsing SQL file...');
    const sqlFilePath = join(process.cwd(), 'supabase', 'data', 'image_202510281454.sql');
    const imageRecords = parseSQLFile(sqlFilePath);
    console.log(`✅ Parsed ${imageRecords.length} image records`);
    console.log();

    // Step 2: menu 테이블에서 유효한 ID 범위 확인
    console.log('📝 Step 2: Checking valid menu ID range...');
    const { data: menuData, error: menuError } = await supabase
      .from('menu')
      .select('id')
      .order('id', { ascending: true });

    if (menuError) {
      console.error('❌ Menu query error:', menuError);
      throw menuError;
    }

    const validMenuIds = new Set(menuData?.map(m => m.id) || []);
    const minMenuId = Math.min(...Array.from(validMenuIds));
    const maxMenuId = Math.max(...Array.from(validMenuIds));
    console.log(`✅ Valid menu ID range: ${minMenuId} ~ ${maxMenuId} (${validMenuIds.size} records)`);
    console.log();

    // Step 3: menu_id에 오프셋 적용 및 유효성 검사
    console.log('📝 Step 3: Applying offset to menu_id...');
    console.log(`   Offset: +${MENU_ID_OFFSET}`);

    const validRecords: ImageRecord[] = [];
    const invalidRecords: ImageRecord[] = [];

    imageRecords.forEach(record => {
      const newMenuId = record.menu_id + MENU_ID_OFFSET;

      if (validMenuIds.has(newMenuId)) {
        validRecords.push({
          ...record,
          menu_id: newMenuId,
        });
      } else {
        invalidRecords.push({
          ...record,
          menu_id: newMenuId,
        });
      }
    });

    console.log(`✅ Valid records: ${validRecords.length}`);
    console.log(`⚠️  Invalid records (will be skipped): ${invalidRecords.length}`);
    console.log();

    if (invalidRecords.length > 0) {
      console.log('⚠️  Sample invalid records:');
      invalidRecords.slice(0, 5).forEach(r => {
        console.log(`   - menu_id ${r.menu_id} (original: ${r.menu_id - MENU_ID_OFFSET}): ${r.file_name}`);
      });
      console.log();
    }

    // Step 4: 유효한 레코드만 삽입
    console.log('📝 Step 4: Inserting valid records...');

    if (validRecords.length === 0) {
      console.log('⚠️  No valid records to insert.');
      return;
    }

    // 배치 단위로 삽입 (1000개씩)
    const batchSize = 1000;
    let insertedCount = 0;

    for (let i = 0; i < validRecords.length; i += batchSize) {
      const batch = validRecords.slice(i, i + batchSize);

      const { error: insertError } = await supabase
        .from('image')
        .insert(batch);

      if (insertError) {
        console.error(`❌ Insert error at batch ${Math.floor(i / batchSize) + 1}:`, insertError);
        throw insertError;
      }

      insertedCount += batch.length;
      console.log(`   Inserted ${insertedCount} / ${validRecords.length} records...`);
    }

    console.log('✅ All valid records inserted successfully');
    console.log();

    // Step 5: 삽입 검증
    console.log('📝 Step 5: Verifying insertion...');
    const { count: finalCount, error: countError } = await supabase
      .from('image')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count error:', countError);
      throw countError;
    }

    console.log(`✅ Final record count: ${finalCount || 0}`);
    console.log();

    // Step 6: 샘플 데이터 확인
    console.log('📝 Step 6: Sample inserted data...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('image')
      .select('menu_id, file_name, menu_type, ordering')
      .order('menu_id', { ascending: true })
      .limit(10);

    if (sampleError) {
      console.error('❌ Sample query error:', sampleError);
      throw sampleError;
    }

    console.log('Sample records:');
    sampleData?.forEach((record, idx) => {
      console.log(`   ${idx + 1}. menu_id: ${record.menu_id}, ${record.file_name}`);
    });
    console.log();

    // Step 7: 요약
    console.log('📊 Insertion summary:');
    console.log(`   - Total records in SQL: ${imageRecords.length}`);
    console.log(`   - Valid records inserted: ${insertedCount}`);
    console.log(`   - Invalid records skipped: ${invalidRecords.length}`);
    console.log(`   - Final DB count: ${finalCount || 0}`);
    console.log();

    console.log('✅ Image data insertion completed successfully!');

  } catch (error) {
    console.error('\n❌ Image data insertion failed:', error);
    process.exit(1);
  }
}

insertImageData();

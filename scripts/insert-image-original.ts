/**
 * Insert Image Original Data Script
 *
 * supabase/data/image_202510281454.sql 파일의 데이터를
 * 오프셋 없이 원본 그대로 image 테이블에 삽입합니다.
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

async function insertImageOriginal() {
  console.log('📥 Starting image data insertion (original data, no offset)...\n');

  try {
    // Step 1: 기존 데이터 삭제
    console.log('📝 Step 1: Deleting existing image data...');
    const { count: beforeCount } = await supabase
      .from('image')
      .select('*', { count: 'exact', head: true });

    console.log(`   Current records: ${beforeCount || 0}`);

    if (beforeCount && beforeCount > 0) {
      const { error: deleteError } = await supabase
        .from('image')
        .delete()
        .neq('file_uuid', ''); // Delete all records

      if (deleteError) {
        console.error('❌ Delete error:', deleteError);
        throw deleteError;
      }

      console.log(`✅ Deleted ${beforeCount} existing records`);
    } else {
      console.log('ℹ️  No existing records to delete');
    }
    console.log();

    // Step 2: SQL 파일 읽기 및 파싱
    console.log('📝 Step 2: Reading and parsing SQL file...');
    const sqlFilePath = join(process.cwd(), 'supabase', 'data', 'image_202510301420.sql');
    const imageRecords = parseSQLFile(sqlFilePath);
    console.log(`✅ Parsed ${imageRecords.length} image records`);
    console.log();

    // Step 3: 중복 제거
    console.log('📝 Step 3: Removing duplicates...');
    const uniqueRecords = imageRecords.reduce((acc, record) => {
      const existing = acc.find(r => r.file_uuid === record.file_uuid);
      if (!existing) {
        acc.push(record);
      } else {
        console.log(`   ⚠️  Skipping duplicate: ${record.file_uuid}`);
      }
      return acc;
    }, [] as ImageRecord[]);

    console.log(`✅ Unique records: ${uniqueRecords.length} (removed ${imageRecords.length - uniqueRecords.length} duplicates)`);
    console.log();

    // Step 4: 데이터 삽입 (원본 그대로)
    console.log('📝 Step 4: Inserting image data...');
    console.log('   ℹ️  Inserting data as-is (no menu_id offset applied)');

    // 배치 단위로 삽입 (1000개씩)
    const batchSize = 1000;
    let insertedCount = 0;

    for (let i = 0; i < uniqueRecords.length; i += batchSize) {
      const batch = uniqueRecords.slice(i, i + batchSize);

      const { error: insertError } = await supabase
        .from('image')
        .insert(batch);

      if (insertError) {
        console.error(`❌ Insert error at batch ${Math.floor(i / batchSize) + 1}:`, insertError);
        throw insertError;
      }

      insertedCount += batch.length;
      console.log(`   Inserted ${insertedCount} / ${uniqueRecords.length} records...`);
    }

    console.log('✅ All records inserted successfully');
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

    // Step 6: menu_id 분포 확인
    console.log('📝 Step 6: Checking menu_id distribution...');
    const { data: statsData, error: statsError } = await supabase
      .from('image')
      .select('menu_id')
      .order('menu_id', { ascending: true });

    if (statsError) {
      console.error('❌ Stats query error:', statsError);
      throw statsError;
    }

    const menuIds = statsData?.map(r => r.menu_id) || [];
    const uniqueMenuIds = [...new Set(menuIds)];
    const minMenuId = Math.min(...menuIds);
    const maxMenuId = Math.max(...menuIds);

    console.log(`   menu_id range: ${minMenuId} ~ ${maxMenuId}`);
    console.log(`   Unique menu_ids: ${uniqueMenuIds.length}`);
    console.log();

    // Step 7: 샘플 데이터 확인
    console.log('📝 Step 7: Sample inserted data...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('image')
      .select('menu_id, file_name, menu_type, ordering')
      .order('menu_id', { ascending: true })
      .limit(10);

    if (sampleError) {
      console.error('❌ Sample query error:', sampleError);
      throw sampleError;
    }

    console.log('First 10 records:');
    sampleData?.forEach((record, idx) => {
      console.log(`   ${idx + 1}. menu_id: ${record.menu_id}, type: ${record.menu_type}, ${record.file_name}`);
    });
    console.log();

    // Step 8: 요약
    console.log('📊 Insertion summary:');
    console.log(`   - Total records inserted: ${insertedCount}`);
    console.log(`   - Final DB count: ${finalCount || 0}`);
    console.log(`   - menu_id range: ${minMenuId} ~ ${maxMenuId}`);
    console.log(`   - Unique menu_ids: ${uniqueMenuIds.length}`);
    console.log();

    console.log('✅ Image data insertion completed successfully!');
    console.log();
    console.log('⚠️  Note: Some images may reference menu_ids that do not exist in the menu table.');
    console.log('   This is expected behavior based on the original data structure.');

  } catch (error) {
    console.error('\n❌ Image data insertion failed:', error);
    process.exit(1);
  }
}

insertImageOriginal();

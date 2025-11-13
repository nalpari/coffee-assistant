import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// .env.local 파일 수동 파싱
const envPath = resolve(process.cwd(), '.env.local');
const envFile = readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envFile.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAllOrders() {
  console.log('🗑️  주문 데이터 삭제를 시작합니다...\n');

  try {
    // 1. 먼저 order_items 개수 확인
    const { count: itemsCount, error: itemsCountError } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true });

    if (itemsCountError) {
      console.error('❌ order_items 개수 조회 실패:', itemsCountError);
    } else {
      console.log(`📊 order_items: ${itemsCount}개`);
    }

    // 2. orders 개수 확인
    const { count: ordersCount, error: ordersCountError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (ordersCountError) {
      console.error('❌ orders 개수 조회 실패:', ordersCountError);
    } else {
      console.log(`📊 orders: ${ordersCount}개\n`);
    }

    if (itemsCount === 0 && ordersCount === 0) {
      console.log('✅ 삭제할 데이터가 없습니다.');
      return;
    }

    // 3. order_items 삭제 (외래키 제약으로 인해 먼저 삭제)
    console.log('🗑️  order_items 삭제 중...');
    const { error: deleteItemsError } = await supabase
      .from('order_items')
      .delete()
      .neq('id', 0); // 모든 행 삭제

    if (deleteItemsError) {
      console.error('❌ order_items 삭제 실패:', deleteItemsError);
      throw deleteItemsError;
    }
    console.log('✅ order_items 삭제 완료\n');

    // 4. orders 삭제
    console.log('🗑️  orders 삭제 중...');
    const { error: deleteOrdersError } = await supabase
      .from('orders')
      .delete()
      .neq('id', 0); // 모든 행 삭제

    if (deleteOrdersError) {
      console.error('❌ orders 삭제 실패:', deleteOrdersError);
      throw deleteOrdersError;
    }
    console.log('✅ orders 삭제 완료\n');

    // 5. 삭제 후 확인
    const { count: finalItemsCount } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true });

    const { count: finalOrdersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    console.log('📊 삭제 후 상태:');
    console.log(`   order_items: ${finalItemsCount}개`);
    console.log(`   orders: ${finalOrdersCount}개\n`);

    console.log('✅ 모든 주문 데이터가 성공적으로 삭제되었습니다!');
  } catch (error) {
    console.error('\n❌ 오류 발생:', error);
    process.exit(1);
  }
}

deleteAllOrders();

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import type {
  CreateOrderRequest,
  OrdersResponse,
  OrderFilters,
  Order,
  OrderStatus,
} from '@/types/order';
import type { CartItem } from '@/types/cart';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role client (RLS 우회)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/orders - 주문 목록 조회 (주기적 페칭 지원)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status') as OrderFilters['status'];

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        stores:store_id (
          id,
          name,
          address
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // user_id 필터링 (사용자별 주문만 조회)
    if (session.user.id) {
      query = query.eq('user_id', session.user.id);
    }

    // 상태 필터링
    if (status) {
      query = query.eq('status', status);
    }

    // 페이징
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Orders fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // DB 컬럼명을 타입스크립트 인터페이스 형식으로 변환
    interface OrderRow {
      id: number;
      user_id: string | null;
      order_number: string;
      items: unknown;
      total_amount: number;
      final_amount: number;
      discount_amount: number;
      store_id: number | null;
      status: string;
      order_notes: string | null;
      customer_name: string | null;
      customer_phone: string | null;
      customer_email: string | null;
      created_at: string;
      updated_at: string;
      confirmed_at: string | null;
      completed_at: string | null;
      stores: {
        id: number;
        name: string;
        address: string;
      } | null;
    }

    const orders: Order[] = (data || []).map((row: OrderRow) => ({
      id: row.id,
      userId: row.user_id || undefined,
      orderNumber: row.order_number,
      items: Array.isArray(row.items) ? (row.items as CartItem[]) : undefined,
      totalAmount: row.total_amount || row.final_amount,
      discountAmount: row.discount_amount || undefined,
      finalAmount: row.final_amount,
      storeId: row.store_id || undefined,
      storeName: row.stores?.name || undefined,
      status: row.status as OrderStatus,
      orderNotes: row.order_notes || undefined,
      customerName: row.customer_name || undefined,
      customerPhone: row.customer_phone || undefined,
      customerEmail: row.customer_email || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      confirmedAt: row.confirmed_at || undefined,
      completedAt: row.completed_at || undefined,
    }));

    const response: OrdersResponse = {
      orders,
      total: count || 0,
      page,
      pageSize,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders - 주문 생성
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateOrderRequest = await req.json();
    const {
      items,
      totalAmount,
      discountAmount = 0,
      finalAmount,
      storeId,
      orderNotes,
      customerName,
      customerPhone,
      customerEmail,
    } = body;

    // 유효성 검증
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      );
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Total amount must be greater than 0' },
        { status: 400 }
      );
    }

    // 주문번호 생성 (ORD + YYYYMMDD + 4자리 숫자)
    const dateStr = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD${dateStr}${randomNum}`;

    // 주문 생성
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: session.user.id,
        order_number: orderNumber,
        items,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        store_id: storeId,
        status: 'pending',
        order_notes: orderNotes,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
      })
      .select()
      .single();

    if (error) {
      console.error('Order creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // 응답 변환
    const order: Order = {
      id: data.id,
      userId: data.user_id,
      orderNumber: data.order_number,
      items: data.items,
      totalAmount: data.total_amount,
      discountAmount: data.discount_amount,
      finalAmount: data.final_amount,
      storeId: data.store_id,
      status: data.status,
      orderNotes: data.order_notes,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      customerEmail: data.customer_email,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import type { UpdateOrderStatusRequest, Order } from '@/types/order';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role client (RLS 우회)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/orders/[id] - 주문 상세 조회
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 본인 주문만 조회 가능 (user_id 검증)
    if (data.user_id && data.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 응답 변환
    const order: Order = {
      id: data.id,
      userId: data.user_id,
      orderNumber: data.order_number,
      items: data.items || [],
      totalAmount: data.total_amount || data.final_amount,
      discountAmount: data.discount_amount,
      finalAmount: data.final_amount,
      status: data.status,
      orderNotes: data.order_notes,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      customerEmail: data.customer_email,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      confirmedAt: data.confirmed_at,
      completedAt: data.completed_at,
    };

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order detail API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[id] - 주문 상태 업데이트
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body: UpdateOrderStatusRequest = await req.json();
    const { status } = body;

    // 상태 값 유효성 검증
    const validStatuses = [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'completed',
      'cancelled',
    ];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // 기존 주문 조회 (권한 검증)
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('user_id, status')
      .eq('id', id)
      .single();

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 본인 주문만 수정 가능
    if (existingOrder.user_id && existingOrder.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 상태 업데이트
    const updateData: {
      status: string;
      updated_at: string;
      confirmed_at?: string;
      completed_at?: string;
    } = {
      status,
      updated_at: new Date().toISOString(),
    };

    // 상태별 타임스탬프 업데이트
    if (status === 'confirmed' && !existingOrder.status.includes('confirmed')) {
      updateData.confirmed_at = new Date().toISOString();
    }
    if (status === 'completed' && !existingOrder.status.includes('completed')) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Order update error:', error);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    // 응답 변환
    const order: Order = {
      id: data.id,
      userId: data.user_id,
      orderNumber: data.order_number,
      items: data.items || [],
      totalAmount: data.total_amount || data.final_amount,
      discountAmount: data.discount_amount,
      finalAmount: data.final_amount,
      status: data.status,
      orderNotes: data.order_notes,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      customerEmail: data.customer_email,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      confirmedAt: data.confirmed_at,
      completedAt: data.completed_at,
    };

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

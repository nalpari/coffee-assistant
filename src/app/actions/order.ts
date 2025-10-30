'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'

// =============================================
// 타입 정의
// =============================================

export interface CreateOrderRequest {
  customerName: string
  customerPhone: string
  customerEmail?: string
  items: Array<{
    menuId: number
    menuName: string
    menuPrice: number
    quantity: number
    temperature?: 'hot' | 'cold'
  }>
  totalAmount: number
  discountAmount?: number
  orderNotes?: string
}

export interface CreateOrderResponse {
  success: boolean
  orderId?: number
  orderNumber?: string
  error?: string
}

export interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  total_amount: number
  discount_amount: number
  final_amount: number
  status: string
  order_notes: string | null
  created_at: string
  updated_at: string
  confirmed_at: string | null
  completed_at: string | null
  order_items?: OrderItem[]
  payments?: Payment[]
}

export interface OrderItem {
  id: number
  order_id: number
  menu_id: number
  menu_name: string
  menu_price: number
  quantity: number
  temperature: string | null
  item_price: number
  item_total: number
  created_at: string
}

export interface Payment {
  id: number
  order_id: number
  payment_method: string
  amount: number
  status: string
  mock_transaction_id: string
  mock_approval_number: string | null
  created_at: string
  updated_at: string
}

// =============================================
// 주문 생성 Server Action
// =============================================

/**
 * 주문 생성 Server Action
 *
 * @param request - 주문 생성 요청 데이터
 * @returns 주문 생성 결과
 */
export async function createOrder(
  request: CreateOrderRequest
): Promise<CreateOrderResponse> {
  try {
    // 1. 입력 검증
    if (!request.customerName || !request.customerPhone) {
      return { success: false, error: '주문자 정보를 입력해주세요.' }
    }

    if (!request.items || request.items.length === 0) {
      return { success: false, error: '주문 항목이 없습니다.' }
    }

    // 2. 주문 번호 생성 (예: ORD20250128001)
    const orderNumber = generateOrderNumber()

    // 3. 최종 금액 계산
    const finalAmount = request.totalAmount - (request.discountAmount || 0)

    // 4. orders 테이블에 주문 생성
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: request.customerName,
        customer_phone: request.customerPhone,
        customer_email: request.customerEmail || null,
        total_amount: request.totalAmount,
        discount_amount: request.discountAmount || 0,
        final_amount: finalAmount,
        status: 'pending',
        order_notes: request.orderNotes || null,
      })
      .select()
      .single()

    if (orderError) {
      console.error('주문 생성 실패:', orderError)
      return { success: false, error: '주문 생성에 실패했습니다.' }
    }

    // 5. order_items 테이블에 주문 항목 생성
    const orderItems = request.items.map(item => ({
      order_id: order.id,
      menu_id: item.menuId,
      menu_name: item.menuName,
      menu_price: item.menuPrice,
      quantity: item.quantity,
      temperature: item.temperature || null,
      item_price: item.menuPrice,
      item_total: item.menuPrice * item.quantity,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('주문 항목 생성 실패:', itemsError)
      // 롤백: 주문 삭제
      await supabase.from('orders').delete().eq('id', order.id)
      return { success: false, error: '주문 항목 생성에 실패했습니다.' }
    }

    // 6. 캐시 무효화
    revalidatePath('/orders')

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    }
  } catch (error) {
    console.error('주문 생성 오류:', error)
    return { success: false, error: '주문 처리 중 오류가 발생했습니다.' }
  }
}

// =============================================
// 주문 조회 Server Actions
// =============================================

/**
 * 주문 상세 조회
 *
 * @param orderId - 주문 ID
 * @returns 주문 상세 정보
 */
export async function getOrderById(orderId: number): Promise<Order | null> {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        payments (*)
      `)
      .eq('id', orderId)
      .single()

    if (orderError) {
      console.error('주문 조회 실패:', orderError)
      return null
    }

    return order as Order
  } catch (error) {
    console.error('주문 조회 오류:', error)
    return null
  }
}

/**
 * 주문 번호로 주문 조회
 *
 * @param orderNumber - 주문 번호
 * @returns 주문 상세 정보
 */
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        payments (*)
      `)
      .eq('order_number', orderNumber)
      .single()

    if (orderError) {
      console.error('주문 조회 실패:', orderError)
      return null
    }

    return order as Order
  } catch (error) {
    console.error('주문 조회 오류:', error)
    return null
  }
}

/**
 * 연락처로 주문 목록 조회
 *
 * @param phone - 주문자 연락처
 * @returns 주문 목록
 */
export async function getOrdersByPhone(phone: string): Promise<Order[]> {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        payments (*)
      `)
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('주문 목록 조회 실패:', error)
      return []
    }

    return orders as Order[]
  } catch (error) {
    console.error('주문 목록 조회 오류:', error)
    return []
  }
}

/**
 * 최근 주문 목록 조회 (관리자용)
 *
 * @param limit - 조회 개수
 * @returns 주문 목록
 */
export async function getRecentOrders(limit: number = 50): Promise<Order[]> {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        payments (*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('최근 주문 조회 실패:', error)
      return []
    }

    return orders as Order[]
  } catch (error) {
    console.error('최근 주문 조회 오류:', error)
    return []
  }
}

// =============================================
// 유틸리티 함수
// =============================================

/**
 * 주문 번호 생성 유틸리티
 * 형식: ORD + YYYYMMDD + 4자리 랜덤 숫자
 * 예: ORD202501280001
 */
function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')

  return `ORD${year}${month}${day}${random}`
}

/**
 * 주문 상태 레이블 가져오기
 */
export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '주문 생성',
    paid: '결제 완료',
    confirmed: '주문 확인',
    completed: '완료',
    cancelled: '취소',
  }
  return labels[status] || status
}

/**
 * 주문 상태 색상 가져오기 (Tailwind CSS)
 */
export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

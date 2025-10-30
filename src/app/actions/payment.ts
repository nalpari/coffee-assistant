'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'

// =============================================
// 타입 정의
// =============================================

export interface ProcessPaymentRequest {
  orderId: number
  paymentMethod: 'card' | 'kakao' | 'naver' | 'cash'
  amount: number
}

export interface ProcessPaymentResponse {
  success: boolean
  paymentId?: number
  transactionId?: string
  error?: string
}

// =============================================
// 모의 결제 처리 Server Action
// =============================================

/**
 * 모의 결제 처리 Server Action (항상 성공)
 *
 * MVP 단계에서는 실제 결제 게이트웨이 없이 항상 성공하는 결제를 가정합니다.
 *
 * @param request - 결제 처리 요청 데이터
 * @returns 결제 처리 결과
 */
export async function processPayment(
  request: ProcessPaymentRequest
): Promise<ProcessPaymentResponse> {
  try {
    // 1. 주문 상태 확인
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', request.orderId)
      .single()

    if (orderError || !order) {
      return { success: false, error: '주문을 찾을 수 없습니다.' }
    }

    if (order.status !== 'pending') {
      return { success: false, error: '이미 처리된 주문입니다.' }
    }

    // 2. 금액 검증
    if (request.amount !== order.final_amount) {
      return {
        success: false,
        error: '결제 금액이 주문 금액과 일치하지 않습니다.',
      }
    }

    // 3. 모의 트랜잭션 ID 생성
    const mockTransactionId = generateMockTransactionId()
    const mockApprovalNumber = generateMockApprovalNumber()

    // 4. payments 테이블에 결제 정보 저장 (항상 success)
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: request.orderId,
        payment_method: request.paymentMethod,
        amount: request.amount,
        status: 'success', // MVP: 항상 성공
        mock_transaction_id: mockTransactionId,
        mock_approval_number: mockApprovalNumber,
      })
      .select()
      .single()

    if (paymentError) {
      console.error('결제 정보 저장 실패:', paymentError)
      return { success: false, error: '결제 처리에 실패했습니다.' }
    }

    // 5. 주문 상태 업데이트 (pending → paid)
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', request.orderId)

    if (updateError) {
      console.error('주문 상태 업데이트 실패:', updateError)
      return { success: false, error: '주문 상태 업데이트에 실패했습니다.' }
    }

    // 6. 캐시 무효화
    revalidatePath(`/orders/${request.orderId}`)
    revalidatePath('/orders')

    return {
      success: true,
      paymentId: payment.id,
      transactionId: mockTransactionId,
    }
  } catch (error) {
    console.error('결제 처리 오류:', error)
    return { success: false, error: '결제 처리 중 오류가 발생했습니다.' }
  }
}

// =============================================
// 유틸리티 함수
// =============================================

/**
 * 모의 트랜잭션 ID 생성
 * 형식: TXN + 타임스탬프 + 5자리 랜덤 숫자
 * 예: TXN17406123451234512345
 */
function generateMockTransactionId(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 100000)
  return `TXN${timestamp}${random}`
}

/**
 * 모의 승인 번호 생성
 * 형식: 8자리 숫자
 * 예: 12345678
 */
function generateMockApprovalNumber(): string {
  return Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, '0')
}

/**
 * 결제 방법 레이블 가져오기
 */
export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    card: '신용카드',
    kakao: '카카오페이',
    naver: '네이버페이',
    cash: '현장결제',
  }
  return labels[method] || method
}

/**
 * 결제 상태 레이블 가져오기
 */
export function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    success: '성공',
    pending: '대기',
    failed: '실패',
  }
  return labels[status] || status
}

/**
 * 결제 상태 색상 가져오기 (Tailwind CSS)
 */
export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    success: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

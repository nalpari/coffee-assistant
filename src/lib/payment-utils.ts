/**
 * 결제 방법 레이블 가져오기
 */
export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    card: '신용카드',
    kakao: '카카오페이',
    naver: '네이버페이',
    cash: '현금',
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

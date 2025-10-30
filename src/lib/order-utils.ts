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

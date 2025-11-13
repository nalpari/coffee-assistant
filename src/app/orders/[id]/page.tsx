import { notFound } from 'next/navigation'
import { getOrderById } from '@/app/actions/order'
import { getOrderStatusLabel } from '@/lib/order-utils'
import { getPaymentMethodLabel } from '@/lib/payment-utils'
import { formatPrice } from '@/lib/price-utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OrderHeader } from '@/components/layout/OrderHeader'

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrderById(Number(id))

  if (!order) {
    notFound()
  }

  const payment = order.payments?.[0]

  // 주문 상태별 배지 색상
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default' // 파란색
      case 'preparing':
        return 'secondary' // 회색
      case 'ready':
      case 'completed':
        return 'default' // 파란색
      case 'cancelled':
        return 'secondary' // 회색 (취소된 주문도 파란색 계통으로)
      default:
        return 'secondary'
    }
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* 헤더 */}
      <OrderHeader
        title="주문 상세"
        backHref="/orders"
        rightElement={
          <Badge variant={getStatusBadgeVariant(order.status)}>
            {getOrderStatusLabel(order.status)}
          </Badge>
        }
      />

      {/* 주문 정보 */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 주문 기본 정보 카드 */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500">주문번호</p>
              <p className="text-lg font-semibold">{order.order_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">주문 일시</p>
              <p className="text-base">
                {new Date(order.created_at).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* 매장 정보 */}
          {order.store && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                매장 정보
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">매장명</span>
                  <span className="font-medium">{order.store.name}</span>
                </div>
                {order.store.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">주소</span>
                    <span className="font-medium text-right max-w-[60%]">{order.store.address}</span>
                  </div>
                )}
                {order.store.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">전화번호</span>
                    <span className="font-medium">{order.store.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 주문자 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
              주문자 정보
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">이름</span>
                <span className="font-medium">{order.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">연락처</span>
                <span className="font-medium">{order.customer_phone}</span>
              </div>
              {order.customer_email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">이메일</span>
                  <span className="font-medium">{order.customer_email}</span>
                </div>
              )}
            </div>
          </div>

          {/* 주문 항목 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
              주문 항목
            </h2>
            <div className="space-y-4">
              {order.order_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start pb-4 border-b last:border-b-0 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {item.menu_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.temperature && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                          {item.temperature === 'hot' ? 'HOT' : 'COLD'}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        수량: {item.quantity}개
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.item_total)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      @{formatPrice(item.menu_price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 결제 정보 */}
          {payment && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                결제 정보
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">결제 방법</span>
                  <span className="font-medium">
                    {getPaymentMethodLabel(payment.payment_method)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">거래번호</span>
                  <span className="font-mono text-sm">
                    {payment.mock_transaction_id}
                  </span>
                </div>
                {payment.mock_approval_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">승인번호</span>
                    <span className="font-mono text-sm">
                      {payment.mock_approval_number}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 주문 메모 */}
          {order.order_notes && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                요청사항
              </h2>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {order.order_notes}
              </p>
            </div>
          )}

          {/* 결제 금액 요약 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>주문 금액</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>할인 금액</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    총 결제 금액
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(order.final_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="space-y-3">
            <Link href="/orders" className="block">
              <Button variant="outline" className="w-full py-6 text-lg" size="lg">
                주문 내역으로
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button className="w-full py-6 text-lg" size="lg">
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

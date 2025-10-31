import { notFound } from 'next/navigation'
import { getOrderById } from '@/app/actions/order'
import { getOrderStatusLabel } from '@/lib/order-utils'
import { getPaymentMethodLabel } from '@/lib/payment-utils'
import { formatPrice } from '@/lib/price-utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function OrderCompletePage({
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

  return (
    <div className="container mx-auto px-4 py-8 pb-28">
      <div className="max-w-2xl mx-auto">
        {/* 성공 아이콘 및 헤더 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              주문이 완료되었습니다!
            </h1>
            <p className="text-lg text-gray-600">
              주문번호: <span className="font-semibold">{order.order_number}</span>
            </p>
          </div>

          {/* 주문 정보 */}
          <div className="border-t border-b py-6 space-y-6">
            {/* 주문자 정보 */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                주문자 정보
              </h2>
              <div className="space-y-2">
                <p className="text-gray-900">
                  <span className="font-medium">이름:</span> {order.customer_name}
                </p>
                <p className="text-gray-900">
                  <span className="font-medium">연락처:</span>{' '}
                  {order.customer_phone}
                </p>
                {order.customer_email && (
                  <p className="text-gray-900">
                    <span className="font-medium">이메일:</span>{' '}
                    {order.customer_email}
                  </p>
                )}
              </div>
            </div>

            {/* 주문 항목 */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                주문 항목
              </h2>
              <div className="space-y-3">
                {order.order_items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.menu_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.temperature &&
                          `${item.temperature === 'hot' ? 'HOT' : 'COLD'} | `}
                        수량: {item.quantity}개
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.item_total)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 결제 정보 */}
            {payment && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  결제 정보
                </h2>
                <div className="space-y-2">
                  <p className="text-gray-900">
                    <span className="font-medium">결제 방법:</span>{' '}
                    {getPaymentMethodLabel(payment.payment_method)}
                  </p>
                  <p className="text-sm text-gray-600">
                    거래번호: {payment.mock_transaction_id}
                  </p>
                  {payment.mock_approval_number && (
                    <p className="text-sm text-gray-600">
                      승인번호: {payment.mock_approval_number}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 주문 메모 */}
            {order.order_notes && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  요청사항
                </h2>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {order.order_notes}
                </p>
              </div>
            )}

            {/* 총 결제 금액 */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">
                  총 결제 금액
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(order.final_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">
                  주문 안내
                </h3>
                <p className="mt-1 text-sm text-blue-800">
                  주문하신 음료는 곧 준비됩니다. 연락처로 SMS가 발송될 예정입니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <Link href={`/orders/${order.id}`} className="block">
            <Button variant="outline" className="w-full py-6 text-lg" size="lg">
              주문 상세 보기
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
  )
}

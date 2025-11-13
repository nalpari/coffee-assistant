'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart, cartItemsToOrderItems } from '@/hooks/useCart'
import { formatPrice } from '@/lib/price-utils'
import { createOrder } from '@/app/actions/order'
import { processPayment } from '@/app/actions/payment'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalAmount, clearCart, storeId } = useCart()
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    paymentMethod: 'card' as 'card' | 'kakao' | 'naver' | 'cash',
    orderNotes: '',
  })

  // 클라이언트 사이드에서만 렌더링 (hydration 오류 방지)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      // 1. 주문 생성
      const orderResult = await createOrder({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        storeId: storeId || undefined,  // 매장 ID 전달
        items: cartItemsToOrderItems(items),
        totalAmount: getTotalAmount(),
        discountAmount: 0,
        orderNotes: formData.orderNotes || undefined,
      })

      if (!orderResult.success || !orderResult.orderId) {
        alert(orderResult.error || '주문 생성에 실패했습니다.')
        return
      }

      // 2. 모의 결제 처리
      const paymentResult = await processPayment({
        orderId: orderResult.orderId,
        paymentMethod: formData.paymentMethod,
        amount: getTotalAmount(),
      })

      if (!paymentResult.success) {
        alert(paymentResult.error || '결제 처리에 실패했습니다.')
        return
      }

      // 3. 장바구니 초기화
      clearCart()

      // 4. 주문 완료 페이지로 이동
      router.push(`/orders/${orderResult.orderId}/complete`)
    })
  }

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-4">장바구니가 비어있습니다</h2>
          <p className="text-gray-600 mb-8">
            메뉴를 선택하여 주문을 시작해보세요.
          </p>
          <Link href="/">
            <Button>메뉴 보러가기</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
      <h1 className="text-3xl font-bold mb-8">주문하기</h1>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        {/* 주문자 정보 */}
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">주문자 정보</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="홍길동"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="010-1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                이메일 (선택)
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>
          </div>
        </section>

        {/* 주문 항목 */}
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">주문 항목</h2>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.menuId}-${item.temperature}`}
                className="flex justify-between items-center py-4 border-b last:border-b-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.menuName}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.temperature &&
                      `${item.temperature === 'hot' ? 'HOT' : 'COLD'} | `}
                    수량: {item.quantity}개
                  </p>
                </div>
                <p className="font-semibold text-gray-900 ml-4">
                  {formatPrice(item.menuPrice * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold text-gray-700">총 결제 금액</span>
              <span className="font-bold text-2xl text-blue-600">
                {formatPrice(getTotalAmount())}
              </span>
            </div>
          </div>
        </section>

        {/* 결제 방법 */}
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">결제 방법</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: 'card', label: '신용카드', icon: '💳' },
              { value: 'kakao', label: '카카오페이', icon: '💛' },
              { value: 'naver', label: '네이버페이', icon: '💚' },
              { value: 'cash', label: '현장결제', icon: '💵' },
            ].map((method) => (
              <label
                key={method.value}
                className={`
                  flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${
                    formData.paymentMethod === method.value
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={formData.paymentMethod === method.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentMethod: e.target.value as 'card' | 'kakao' | 'naver' | 'cash',
                    })
                  }
                  className="sr-only"
                />
                <span className="text-3xl mb-2">{method.icon}</span>
                <span className="text-sm font-medium">{method.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* 요청사항 */}
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">요청사항</h2>

          <textarea
            value={formData.orderNotes}
            onChange={(e) =>
              setFormData({ ...formData, orderNotes: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="가게에 전달할 내용을 입력해주세요. (예: 얼음 적게, 시럽 많이 등)"
          />
        </section>

        {/* 주문하기 버튼 */}
        <div className="sticky bottom-4">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full py-6 text-lg font-semibold shadow-lg"
            size="lg"
          >
            {isPending
              ? '주문 처리 중...'
              : `${formatPrice(getTotalAmount())} 결제하기`}
          </Button>
        </div>
      </form>
    </div>
  )
}

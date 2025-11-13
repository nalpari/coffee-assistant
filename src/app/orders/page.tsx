import Link from 'next/link';
import { Home, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrderHeader } from '@/components/layout/OrderHeader';
import { getUserOrders } from '@/app/actions/order';
import { getOrderStatusLabel } from '@/lib/order-utils';
import { getPaymentMethodLabel } from '@/lib/payment-utils';

// 동적 라우트로 설정 (cookies 사용)
export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  // 현재 사용자의 주문만 조회
  const orders = await getUserOrders(50);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 헤더 */}
      <OrderHeader
        title="주문 내역"
        backHref="/"
        rightElement={
          <Link 
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E2E2] transition-colors hover:bg-gray-50 bg-white"
            aria-label="홈으로"
          >
            <Home className="h-[18px] w-[18px] text-[#1C1C1C]" strokeWidth={1.5} />
          </Link>
        }
      />

      {/* 주문 목록 */}
      <div className="container mx-auto px-4 py-6">
        {orders.length === 0 ? (
          // 빈 목록
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Receipt className="h-20 w-20 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-semibold mb-2">주문 내역이 없습니다</p>
            <p className="text-sm text-muted-foreground mb-6">
              메뉴에서 상품을 주문해보세요
            </p>
            <Button asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                홈으로 이동
              </Link>
            </Button>
          </div>
        ) : (
          // 주문 카드 리스트
          <>
            <p className="text-sm text-muted-foreground">
              총 {orders.length}건의 주문 내역
            </p>
            {orders.map((order, index) => {
              const itemCount = order.order_items?.length || 0;
              const firstItem = order.order_items?.[0];
              const payment = order.payments?.[0];

              return (
                <Link 
                  key={order.id} 
                  href={`/orders/${order.id}/complete`}
                  className={`block ${index < orders.length - 1 ? 'mb-6' : ''}`}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            주문번호: {order.order_number}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(order.created_at).toLocaleString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {order.store && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {order.store.name}
                            </p>
                          )}
                        </div>
                        <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
                          {getOrderStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* 주문 상품 요약 */}
                      <div className="text-sm">
                        {firstItem && (
                          <p className="font-medium">
                            {firstItem.menu_name}
                            {itemCount > 1 && ` 외 ${itemCount - 1}건`}
                          </p>
                        )}
                      </div>

                      {/* 결제 정보 */}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <div className="text-sm text-muted-foreground">
                          {payment && getPaymentMethodLabel(payment.payment_method)}
                        </div>
                        <p className="text-lg font-bold text-primary">
                          {order.final_amount.toLocaleString()}원
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

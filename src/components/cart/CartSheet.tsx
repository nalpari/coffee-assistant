'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CartItem } from './CartItem';
import { useCartStore } from '@/store/cart-store';
import { useCart } from '@/hooks/useCart';
import { createOrder } from '@/app/actions/order';
import { processPayment } from '@/app/actions/payment';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId?: number;  // 매장 ID (선택적)
}

export function CartSheet({ open, onOpenChange, storeId: propStoreId }: CartSheetProps) {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } = useCartStore();
  const { storeId: cartStoreId, setStoreId } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // prop으로 전달된 storeId가 있으면 장바구니에 저장
  const currentStoreId = propStoreId || cartStoreId;

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);

    try {
      // prop으로 전달된 storeId가 있으면 장바구니에 저장
      if (propStoreId && propStoreId !== cartStoreId) {
        setStoreId(propStoreId);
      }

      // 1. 주문 생성 (MVP: 고정된 고객 정보 사용)
      const orderResult = await createOrder({
        customerName: 'Guest User',
        customerPhone: '010-0000-0000',
        customerEmail: 'guest@example.com',
        storeId: currentStoreId || undefined,  // 매장 ID 전달
        items: items.map(item => ({
          menuId: item.id,
          menuName: item.name,
          menuPrice: item.discountPrice ?? item.price,
          quantity: item.quantity,
        })),
        totalAmount: totalPrice,
        discountAmount: 0,
      });

      if (!orderResult.success || !orderResult.orderId) {
        alert(orderResult.error || '주문 생성 중 오류가 발생했습니다.');
        return;
      }

      // 2. 결제 처리 (MVP: 항상 성공)
      const paymentResult = await processPayment({
        orderId: orderResult.orderId,
        paymentMethod: 'card', // MVP: 신용카드 고정
        amount: totalPrice,
      });

      if (!paymentResult.success) {
        alert(paymentResult.error || '결제 처리 중 오류가 발생했습니다.');
        return;
      }

      // 3. 장바구니 비우기
      clearCart();

      // 4. 모달 닫기
      onOpenChange(false);

      // 5. 주문 완료 페이지로 이동
      router.push(`/orders/${orderResult.orderId}/complete`);
    } catch (error) {
      console.error('결제 처리 오류:', error);
      alert('주문 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 [&>button]:hidden">
        {/* 접근성을 위한 숨겨진 제목 */}
        <SheetTitle className="sr-only">
          장바구니 {totalItems > 0 && `(${totalItems}개)`}
        </SheetTitle>
        
        {/* 헤더 */}
        <header
          className="sticky top-0 z-50 flex h-[68px] w-full items-center justify-center px-6 relative border-b transition-all duration-300 bg-white"
          style={{
            borderBottomColor: '#EEE',
          }}
        >
          {/* 중앙: 제목 */}
          <h1 
            className="text-center text-xl font-semibold leading-[150%] tracking-[-0.5px]"
            style={{ color: '#1A1A1A' }}
          >
            장바구니 {totalItems > 0 && `(${totalItems}개)`}
          </h1>

          {/* 오른쪽: 닫기 버튼 */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-6 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E2E2] transition-colors hover:bg-gray-50 bg-white"
            aria-label="닫기"
          >
            <X className="h-[18px] w-[18px] text-[#1C1C1C]" strokeWidth={1.5} />
          </button>
        </header>

        {/* 장바구니 내용 */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            // 빈 장바구니
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-semibold mb-2">장바구니가 비어있습니다</p>
              <p className="text-sm text-muted-foreground">
                메뉴에서 원하시는 상품을 담아주세요
              </p>
            </div>
          ) : (
            // 장바구니 아이템 목록
            <div className="py-4">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* 하단 액션 영역 */}
        {items.length > 0 && (
          <div className="border-t pt-4 px-6 pb-6 space-y-4">
            {/* 전체 삭제 버튼 */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={clearCart}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              전체 삭제
            </Button>

            {/* 총 금액 */}
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">상품 금액</span>
                <span className="font-medium">{totalPrice.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">배달비</span>
                <span className="font-medium text-primary">무료</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold">총 결제금액</span>
                <span className="text-lg font-bold text-primary">
                  {totalPrice.toLocaleString()}원
                </span>
              </div>
            </div>

            {/* 주문하기 버튼 */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? '처리 중...' : `${totalPrice.toLocaleString()}원 주문하기`}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

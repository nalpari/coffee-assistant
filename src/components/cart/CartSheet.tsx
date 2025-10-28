'use client';

import { ShoppingCart, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CartItem } from './CartItem';
import { useCartStore } from '@/store/cart-store';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } = useCartStore();

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  const handleCheckout = () => {
    // Phase 4에서 결제 로직 구현 예정
    alert('결제 기능은 Phase 4에서 구현됩니다.');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        {/* 헤더 */}
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            장바구니
            {totalItems > 0 && (
              <span className="text-sm text-muted-foreground">
                ({totalItems}개)
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            주문하실 상품을 확인해주세요
          </SheetDescription>
        </SheetHeader>

        {/* 장바구니 내용 */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
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
          <div className="border-t pt-4 mt-4 space-y-4">
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
            >
              {totalPrice.toLocaleString()}원 주문하기
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

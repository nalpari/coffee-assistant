import type { MenuItemDisplay } from './menu';

/**
 * 장바구니 아이템 (수량 포함)
 */
export interface CartItem extends MenuItemDisplay {
  quantity: number;        // 수량 (최소 1)
  storeId: number;         // 매장 ID (필수)
}

/**
 * 주문 정보
 * 향후 DB 연동 시 order 테이블 생성 예정
 */
export interface Order {
  id: string;              // 주문 고유 ID (UUID)
  items: CartItem[];       // 주문 아이템 목록
  totalPrice: number;      // 총 금액
  timestamp: Date;         // 주문 시간
  status: 'pending' | 'confirmed' | 'completed';
}

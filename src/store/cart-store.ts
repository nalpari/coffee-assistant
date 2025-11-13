import { create } from 'zustand';
import type { MenuItemDisplay } from '@/types/menu';
import type { CartItem } from '@/types/cart';

interface CartStore {
  items: CartItem[];
  storeId: number | null;  // 현재 선택된 매장 ID

  // 아이템 추가 (이미 있으면 수량 증가)
  addItem: (item: MenuItemDisplay, storeId?: number) => void;

  // 아이템 제거
  removeItem: (id: number) => void;

  // 수량 업데이트
  updateQuantity: (id: number, quantity: number) => void;

  // 장바구니 비우기
  clearCart: () => void;

  // 장바구니 전체 설정 (서버 동기화용)
  setItems: (items: CartItem[]) => void;

  // 매장 ID 설정
  setStoreId: (storeId: number | null) => void;

  // 총 금액 계산 (할인가 우선 적용)
  getTotalPrice: () => number;

  // 총 아이템 개수
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  storeId: null,

  addItem: (item, storeId) => {
    const { items, storeId: currentStoreId } = get();
    
    // 매장 ID가 전달되면 저장, 기존 매장과 다르면 장바구니 초기화
    if (storeId !== undefined && storeId !== currentStoreId) {
      if (currentStoreId !== null && items.length > 0) {
        // 다른 매장의 아이템이 이미 있으면 확인 후 초기화
        const shouldClear = window.confirm(
          '다른 매장의 상품이 장바구니에 있습니다. 장바구니를 비우고 새 매장의 상품을 담으시겠습니까?'
        );
        if (shouldClear) {
          set({ items: [], storeId });
        } else {
          return; // 사용자가 취소하면 추가하지 않음
        }
      } else {
        set({ storeId });
      }
    }

    const existingItem = items.find((i) => i.id === item.id);

    if (existingItem) {
      set({
        items: items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ items: [...items, { ...item, quantity: 1 }] });
    }
  },

  removeItem: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) });
  },

  updateQuantity: (id, quantity) => {
    if (quantity < 1) {
      get().removeItem(id);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.id === id ? { ...i, quantity } : i
      ),
    });
  },

  clearCart: () => {
    set({ items: [], storeId: null });
  },

  setItems: (items) => {
    set({ items });
  },

  setStoreId: (storeId) => {
    set({ storeId });
  },

  getTotalPrice: () => {
    return get().items.reduce((sum, item) => {
      // 할인가가 있으면 할인가 사용, 없으면 정가 사용
      const itemPrice = item.discountPrice ?? item.price;
      return sum + itemPrice * item.quantity;
    }, 0);
  },

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

import { create } from 'zustand';
import type { MenuItemDisplay } from '@/types/menu';
import type { CartItem } from '@/types/cart';

interface CartStore {
  items: CartItem[];

  // 아이템 추가 (이미 있으면 수량 증가)
  addItem: (item: MenuItemDisplay) => void;

  // 아이템 제거
  removeItem: (id: number) => void;

  // 수량 업데이트
  updateQuantity: (id: number, quantity: number) => void;

  // 장바구니 비우기
  clearCart: () => void;

  // 총 금액 계산 (할인가 우선 적용)
  getTotalPrice: () => number;

  // 총 아이템 개수
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    const { items } = get();
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
    set({ items: [] });
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

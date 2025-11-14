import { create } from 'zustand';
import type { MenuItemDisplay } from '@/types/menu';
import type { CartItem } from '@/types/cart';
import type { SelectedStore } from '@/types/store';

interface CartStore {
  items: CartItem[];
  storeId: number | null;  // 현재 선택된 매장 ID (하위 호환성 유지)
  selectedStore: SelectedStore | null;  // 매장 상세 정보

  // 아이템 추가 (이미 있으면 수량 증가)
  addItem: (item: MenuItemDisplay, storeId: number) => void;

  // 아이템 제거
  removeItem: (id: number) => void;

  // 수량 업데이트
  updateQuantity: (id: number, quantity: number) => void;

  // 장바구니 비우기
  clearCart: () => void;

  // 장바구니 전체 설정 (서버 동기화용)
  setItems: (items: CartItem[]) => void;

  // 매장 ID 설정 (하위 호환성 유지)
  setStoreId: (storeId: number | null) => void;

  // 매장 상세 정보 설정 (신규)
  setSelectedStore: (store: SelectedStore | null) => void;

  // 총 금액 계산 (할인가 우선 적용)
  getTotalPrice: () => number;

  // 총 아이템 개수
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  storeId: null,
  selectedStore: null,

  addItem: (item, storeId) => {
    const { items } = get();

    // 장바구니가 비어있지 않고, 다른 매장의 메뉴인 경우
    if (items.length > 0 && items[0].storeId !== storeId) {
      // 기존 장바구니 전체 삭제 후 새 메뉴만 추가
      // selectedStore는 유지 (매장 상세 페이지에서 setSelectedStore로 설정됨)
      set({
        items: [{ ...item, quantity: 1, storeId }],
        storeId
      });
      return;
    }

    // 같은 매장이거나 장바구니가 비어있는 경우
    const existingItem = items.find((i) => i.id === item.id);

    if (existingItem) {
      // 이미 있으면 수량 증가
      set({
        items: items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      // 새로 추가
      set({
        items: [...items, { ...item, quantity: 1, storeId }],
        storeId
      });
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
    set({ items: [], storeId: null, selectedStore: null });
  },

  setItems: (items) => {
    set({ items });
  },

  setStoreId: (storeId) => {
    set({ storeId });
  },

  setSelectedStore: (store) => {
    set({
      selectedStore: store,
      storeId: store?.id ?? null,
    });
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

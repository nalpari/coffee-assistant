'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { formatPrice } from '@/lib/price-utils'

// =============================================
// 타입 정의
// =============================================

export interface CartItem {
  menuId: number
  menuName: string
  menuPrice: number
  quantity: number
  temperature?: 'hot' | 'cold'
  image?: string
}

interface CartStore {
  items: CartItem[]
  storeId: number | null  // 현재 선택된 매장 ID
  addItem: (item: CartItem) => void
  removeItem: (menuId: number) => void
  updateQuantity: (menuId: number, quantity: number) => void
  updateTemperature: (menuId: number, temperature: 'hot' | 'cold') => void
  clearCart: () => void
  setStoreId: (storeId: number | null) => void
  getTotalAmount: () => number
  getTotalItems: () => number
  getItemCount: (menuId: number) => number
}

// =============================================
// Zustand Store
// =============================================

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      storeId: null,

      /**
       * 장바구니에 항목 추가
       * 동일한 메뉴가 있으면 수량 증가
       */
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) =>
              i.menuId === item.menuId &&
              i.temperature === item.temperature
          )

          if (existingItem) {
            // 동일 메뉴 + 동일 온도: 수량 증가
            return {
              items: state.items.map((i) =>
                i.menuId === item.menuId &&
                i.temperature === item.temperature
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }

          // 새 항목 추가
          return { items: [...state.items, item] }
        })
      },

      /**
       * 장바구니에서 항목 제거
       */
      removeItem: (menuId) => {
        set((state) => ({
          items: state.items.filter((i) => i.menuId !== menuId),
        }))
      },

      /**
       * 항목 수량 업데이트
       */
      updateQuantity: (menuId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuId)
          return
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.menuId === menuId ? { ...i, quantity } : i
          ),
        }))
      },

      /**
       * 항목 온도 업데이트
       */
      updateTemperature: (menuId, temperature) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.menuId === menuId ? { ...i, temperature } : i
          ),
        }))
      },

      /**
       * 장바구니 비우기
       */
      clearCart: () => {
        set({ items: [], storeId: null })
      },

      /**
       * 매장 ID 설정
       */
      setStoreId: (storeId) => {
        set({ storeId })
      },

      /**
       * 총 금액 계산
       */
      getTotalAmount: () => {
        return get().items.reduce(
          (total, item) => total + item.menuPrice * item.quantity,
          0
        )
      },

      /**
       * 총 항목 수 계산
       */
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      /**
       * 특정 메뉴의 수량 가져오기
       */
      getItemCount: (menuId) => {
        const item = get().items.find((i) => i.menuId === menuId)
        return item ? item.quantity : 0
      },
    }),
    {
      name: 'coffee-cart-storage', // localStorage 키
      // 서버 사이드 렌더링 시 hydration 오류 방지
      skipHydration: true,
    }
  )
)

// =============================================
// 유틸리티 함수
// =============================================

/**
 * 장바구니 항목을 주문 항목 형식으로 변환
 */
export function cartItemsToOrderItems(items: CartItem[]) {
  return items.map((item) => ({
    menuId: item.menuId,
    menuName: item.menuName,
    menuPrice: item.menuPrice,
    quantity: item.quantity,
    temperature: item.temperature,
  }))
}

// formatPrice는 @/lib/price-utils에서 import하여 사용
export { formatPrice }

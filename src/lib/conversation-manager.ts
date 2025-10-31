/**
 * ConversationManager
 * 사용자별 대화 컨텍스트 및 상태 관리
 */

import type {
  ConversationContext,
  ChatMessage,
  UserPurchaseFrequency,
} from '@/types/shopping-agent';
import type { CartItem } from '@/types/cart';

export class ConversationManager {
  private contexts: Map<string, ConversationContext>;

  constructor() {
    this.contexts = new Map();
  }

  /**
   * 컨텍스트 가져오기 (없으면 생성)
   */
  getContext(userId: string): ConversationContext {
    if (!this.contexts.has(userId)) {
      this.contexts.set(userId, {
        userId,
        conversationHistory: [],
        cart: [],
        frequentProducts: [],
        lastActivity: new Date(),
      });
    }

    const context = this.contexts.get(userId)!;
    context.lastActivity = new Date();
    return context;
  }

  /**
   * 컨텍스트 내보내기 (영속성 저장용)
   */
  exportContext(userId: string): ConversationContext | null {
    return this.contexts.get(userId) || null;
  }

  /**
   * 컨텍스트 가져오기 (외부 저장소에서)
   */
  importContext(userId: string, context: ConversationContext): void {
    this.contexts.set(userId, {
      ...context,
      lastActivity: new Date(),
    });
  }

  /**
   * 메시지 추가
   */
  addMessage(userId: string, message: ChatMessage): void {
    const context = this.getContext(userId);
    context.conversationHistory.push(message);

    // 최근 20개 메시지만 유지
    const MAX_MESSAGES = 20;
    if (context.conversationHistory.length > MAX_MESSAGES) {
      context.conversationHistory = context.conversationHistory.slice(-MAX_MESSAGES);
    }
  }

  /**
   * 대화 초기화
   */
  resetConversation(userId: string): void {
    const context = this.getContext(userId);
    context.conversationHistory = [];
  }

  /**
   * 장바구니 업데이트
   */
  updateCart(userId: string, cart: CartItem[]): void {
    const context = this.getContext(userId);
    context.cart = cart;
  }

  /**
   * 장바구니에 아이템 추가
   */
  addToCart(userId: string, item: CartItem): CartItem[] {
    const context = this.getContext(userId);
    const existingItem = context.cart.find((i) => i.id === item.id);

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      context.cart.push(item);
    }

    return context.cart;
  }

  /**
   * 장바구니에서 아이템 제거
   */
  removeFromCart(userId: string, productId: string, quantity?: number): CartItem[] {
    const context = this.getContext(userId);

    if (quantity !== undefined) {
      // 수량만큼 감소
      const item = context.cart.find((i) => i.id.toString() === productId);
      if (item) {
        item.quantity -= quantity;
        if (item.quantity <= 0) {
          context.cart = context.cart.filter((i) => i.id.toString() !== productId);
        }
      }
    } else {
      // 전체 제거
      context.cart = context.cart.filter((i) => i.id.toString() !== productId);
    }

    return context.cart;
  }

  /**
   * 장바구니 비우기
   */
  clearCart(userId: string): void {
    const context = this.getContext(userId);
    context.cart = [];
  }

  /**
   * 자주 구매하는 제품 업데이트
   */
  updateFrequentProducts(userId: string, products: UserPurchaseFrequency[]): void {
    const context = this.getContext(userId);
    context.frequentProducts = products;
  }

  /**
   * 자주 구매하는 제품 초기화
   */
  clearFrequentProducts(userId: string): void {
    const context = this.getContext(userId);
    context.frequentProducts = [];
  }

  /**
   * 장바구니 총액 계산
   */
  getCartTotal(userId: string): number {
    const context = this.getContext(userId);
    return context.cart.reduce((sum, item) => {
      const itemPrice = item.discountPrice ?? item.price;
      return sum + itemPrice * item.quantity;
    }, 0);
  }

  /**
   * 장바구니 아이템 개수
   */
  getCartItemCount(userId: string): number {
    const context = this.getContext(userId);
    return context.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * 컨텍스트 요약
   */
  getContextSummary(userId: string): object {
    const context = this.getContext(userId);
    return {
      userId: context.userId,
      messageCount: context.conversationHistory.length,
      cartItemCount: context.cart.length,
      cartTotal: this.getCartTotal(userId),
      frequentProductsCount: context.frequentProducts.length,
      lastActivity: context.lastActivity,
    };
  }

  /**
   * 오래된 컨텍스트 정리 (1시간 이상)
   */
  cleanupOldContexts(): void {
    const TIMEOUT_MS = 60 * 60 * 1000; // 1시간
    const timeoutDate = new Date(Date.now() - TIMEOUT_MS);

    for (const [userId, context] of this.contexts.entries()) {
      if (context.lastActivity < timeoutDate) {
        this.contexts.delete(userId);
      }
    }
  }
}

// 글로벌 인스턴스
export const conversationManager = new ConversationManager();

// 서버 환경에서만 자동 정리 실행
if (typeof window === 'undefined') {
  const CLEANUP_INTERVAL_MS = 30 * 60 * 1000; // 30분마다
  setInterval(() => {
    conversationManager.cleanupOldContexts();
  }, CLEANUP_INTERVAL_MS);
}

/**
 * Shopping Agent Types
 * Claude AI 기반 쇼핑 어시스턴트 타입 정의
 */

import type { CartItem } from './cart';

/**
 * AI 액션 타입
 */
export type AIAction =
  | 'recommend' // 제품 추천
  | 'add_to_cart' // 장바구니에 추가
  | 'remove_from_cart' // 장바구니에서 제거
  | 'checkout' // 결제 진행
  | 'chat'; // 일반 대화

/**
 * AI 응답
 */
export interface AIResponse {
  action: AIAction;
  message: string;
  products?: Array<{
    id: string;
    quantity: number;
  }>;
}

/**
 * 채팅 메시지 (Shopping Agent용)
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * 구매 빈도 정보
 */
export interface UserPurchaseFrequency {
  user_id: string;
  product_id: string;
  product_name: string;
  price: number;
  purchase_count: number;
  last_purchased: string;
}

/**
 * 대화 컨텍스트
 */
export interface ConversationContext {
  userId: string;
  conversationHistory: ChatMessage[];
  cart: CartItem[];
  frequentProducts: UserPurchaseFrequency[];
  lastActivity: Date;
}

/**
 * 제품 정보 (Shopping Agent용)
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  image_url: string | null;
  created_at: string;
}

/**
 * 채팅 API 요청
 */
export interface ChatRequest {
  message: string;
  cart?: CartItem[];
}

/**
 * 채팅 API 응답
 */
export interface ChatResponse {
  message: string;
  action: AIAction;
  cart: CartItem[];
  products?: Array<{
    id: string;
    quantity: number;
  }>;
}

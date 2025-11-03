/**
 * Shopping Agent Types
 * Claude AI 기반 쇼핑 어시스턴트 타입 정의
 */

import type { CartItem } from './cart';

/**
 * AI 액션 타입 (주문 관리 기능 추가)
 */
export type AIAction =
  | 'recommend' // 제품 추천
  | 'add_to_cart' // 장바구니에 추가
  | 'remove_from_cart' // 장바구니에서 제거
  | 'checkout' // 결제 진행
  | 'get_orders' // 주문 내역 조회 (NEW)
  | 'get_order_status' // 특정 주문 상태 조회 (NEW)
  | 'chat'; // 일반 대화

/**
 * AI 응답 (주문 기능 확장)
 */
export interface AIResponse {
  action: AIAction;
  message: string;
  products?: Array<{
    id: string;
    quantity: number;
  }>;
  orderNumber?: string; // 주문번호 (get_order_status 액션 시) (NEW)
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
 * 주문 정보 (Chat API용)
 */
export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  items: any;
  final_amount: number;
  created_at: string;
  updated_at: string;
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
  orders?: Order[]; // 주문 목록 (get_orders 액션 시) (NEW)
  order?: Order; // 특정 주문 (get_order_status 액션 시) (NEW)
}

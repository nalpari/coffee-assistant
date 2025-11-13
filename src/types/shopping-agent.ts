/**
 * Shopping Agent Types
 * Claude AI 기반 쇼핑 어시스턴트 타입 정의
 */

import type { CartItem } from './cart';
import type { SelectedStore } from './store';

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
  | 'select_store' // 매장 선택 필요 (NEW)
  | 'check_duplicate' // 중복 주문 확인 (NEW)
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
  menuName?: string; // 메뉴명 (select_store 액션 시) (NEW)
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
  selectedStore: SelectedStore | null;  // 현재 선택된 매장 정보 (NEW)
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
  selectedStore?: SelectedStore | null;  // 선택된 매장 정보 (NEW)
  userChoice?: {
    type: 'reorder' | 'new_store';
    orderId?: number;
    storeId?: number;
  }; // 사용자 선택 (중복 주문 확인 시) (NEW)
}

/**
 * 주문 정보 (Chat API용)
 */
export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  items: unknown;
  final_amount: number;
  created_at: string;
  updated_at: string;
}

/**
 * 매장 선택 옵션 (select_store 액션 시)
 */
export interface StoreSelectionOption {
  option1: {
    type: 'recent_order';
    storeId: number;
    storeName: string;
    menuId: number;
    menuName: string;
    orderNumber: string;
    orderDate: Date;
  } | null;
  option2: {
    type: 'nearest_store';
    stores: Array<{
      storeId: number;
      storeName: string;
      menuId: number;
      menuName: string;
      distance?: number;
      distanceFormatted?: string;
      address: string | null;
    }>;
  };
}

/**
 * 중복 주문 정보 (check_duplicate 액션 시)
 */
export interface DuplicateOrderInfo {
  isDuplicate: boolean;
  menuName?: string;
  recentOrder?: {
    orderId: number;
    orderNumber: string;
    menuItems: CartItem[];
    orderDate: string;
    storeId: number;
    storeName: string;
    totalAmount: number;
  };
  nearbyStores?: Array<{
    storeId: number;
    storeName: string;
    address: string | null;
    distance?: string;
    estimatedTime?: string;
  }>;
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
  storeSelection?: StoreSelectionOption; // 매장 선택 옵션 (select_store 액션 시) (NEW)
  menuName?: string; // 메뉴명 (select_store 액션 시) (NEW)
  duplicateInfo?: DuplicateOrderInfo; // 중복 주문 정보 (check_duplicate 액션 시) (NEW)
}

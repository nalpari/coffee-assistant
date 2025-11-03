import type { CartItem } from './cart';

/**
 * 주문 상태 enum
 */
export type OrderStatus =
  | 'pending'      // 주문 접수
  | 'confirmed'    // 주문 확인
  | 'preparing'    // 준비 중
  | 'ready'        // 준비 완료
  | 'completed'    // 픽업 완료
  | 'cancelled';   // 취소됨

/**
 * 주문 상태 라벨 (UI 표시용)
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '주문 접수',
  confirmed: '주문 확인',
  preparing: '준비 중',
  ready: '준비 완료',
  completed: '픽업 완료',
  cancelled: '취소됨',
};

/**
 * 주문 상태 색상 (Tailwind CSS 클래스)
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

/**
 * 주문 데이터 (DB 스키마 반영)
 */
export interface Order {
  id: number;
  userId?: string;              // 선택적 (기존 주문과 호환성)
  orderNumber: string;
  items?: CartItem[];           // JSONB 컬럼 (새로 추가)
  totalAmount: number;          // 기존 컬럼명 사용
  discountAmount?: number;
  finalAmount: number;
  status: OrderStatus;
  orderNotes?: string;
  customerName?: string;        // 기존 컬럼 (선택적)
  customerPhone?: string;       // 기존 컬럼 (선택적)
  customerEmail?: string;       // 기존 컬럼 (선택적)
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
}

/**
 * 주문 생성 요청
 */
export interface CreateOrderRequest {
  items: CartItem[];
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  orderNotes?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

/**
 * 주문 상태 업데이트 요청
 */
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

/**
 * 주문 필터링 옵션
 */
export interface OrderFilters {
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * 주문 목록 응답 (페이징)
 */
export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
}

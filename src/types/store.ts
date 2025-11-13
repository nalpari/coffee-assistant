export interface OpeningHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface Store {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  openingHours?: OpeningHours;
  hasCoupon: boolean;
  hasStamp: boolean;
  menuItems?: string; // 기존 호환성을 위해 유지 (deprecated)
  menuName?: string; // 매장별 메뉴 중 하나 (store_menu에서 가져옴)
  likeCount: number;
  commentCount: number;
  orderCount: number;
  notice?: string; // 매장 공지사항
  status: 'active' | 'inactive' | 'closed';
  distance?: string; // 계산된 값 (클라이언트 사이드)
  walkingTime?: string; // 계산된 값 (클라이언트 사이드)
  createdAt: Date;
  updatedAt: Date;
}

// Supabase 데이터베이스 스키마 타입 (snake_case)
export interface StoreRecord {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  image: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  opening_hours: OpeningHours | null;
  has_coupon: boolean;
  has_stamp: boolean;
  like_count: number;
  comment_count: number;
  order_count: number;
  notice: string | null;
  status: 'active' | 'inactive' | 'closed';
  created_at: string;
  updated_at: string;
}

// API 응답 타입
export interface StoreListResponse {
  data: Store[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// 매장 목록 조회 옵션
export interface GetStoresOptions {
  page?: number;
  pageSize?: number;
  sortBy?: 'nearest' | 'popular' | 'recent';
  userLat?: number;
  userLon?: number;
  search?: string;
  filters?: {
    hasCoupon?: boolean;
    hasStamp?: boolean;
    isOpen?: boolean;
  };
}

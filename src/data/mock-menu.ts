/**
 * 모크 메뉴 데이터
 *
 * 🚨 임시 개발 데이터입니다. 실제 DB 연동 시 API 응답으로 대체됩니다.
 *
 * @purpose MVP 단계에서 프론트엔드 개발을 위한 임시 데이터
 * @replacement Phase 6에서 `src/lib/api/menu.ts`의 getMenuItems() 함수로 대체 예정
 * @dbSchema docs/ddl.md 참조 - 실제 DB 스키마와 동일한 구조 유지
 *
 * ## DB 스키마 기반 데이터 구조
 *
 * - **id**: bigint (auto increment) - DB의 menu.id와 매핑
 * - **price/discountPrice**: int4 (원 단위, 양수) - DB의 price, discount_price와 매핑
 * - **cold/hot**: boolean - DB의 cold, hot과 매핑
 * - **categoryId**: bigint (FK) - DB의 category.id 참조
 *   - 1=COFFEE, 2=NON-COFFEE, 3=SIGNATURE, 4=SMOOTHIE & FRAPPE, 5=ADE & TEA, 6=COLD BREW
 * - **category**: string - DB 조인 결과 (category.name)
 * - **tags**: string[] - DB 조인 결과 (marketing → common_code.name[])
 * - **available**: boolean - DB 계산 필드 (status='E0101')
 * - **popular**: boolean - DB 계산 필드 (marketing @> ARRAY['E0202'])
 *
 * ## 공통코드 매핑
 *
 * ### 메뉴 상태 (status → common_code.id)
 * - E0101: "사용" (MENU_ACTIVE) → available = true
 * - E0102: "미사용" (MENU_INACTIVE) → available = false
 *
 * ### 마케팅 태그 (marketing → common_code.id[])
 * - E0201: "New" (MENU_TYPE_NEW)
 * - E0202: "Best" (MENU_TYPE_BEST) → popular = true
 * - E0203: "Event" (MENU_TYPE_EVENT)
 *
 * @see src/types/menu.ts - 타입 정의
 * @see docs/ddl.md - 실제 데이터베이스 스키마
 */

import type { MenuItemDisplay, CategoryInfo } from '@/types/menu';

/**
 * 모크 메뉴 아이템 목록
 *
 * @dbEquivalent SELECT
 *   m.*,
 *   c.name as category,
 *   i.file_name as image,
 *   ARRAY_AGG(cc.name) as tags,
 *   (m.status = 'E0101') as available,
 *   ('E0202' = ANY(m.marketing)) as popular
 * FROM menu m
 * LEFT JOIN category c ON m.category_id = c.id
 * LEFT JOIN image i ON m.id = i.menu_id AND i.ordering = 0
 * LEFT JOIN common_code cc ON cc.id = ANY(m.marketing)
 * WHERE m.status = 'E0101'
 * GROUP BY m.id, c.name, i.file_name
 * ORDER BY m.order_no ASC;
 */
export const mockMenuItems: MenuItemDisplay[] = [
  {
    /**
     * @dbTable menu
     * @dbRow id=87, category_id=1, status='E0101', marketing='{}'
     */
    id: 87,
    name: '아메리카노 HOT',
    description: 'SPECIALTY로 즐기는 특별한 한잔!',
    price: 1500,
    discountPrice: undefined,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500',
    images: [],
    category: 'COFFEE',
    categoryId: 1,
    tags: [],
    available: true,
    popular: false,
    cold: false,
    hot: true,
    orderNo: 1,
  },
  {
    /**
     * @dbTable menu
     * @dbRow id=88, category_id=1, status='E0101', marketing='{}'
     */
    id: 88,
    name: '아메리카노 ICE',
    description: 'SPECIALTY로 즐기는 특별한 한잔!',
    price: 2000,
    discountPrice: undefined,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500',
    images: [],
    category: 'COFFEE',
    categoryId: 1,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: false,
    orderNo: 2,
  },
  {
    /**
     * @dbTable menu
     * @dbRow id=92, category_id=1, status='E0101', marketing='{}'
     */
    id: 92,
    name: '카페라떼',
    description: '원두선택 가능, HOT/ICE',
    price: 7200,
    discountPrice: undefined,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500',
    images: [],
    category: 'COFFEE',
    categoryId: 1,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: true,
    orderNo: 7,
  },
  {
    /**
     * @dbTable menu
     * @dbRow id=120, category_id=3, status='E0101', marketing='{"E0202"}'
     * @note marketing='{"E0202"}' → popular=true, tags=['Best']
     */
    id: 120,
    name: '흑임자크림라떼',
    description: '고소하고 부드럽게, 힘이나 No.1 signature',
    price: 4200,
    discountPrice: undefined,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
    images: [],
    category: 'SIGNATURE',
    categoryId: 3,
    tags: ['Best'],
    available: true,
    popular: true,
    cold: true,
    hot: false,
    orderNo: 1,
  },
  {
    /**
     * @dbTable menu
     * @dbRow id=129, category_id=4, status='E0101', marketing='{}'
     */
    id: 129,
    name: '밀크퐁프라페',
    description: '퐁프라페 플레인',
    price: 3900,
    discountPrice: undefined,
    image: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=500',
    images: [],
    category: 'SMOOTHIE & FRAPPE',
    categoryId: 4,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: false,
    orderNo: 14,
  },
  {
    /**
     * @dbTable menu
     * @dbRow id=115, category_id=2, status='E0101', marketing='{}'
     */
    id: 115,
    name: '말차라떼',
    description: 'HOT/ICE',
    price: 3200,
    discountPrice: undefined,
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=500',
    images: [],
    category: 'NON-COFFEE',
    categoryId: 2,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: true,
    orderNo: 3,
  },
  {
    /**
     * @dbTable menu
     * @dbRow id=142, category_id=4, status='E0101', marketing='{"E0201"}'
     * @note marketing='{"E0201"}' → tags=['New']
     */
    id: 142,
    name: '딸기요거트스무디',
    description: '딸기요거트스무디',
    price: 4200,
    discountPrice: undefined,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500',
    images: [],
    category: 'SMOOTHIE & FRAPPE',
    categoryId: 4,
    tags: ['New'],
    available: true,
    popular: false,
    cold: true,
    hot: false,
    orderNo: 2,
  },
  {
    /**
     * @dbTable menu
     * @dbRow id=161, category_id=6, status='E0101', marketing='{}'
     */
    id: 161,
    name: '콜드브루',
    description: 'ICE only',
    price: 3300,
    discountPrice: undefined,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500',
    images: [],
    category: 'COLD BREW',
    categoryId: 6,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: false,
    orderNo: 1,
  },
];

/**
 * 카테고리 정보
 *
 * @dbEquivalent SELECT id, name, order_no, status
 * FROM category
 * WHERE status = 'D0101'
 * ORDER BY order_no ASC;
 */
export const mockCategories: CategoryInfo[] = [
  {
    /**
     * @dbTable category
     * @dbRow id=1, status='D0101', order_no=1
     */
    id: 1,
    name: 'COFFEE',
    orderNo: 1,
    status: 'D0101',
    icon: 'Coffee',
    createdBy: 'system',
    createdDate: new Date('2025-01-01'),
  },
  {
    /**
     * @dbTable category
     * @dbRow id=2, status='D0101', order_no=2
     */
    id: 2,
    name: 'NON-COFFEE',
    orderNo: 2,
    status: 'D0101',
    icon: 'Droplet',
    createdBy: 'system',
    createdDate: new Date('2025-01-01'),
  },
  {
    /**
     * @dbTable category
     * @dbRow id=3, status='D0101', order_no=3
     */
    id: 3,
    name: 'SIGNATURE',
    orderNo: 3,
    status: 'D0101',
    icon: 'Star',
    createdBy: 'system',
    createdDate: new Date('2025-01-01'),
  },
  {
    /**
     * @dbTable category
     * @dbRow id=4, status='D0101', order_no=4
     */
    id: 4,
    name: 'SMOOTHIE & FRAPPE',
    orderNo: 4,
    status: 'D0101',
    icon: 'IceCream',
    createdBy: 'system',
    createdDate: new Date('2025-01-01'),
  },
  {
    /**
     * @dbTable category
     * @dbRow id=5, status='D0101', order_no=5
     */
    id: 5,
    name: 'ADE & TEA',
    orderNo: 5,
    status: 'D0101',
    icon: 'Coffee',
    createdBy: 'system',
    createdDate: new Date('2025-01-01'),
  },
  {
    /**
     * @dbTable category
     * @dbRow id=6, status='D0101', order_no=6
     */
  id: 6,
    name: 'COLD BREW',
    orderNo: 6,
    status: 'D0101',
    icon: 'Coffee',
    createdBy: 'system',
    createdDate: new Date('2025-01-01'),
  },
];

/**
 * 🔄 API 전환 계획 (Phase 6 - 백엔드 연동)
 *
 * 아래 함수들은 향후 실제 API로 대체됩니다.
 * Mock 데이터 대신 Supabase API 또는 REST API를 호출하게 됩니다.
 */

/**
 * TODO: Phase 6에서 아래 함수로 대체
 *
 * @futureImplementation
 * ```typescript
 * // src/lib/api/menu.ts
 * export async function getMenuItems(): Promise<MenuItemDisplay[]> {
 *   const response = await fetch('/api/menu', {
 *     method: 'GET',
 *     headers: { 'Content-Type': 'application/json' },
 *   });
 *
 *   if (!response.ok) {
 *     throw new Error('Failed to fetch menu items');
 *   }
 *
 *   return response.json();
 * }
 * ```
 */

/**
 * TODO: Phase 6에서 아래 함수로 대체
 *
 * @futureImplementation
 * ```typescript
 * // src/lib/api/menu.ts
 * export async function getCategories(): Promise<CategoryInfo[]> {
 *   const response = await fetch('/api/categories', {
 *     method: 'GET',
 *     headers: { 'Content-Type': 'application/json' },
 *   });
 *
 *   if (!response.ok) {
 *     throw new Error('Failed to fetch categories');
 *   }
 *
 *   return response.json();
 * }
 * ```
 */

/**
 * TODO: Phase 6에서 아래 함수로 대체
 *
 * @futureImplementation
 * ```typescript
 * // src/lib/api/menu.ts
 * export async function getMenuItemById(id: number): Promise<MenuItemDisplay> {
 *   const response = await fetch(`/api/menu/${id}`, {
 *     method: 'GET',
 *     headers: { 'Content-Type': 'application/json' },
 *   });
 *
 *   if (!response.ok) {
 *     throw new Error(`Failed to fetch menu item: ${id}`);
 *   }
 *
 *   return response.json();
 * }
 * ```
 */

/**
 * 타입 호환성 검증 (컴파일 타임)
 *
 * Mock 데이터가 실제 타입과 일치하는지 확인합니다.
 * 타입 에러가 발생하면 DB 스키마와 불일치함을 의미합니다.
 */
const _typeCheck: MenuItemDisplay = mockMenuItems[0];
const _categoryTypeCheck: CategoryInfo = mockCategories[0];

// 컴파일러에게 사용되지 않는 변수임을 알림
void _typeCheck;
void _categoryTypeCheck;

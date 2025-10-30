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
    image: 'http://3.35.189.180/minio/images/menu/f09adbe2-5822-41ce-8628-d1c04c365666.png',
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
    image: 'http://3.35.189.180/minio/images/menu/999debbb-c0a2-4ccc-9959-3fd76504a8dc.png',
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
    image: 'http://3.35.189.180/minio/images/menu/86efdef7-f226-4e2e-910d-b82365b90dcc.png',
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
    image: 'http://3.35.189.180/minio/images/menu/2c980373-fa1f-482e-8087-aa91e0e37046.png',
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
    image: 'http://3.35.189.180/minio/images/menu/9959cb3b-9e59-4022-b193-dc125a28ff2a.png',
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
    image: 'http://3.35.189.180/minio/images/menu/da968cc7-1a79-4470-af67-7d549ebc9b83.png',
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
    image: 'http://3.35.189.180/minio/images/menu/c5e92630-fb9b-444e-a65d-ebd36a0b93ac.png',
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
    image: 'http://3.35.189.180/minio/images/menu/904c3293-7a39-4fd7-a0d7-ad47cdcbed18.png',
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
  {
    id: 89,
    name: '꿀아메리카노 ICE',
    description: 'SPECIALTY로 즐기는 특별한 한잔!',
    price: 2500,
    discountPrice: undefined,
    image: 'http://3.35.189.180/minio/images/menu/fefcfad5-10f7-4f30-997f-1412d1354ce7.png',
    images: [],
    category: 'COFFEE',
    categoryId: 1,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: false,
    orderNo: 3,
  },
  {
    id: 90,
    name: '헤이즐넛 아메리카노 ICE',
    description: 'SPECIALTY로 즐기는 특별한 한잔!',
    price: 2800,
    discountPrice: undefined,
    image: 'http://3.35.189.180/minio/images/menu/fc24dbde-4cfa-4f7e-a543-ad76ea82d52a.png',
    images: [],
    category: 'COFFEE',
    categoryId: 1,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: false,
    orderNo: 4,
  },
  {
    id: 93,
    name: '바닐라라떼 ICE',
    description: 'HOT/ICE',
    price: 3500,
    discountPrice: undefined,
    image: 'http://3.35.189.180/minio/images/menu/74ae654c-7f38-4aea-a707-663099116dd7.png',
    images: [],
    category: 'COFFEE',
    categoryId: 1,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: true,
    orderNo: 8,
  },
  {
    id: 94,
    name: '헤이즐넛라떼 ICE',
    description: 'HOT/ICE',
    price: 3600,
    discountPrice: undefined,
    image: 'http://3.35.189.180/minio/images/menu/db035215-3897-4f39-b88b-7ec2187d79d1.png',
    images: [],
    category: 'COFFEE',
    categoryId: 1,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: true,
    orderNo: 9,
  },
  {
    id: 95,
    name: '연유라떼 ICE',
    description: 'HOT/ICE',
    price: 3500,
    discountPrice: undefined,
    image: 'http://3.35.189.180/minio/images/menu/f5a65fcf-4e9c-485a-b8e5-cecf70382127.png',
    images: [],
    category: 'COFFEE',
    categoryId: 1,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: true,
    orderNo: 10,
  },
  {
    id: 97,
    name: '티라미수라떼',
    description: 'HOT/ICE',
    price: 4000,
    discountPrice: undefined,
    image: 'http://3.35.189.180/minio/images/menu/a8cb4520-0d53-4039-82b7-a254b058510f.png',
    images: [],
    category: 'COFFEE',
    categoryId: 1,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: true,
    orderNo: 11,
  },
  {
    id: 98,
    name: '카푸치노 ICE',
    description: 'HOT/ICE',
    price: 3300,
    discountPrice: undefined,
    image: 'http://3.35.189.180/minio/images/menu/f447f145-7dbb-4e37-a9dc-e79178e85d1e.png',
    images: [],
    category: 'COFFEE',
    categoryId: 1,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: true,
    orderNo: 12,
  },
  {
    id: 99,
    name: '카페모카 ICE',
    description: 'HOT/ICE',
    price: 3800,
    discountPrice: undefined,
    image: 'http://3.35.189.180/minio/images/menu/2f4fa559-dd6a-4aff-90ab-1438d3aae984.png',
    images: [],
    category: 'COFFEE',
    categoryId: 1,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: true,
    orderNo: 13,
  },
  {
    id: 100,
    name: '카라멜마끼아또 ICE',
    description: 'HOT/ICE',
    price: 4000,
    discountPrice: undefined,
    image: 'http://3.35.189.180/minio/images/menu/406d0633-86a2-4c3a-b935-7d16a1295fed.png',
    images: [],
    category: 'COFFEE',
    categoryId: 1,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: true,
    orderNo: 14,
  },
  {
    id: 101,
    name: '큐브라떼',
    description: 'ICE only',
    price: 3800,
    discountPrice: undefined,
    image: 'http://3.35.189.180/minio/images/menu/8832e7b6-ac17-45b7-a4cc-cfb8700d044f.png',
    images: [],
    category: 'COFFEE',
    categoryId: 1,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: false,
    orderNo: 15,
  },
  {
    id: 102,
    name: '힘이나커피',
    description: 'HOT/ICE',
    price: 3500,
    discountPrice: undefined,
    image: 'http://3.35.189.180/minio/images/menu/2ed51061-c571-47c2-a0fc-f6064395f068.png',
    images: [],
    category: 'COFFEE',
    categoryId: 1,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: true,
    orderNo: 16,
  },
  {
    id: 103,
    name: '민트카페모카 ICE',
    description: 'ICE only',
    price: 4000,
    discountPrice: undefined,
    image: 'http://3.35.189.180/minio/images/menu/450f03be-4500-4e19-8dc4-324976032f99.png',
    images: [],
    category: 'COFFEE',
    categoryId: 1,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: false,
    orderNo: 17,
  },
  {
    id: 104,
    name: '달고나라떼',
    description: 'HOT/ICE',
    price: 3800,
    discountPrice: undefined,
    image: 'http://3.35.189.180/minio/images/menu/b2f1569e-c8c2-49fe-a4c4-487a92d7eab1.png',
    images: [],
    category: 'COFFEE',
    categoryId: 1,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: true,
    orderNo: 18,
  },
  {
    id: 162,
    name: '크림콜드브루',
    description: 'ICE only',
    price: 3800,
    discountPrice: undefined,
    image: 'http://3.35.189.180/minio/images/menu/e28860d9-3d5a-4e30-b08a-1eaf1617141d.png',
    images: [],
    category: 'COLD BREW',
    categoryId: 6,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: false,
    orderNo: 2,
  },
  {
    id: 163,
    name: '콜드브루라떼',
    description: 'ICE only',
    price: 3600,
    discountPrice: undefined,
    image: 'http://3.35.189.180/minio/images/menu/eb14433f-7fbf-4030-a6ab-eedc53ac15da.png',
    images: [],
    category: 'COLD BREW',
    categoryId: 6,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: false,
    orderNo: 3,
  },
  {
    id: 114,
    name: '초코라떼 ICE',
    description: 'HOT/ICE',
    price: 3200,
    discountPrice: undefined,
    image: 'http://3.35.189.180/minio/images/menu/5085a927-97bf-4f90-83d8-d3f56bf67608.png',
    images: [],
    category: 'NON-COFFEE',
    categoryId: 2,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: true,
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

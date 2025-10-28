/**
 * 메뉴 API 함수 (향후 구현 예정)
 *
 * 이 파일은 Phase 6(백엔드 연동)에서 구현됩니다.
 * 현재는 주석으로 계획만 명시하고, Mock 데이터를 반환합니다.
 *
 * @phase Phase 6 - 백엔드 연동
 * @backend Supabase 또는 REST API
 * @see src/data/mock-menu.ts - 현재 Mock 데이터
 */

import type { MenuItemDisplay, CategoryInfo } from '@/types/menu';
import { mockMenuItems, mockCategories } from '@/data/mock-menu';

/**
 * 메뉴 아이템 목록 조회
 *
 * @returns {Promise<MenuItemDisplay[]>} 메뉴 아이템 목록
 *
 * @dbQuery
 * ```sql
 * SELECT
 *   m.id,
 *   m.name,
 *   m.description,
 *   m.price,
 *   m.discount_price,
 *   m.cold,
 *   m.hot,
 *   m.category_id,
 *   m.order_no,
 *   c.name as category,
 *   COALESCE(i.file_name, '') as image,
 *   ARRAY_AGG(cc.name) FILTER (WHERE cc.name IS NOT NULL) as tags,
 *   (m.status = 'E0101') as available,
 *   ('E0202' = ANY(m.marketing)) as popular
 * FROM menu m
 * LEFT JOIN category c ON m.category_id = c.id
 * LEFT JOIN LATERAL (
 *   SELECT file_name
 *   FROM image
 *   WHERE menu_id = m.id
 *   ORDER BY ordering ASC
 *   LIMIT 1
 * ) i ON true
 * LEFT JOIN common_code cc ON cc.id = ANY(m.marketing)
 * WHERE m.status = 'E0101'
 * GROUP BY m.id, c.name, i.file_name
 * ORDER BY m.order_no ASC;
 * ```
 *
 * @example
 * ```typescript
 * // 사용 예시
 * const menuItems = await getMenuItems();
 * console.log(menuItems); // MenuItemDisplay[]
 * ```
 *
 * @futureImplementation Phase 6
 * ```typescript
 * export async function getMenuItems(): Promise<MenuItemDisplay[]> {
 *   try {
 *     const response = await fetch('/api/menu', {
 *       method: 'GET',
 *       headers: {
 *         'Content-Type': 'application/json',
 *       },
 *       cache: 'no-store', // 또는 next: { revalidate: 60 }
 *     });
 *
 *     if (!response.ok) {
 *       throw new Error(`Failed to fetch menu items: ${response.statusText}`);
 *     }
 *
 *     const data: MenuItemDisplay[] = await response.json();
 *     return data;
 *   } catch (error) {
 *     console.error('Error fetching menu items:', error);
 *     throw error;
 *   }
 * }
 * ```
 */
export async function getMenuItems(): Promise<MenuItemDisplay[]> {
  // 🚨 임시: Mock 데이터 반환 (Phase 6에서 실제 API 호출로 대체)
  return Promise.resolve(mockMenuItems);
}

/**
 * 카테고리 목록 조회
 *
 * @returns {Promise<CategoryInfo[]>} 카테고리 목록
 *
 * @dbQuery
 * ```sql
 * SELECT
 *   id,
 *   name,
 *   order_no,
 *   status
 * FROM category
 * WHERE status = 'D0101'
 * ORDER BY order_no ASC;
 * ```
 *
 * @example
 * ```typescript
 * // 사용 예시
 * const categories = await getCategories();
 * console.log(categories); // CategoryInfo[]
 * ```
 *
 * @futureImplementation Phase 6
 * ```typescript
 * export async function getCategories(): Promise<CategoryInfo[]> {
 *   try {
 *     const response = await fetch('/api/categories', {
 *       method: 'GET',
 *       headers: {
 *         'Content-Type': 'application/json',
 *       },
 *       cache: 'force-cache', // 카테고리는 자주 변경되지 않으므로 캐싱
 *     });
 *
 *     if (!response.ok) {
 *       throw new Error(`Failed to fetch categories: ${response.statusText}`);
 *     }
 *
 *     const data: CategoryInfo[] = await response.json();
 *     return data;
 *   } catch (error) {
 *     console.error('Error fetching categories:', error);
 *     throw error;
 *   }
 * }
 * ```
 */
export async function getCategories(): Promise<CategoryInfo[]> {
  // 🚨 임시: Mock 데이터 반환 (Phase 6에서 실제 API 호출로 대체)
  return Promise.resolve(mockCategories);
}

/**
 * 메뉴 아이템 단건 조회
 *
 * @param {number} id - 메뉴 아이템 ID
 * @returns {Promise<MenuItemDisplay>} 메뉴 아이템
 *
 * @dbQuery
 * ```sql
 * SELECT
 *   m.id,
 *   m.name,
 *   m.description,
 *   m.price,
 *   m.discount_price,
 *   m.cold,
 *   m.hot,
 *   m.category_id,
 *   m.order_no,
 *   c.name as category,
 *   COALESCE(
 *     (SELECT json_agg(json_build_object(
 *       'fileUuid', file_uuid,
 *       'fileName', file_name,
 *       'ordering', ordering
 *     ))
 *     FROM image
 *     WHERE menu_id = m.id
 *     ORDER BY ordering ASC),
 *     '[]'::json
 *   ) as images,
 *   ARRAY_AGG(cc.name) FILTER (WHERE cc.name IS NOT NULL) as tags,
 *   (m.status = 'E0101') as available,
 *   ('E0202' = ANY(m.marketing)) as popular
 * FROM menu m
 * LEFT JOIN category c ON m.category_id = c.id
 * LEFT JOIN common_code cc ON cc.id = ANY(m.marketing)
 * WHERE m.id = $1
 * GROUP BY m.id, c.name;
 * ```
 *
 * @example
 * ```typescript
 * // 사용 예시
 * const menuItem = await getMenuItemById(87);
 * console.log(menuItem); // MenuItemDisplay
 * ```
 *
 * @futureImplementation Phase 6
 * ```typescript
 * export async function getMenuItemById(id: number): Promise<MenuItemDisplay> {
 *   try {
 *     const response = await fetch(`/api/menu/${id}`, {
 *       method: 'GET',
 *       headers: {
 *         'Content-Type': 'application/json',
 *       },
 *       cache: 'no-store',
 *     });
 *
 *     if (!response.ok) {
 *       throw new Error(`Failed to fetch menu item ${id}: ${response.statusText}`);
 *     }
 *
 *     const data: MenuItemDisplay = await response.json();
 *     return data;
 *   } catch (error) {
 *     console.error(`Error fetching menu item ${id}:`, error);
 *     throw error;
 *   }
 * }
 * ```
 */
export async function getMenuItemById(id: number): Promise<MenuItemDisplay | null> {
  // 🚨 임시: Mock 데이터에서 검색 (Phase 6에서 실제 API 호출로 대체)
  const item = mockMenuItems.find((item) => item.id === id);
  return Promise.resolve(item || null);
}

/**
 * 카테고리별 메뉴 아이템 조회
 *
 * @param {number} categoryId - 카테고리 ID
 * @returns {Promise<MenuItemDisplay[]>} 메뉴 아이템 목록
 *
 * @dbQuery
 * ```sql
 * -- getMenuItems와 동일하지만 WHERE 절에 category_id 조건 추가
 * WHERE m.status = 'E0101' AND m.category_id = $1
 * ```
 *
 * @example
 * ```typescript
 * // 사용 예시
 * const coffeeItems = await getMenuItemsByCategory(1); // COFFEE
 * console.log(coffeeItems); // MenuItemDisplay[]
 * ```
 *
 * @futureImplementation Phase 6
 * ```typescript
 * export async function getMenuItemsByCategory(categoryId: number): Promise<MenuItemDisplay[]> {
 *   try {
 *     const response = await fetch(`/api/menu?categoryId=${categoryId}`, {
 *       method: 'GET',
 *       headers: {
 *         'Content-Type': 'application/json',
 *       },
 *       cache: 'no-store',
 *     });
 *
 *     if (!response.ok) {
 *       throw new Error(`Failed to fetch menu items for category ${categoryId}: ${response.statusText}`);
 *     }
 *
 *     const data: MenuItemDisplay[] = await response.json();
 *     return data;
 *   } catch (error) {
 *     console.error(`Error fetching menu items for category ${categoryId}:`, error);
 *     throw error;
 *   }
 * }
 * ```
 */
export async function getMenuItemsByCategory(categoryId: number): Promise<MenuItemDisplay[]> {
  // 🚨 임시: Mock 데이터에서 필터링 (Phase 6에서 실제 API 호출로 대체)
  const items = mockMenuItems.filter((item) => item.categoryId === categoryId);
  return Promise.resolve(items);
}

/**
 * 메뉴 검색
 *
 * @param {string} query - 검색어
 * @returns {Promise<MenuItemDisplay[]>} 메뉴 아이템 목록
 *
 * @dbQuery
 * ```sql
 * -- getMenuItems와 동일하지만 WHERE 절에 ILIKE 조건 추가
 * WHERE m.status = 'E0101'
 *   AND (m.name ILIKE $1 OR m.description ILIKE $1)
 * ```
 *
 * @example
 * ```typescript
 * // 사용 예시
 * const searchResults = await searchMenuItems('아메리카노');
 * console.log(searchResults); // MenuItemDisplay[]
 * ```
 *
 * @futureImplementation Phase 6
 * ```typescript
 * export async function searchMenuItems(query: string): Promise<MenuItemDisplay[]> {
 *   try {
 *     const response = await fetch(`/api/menu/search?q=${encodeURIComponent(query)}`, {
 *       method: 'GET',
 *       headers: {
 *         'Content-Type': 'application/json',
 *       },
 *       cache: 'no-store',
 *     });
 *
 *     if (!response.ok) {
 *       throw new Error(`Failed to search menu items: ${response.statusText}`);
 *     }
 *
 *     const data: MenuItemDisplay[] = await response.json();
 *     return data;
 *   } catch (error) {
 *     console.error('Error searching menu items:', error);
 *     throw error;
 *   }
 * }
 * ```
 */
export async function searchMenuItems(query: string): Promise<MenuItemDisplay[]> {
  // 🚨 임시: Mock 데이터에서 검색 (Phase 6에서 실제 API 호출로 대체)
  const lowerQuery = query.toLowerCase();
  const items = mockMenuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery)
  );
  return Promise.resolve(items);
}

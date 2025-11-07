/**
 * 메뉴 API 함수
 *
 * Supabase를 사용하여 메뉴 데이터를 조회합니다.
 */

import { supabase } from '@/lib/supabase';
import type { MenuItemDisplay, CategoryInfo, MenuImage } from '@/types/menu';

/**
 * 메뉴 페이지네이션 응답 타입
 */
export interface MenuPageResponse {
  data: MenuItemDisplay[];
  total: number;
  hasMore: boolean;
}

/**
 * 메뉴 조회 옵션
 */
export interface GetMenusOptions {
  page?: number;
  pageSize?: number;
  categoryId?: number | 'all';
  searchQuery?: string;
}

/**
 * 메뉴 목록 조회 (페이지네이션 지원)
 *
 * @param options - 조회 옵션
 * @returns 메뉴 목록, 총 개수, 더 불러올 데이터 존재 여부
 */
export async function getMenus(options: GetMenusOptions = {}): Promise<MenuPageResponse> {
  const {
    page = 1,
    pageSize = 8,
    categoryId = 'all',
    searchQuery = '',
  } = options;

  try {
    // Step 1: 메뉴 조회 (category는 FK가 있으므로 JOIN 가능)
    let menuQuery = supabase
      .from('menu')
      .select(`
        id,
        name,
        description,
        price,
        discount_price,
        cold,
        hot,
        category_id,
        status,
        marketing,
        order_no,
        category:category_id (
          id,
          name
        )
      `, { count: 'exact' })
      .eq('status', 'E0101') // E0101 = 사용(MENU_ACTIVE)
      .order('id', { ascending: true });

    // 카테고리 필터
    if (categoryId !== 'all') {
      menuQuery = menuQuery.eq('category_id', categoryId);
    }

    // 검색어 필터
    if (searchQuery) {
      menuQuery = menuQuery.ilike('name', `%${searchQuery}%`);
    }

    // 페이지네이션 적용
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    menuQuery = menuQuery.range(from, to);

    // 메뉴 조회 실행
    const { data: menuData, error: menuError, count } = await menuQuery;

    if (menuError) {
      console.error('메뉴 조회 오류:', menuError);
      throw menuError;
    }

    if (!menuData || menuData.length === 0) {
      return {
        data: [],
        total: count || 0,
        hasMore: false,
      };
    }

    // Step 2: 조회된 메뉴의 ID 목록 추출
    const menuIds = menuData.map(menu => menu.id);

    // Step 3: 이미지 별도 조회 (FK 없이)
    const { data: imageData, error: imageError } = await supabase
      .from('image')
      .select('*')
      .in('menu_id', menuIds)
      .order('menu_id', { ascending: true })
      .order('ordering', { ascending: true });

    if (imageError) {
      console.error('이미지 조회 오류:', imageError);
      // 이미지 조회 실패해도 메뉴는 반환
    }

    // Step 4: menu_id를 키로 이미지 그룹화
    interface ImageData {
      menu_id: number;
      file_uuid: string;
      file_name: string;
      menu_type: string;
      ordering: number;
      created_by: string;
      created_date: string;
    }

    const imagesByMenuId = new Map<number, ImageData[]>();

    if (imageData) {
      imageData.forEach((image: ImageData) => {
        if (!imagesByMenuId.has(image.menu_id)) {
          imagesByMenuId.set(image.menu_id, []);
        }
        imagesByMenuId.get(image.menu_id)!.push(image);
      });
    }

    // Step 5: 메뉴 데이터에 이미지 매핑
    const menuWithImages: MenuItemData[] = menuData.map((menu) => {
      const images = imagesByMenuId.get(menu.id) || [];
      return {
        ...menu,
        image: images,
      } as unknown as MenuItemData;
    });

    // DB 응답 → MenuItemDisplay 변환
    const menuItems = menuWithImages.map(mapMenuItemToDisplay);

    return {
      data: menuItems,
      total: count || 0,
      hasMore: count ? (from + pageSize) < count : false,
    };
  } catch (error) {
    console.error('메뉴 조회 실패:', error);
    throw error;
  }
}

/**
 * 메뉴 아이템 목록 조회 (모든 메뉴)
 * 하위 호환성을 위해 유지
 */
export async function getMenuItems(): Promise<MenuItemDisplay[]> {
  const response = await getMenus({ page: 1, pageSize: 1000 });
  return response.data;
}

/**
 * 카테고리 목록 조회
 *
 * @returns 카테고리 목록
 */
export async function getCategories(): Promise<CategoryInfo[]> {
  try {
    const { data, error } = await supabase
      .from('category')
      .select('*')
      .eq('status', 'D0101') // D0101 = 사용(CATEGORY_ACTIVE)
      .order('order_no', { ascending: true });

    if (error) {
      console.error('카테고리 조회 오류:', error);
      throw error;
    }

    interface CategoryData {
      id: number;
      name: string;
      order_no: number;
      status: string;
      created_by: string;
      created_date: string;
      updated_by?: string | null;
      updated_date?: string | null;
    }

    return (data || []).map((cat: CategoryData): CategoryInfo => ({
      id: cat.id,
      name: cat.name,
      orderNo: cat.order_no,
      status: cat.status,
      createdBy: cat.created_by,
      createdDate: new Date(cat.created_date),
      updatedBy: cat.updated_by || undefined,
      updatedDate: cat.updated_date ? new Date(cat.updated_date) : undefined,
    }));
  } catch (error) {
    console.error('카테고리 조회 실패:', error);
    throw error;
  }
}

/**
 * 단일 메뉴 조회
 *
 * @param menuId - 메뉴 ID
 * @returns 메뉴 아이템
 */
export async function getMenuItemById(menuId: number): Promise<MenuItemDisplay | null> {
  try {
    // Step 1: 메뉴 조회
    const { data: menuData, error: menuError } = await supabase
      .from('menu')
      .select(`
        id,
        name,
        description,
        price,
        discount_price,
        cold,
        hot,
        category_id,
        status,
        marketing,
        order_no,
        category:category_id (
          id,
          name
        )
      `)
      .eq('id', menuId)
      .single();

    if (menuError) {
      console.error('메뉴 조회 오류:', menuError);
      throw menuError;
    }

    if (!menuData) {
      return null;
    }

    // Step 2: 이미지 별도 조회
    const { data: imageData, error: imageError } = await supabase
      .from('image')
      .select('*')
      .eq('menu_id', menuId)
      .order('ordering', { ascending: true });

    if (imageError) {
      console.error('이미지 조회 오류:', imageError);
      // 이미지 조회 실패해도 메뉴는 반환
    }

    // Step 3: 메뉴 데이터에 이미지 추가
    const menuWithImages: MenuItemData = {
      ...menuData,
      image: (imageData || []) as MenuItemData['image'],
    } as unknown as MenuItemData;

    return mapMenuItemToDisplay(menuWithImages);
  } catch (error) {
    console.error('메뉴 조회 실패:', error);
    throw error;
  }
}

/**
 * 카테고리별 메뉴 조회
 *
 * @param categoryId - 카테고리 ID
 * @returns 메뉴 목록
 */
export async function getMenuItemsByCategory(categoryId: number): Promise<MenuItemDisplay[]> {
  const response = await getMenus({ categoryId, pageSize: 1000 });
  return response.data;
}

/**
 * 메뉴 검색
 *
 * @param query - 검색어
 * @returns 메뉴 목록
 */
export async function searchMenuItems(query: string): Promise<MenuItemDisplay[]> {
  const response = await getMenus({ searchQuery: query, pageSize: 1000 });
  return response.data;
}

/**
 * DB 응답 데이터 타입
 */
interface MenuItemData {
  id: number;
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  cold: boolean;
  hot: boolean;
  category_id: number | null;
  status: string;
  marketing: string[] | null;
  order_no: number;
  category?: { id: number; name: string } | null;
  image?: Array<{
    file_uuid: string;
    file_name: string;
    menu_id: number;
    menu_type: string;
    ordering: number;
    created_by: string;
    created_date: string;
  }>;
}

/**
 * DB 응답 → MenuItemDisplay 변환 함수
 *
 * @param item - Supabase 응답 데이터
 * @returns MenuItemDisplay 객체
 */
function mapMenuItemToDisplay(item: MenuItemData): MenuItemDisplay {
  // 이미지 정렬 및 첫 번째 이미지 선택
  const images: MenuImage[] = Array.isArray(item.image)
    ? item.image
        .sort((a, b) => a.ordering - b.ordering)
        .map((img) => ({
          fileUuid: img.file_uuid,
          fileName: img.file_name,
          menuId: img.menu_id,
          menuType: img.menu_type,
          ordering: img.ordering,
          createdBy: img.created_by,
          createdDate: new Date(img.created_date),
        }))
    : [];

  // MinIO 이미지 URL 생성
  // file_uuid에 이미 확장자가 포함되어 있으므로 추가하지 않음
  // menu_type을 동적으로 사용하여 경로 생성 (menu, store, event, new-menu 등)
  const firstImage = images[0];
  let imageUrl: string | null = null;

  if (firstImage && firstImage.fileUuid && firstImage.menuType) {
    try {
      // URL 유효성 검증을 위해 URL 생성자 사용
      const url = `https://bo.heemina.co.kr/minio/images/${firstImage.menuType}/${firstImage.fileUuid}`;
      new URL(url); // URL 유효성 검증
      imageUrl = url;
    } catch (error) {
      console.warn(`Invalid image URL for menu ${item.id}:`, error);
      imageUrl = null;
    }
  }

  // 마케팅 태그 → 라벨 변환
  const marketingTags = Array.isArray(item.marketing) ? item.marketing : [];
  const tags: string[] = marketingTags.map((code: string) => {
    switch (code) {
      case 'E0201':
        return 'New';
      case 'E0202':
        return 'Best';
      case 'E0203':
        return 'Event';
      default:
        return '';
    }
  }).filter(Boolean);

  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    discountPrice: item.discount_price ?? undefined,
    image: imageUrl,
    images,
    category: item.category?.name || '',
    categoryId: item.category_id ?? undefined,
    tags,
    available: item.status === 'E0101', // E0101 = 사용
    popular: marketingTags.includes('E0202'), // E0202 = Best
    cold: item.cold,
    hot: item.hot,
    orderNo: item.order_no,
  };
}

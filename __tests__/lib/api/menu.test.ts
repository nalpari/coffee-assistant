import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMenuItemById } from '@/lib/api/menu';
import { supabase } from '@/lib/supabase';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('menu API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMenuItemById', () => {
    it('should return null for image when no images exist', async () => {
      // Mock data: 메뉴는 존재하지만 이미지가 없는 경우
      const mockMenuData = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        price: 5000,
        discount_price: null,
        cold: true,
        hot: false,
        category_id: 1,
        status: 'E0101',
        marketing: [],
        order_no: 1,
        category: {
          id: 1,
          name: 'COFFEE',
        },
      };

      // Mock Supabase 응답
      const mockMenuQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockMenuData,
          error: null,
        }),
      };

      const mockImageQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [], // 빈 이미지 배열
          error: null,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(supabase.from).mockImplementation((table: string): any => {
        if (table === 'menu') return mockMenuQuery;
        if (table === 'image') return mockImageQuery;
        return {};
      });

      // 실행
      const result = await getMenuItemById(1);

      // 검증
      expect(result).not.toBeNull();
      expect(result?.image).toBeNull(); // ✅ 이미지가 없을 때 null 반환
      expect(result?.images).toEqual([]);
      expect(result?.name).toBe('Test Product');
    });

    it('should return valid URL when image exists', async () => {
      const mockMenuData = {
        id: 1,
        name: 'Test Product with Image',
        description: 'Test Description',
        price: 5000,
        discount_price: null,
        cold: true,
        hot: false,
        category_id: 1,
        status: 'E0101',
        marketing: [],
        order_no: 1,
        category: {
          id: 1,
          name: 'COFFEE',
        },
      };

      const mockImageData = [
        {
          file_uuid: 'test-uuid.jpg',
          file_name: 'test-image.jpg',
          menu_id: 1,
          menu_type: 'menu',
          ordering: 0,
          created_by: 'system',
          created_date: '2025-01-01T00:00:00Z',
        },
      ];

      const mockMenuQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockMenuData,
          error: null,
        }),
      };

      const mockImageQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockImageData,
          error: null,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(supabase.from).mockImplementation((table: string): any => {
        if (table === 'menu') return mockMenuQuery;
        if (table === 'image') return mockImageQuery;
        return {};
      });

      const result = await getMenuItemById(1);

      expect(result).not.toBeNull();
      expect(result?.image).toBe('https://bo.heemina.co.kr/minio/images/menu/test-uuid.jpg');
      expect(result?.images).toHaveLength(1);
      expect(result?.images[0].fileUuid).toBe('test-uuid.jpg');
    });

    it('should handle multiple images and return first one', async () => {
      const mockMenuData = {
        id: 1,
        name: 'Product with Multiple Images',
        description: 'Test Description',
        price: 5000,
        discount_price: null,
        cold: true,
        hot: false,
        category_id: 1,
        status: 'E0101',
        marketing: [],
        order_no: 1,
        category: {
          id: 1,
          name: 'COFFEE',
        },
      };

      const mockImageData = [
        {
          file_uuid: 'first-image.jpg',
          file_name: 'first.jpg',
          menu_id: 1,
          menu_type: 'menu',
          ordering: 0,
          created_by: 'system',
          created_date: '2025-01-01T00:00:00Z',
        },
        {
          file_uuid: 'second-image.jpg',
          file_name: 'second.jpg',
          menu_id: 1,
          menu_type: 'menu',
          ordering: 1,
          created_by: 'system',
          created_date: '2025-01-01T00:00:00Z',
        },
      ];

      const mockMenuQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockMenuData,
          error: null,
        }),
      };

      const mockImageQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockImageData,
          error: null,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(supabase.from).mockImplementation((table: string): any => {
        if (table === 'menu') return mockMenuQuery;
        if (table === 'image') return mockImageQuery;
        return {};
      });

      const result = await getMenuItemById(1);

      expect(result).not.toBeNull();
      expect(result?.image).toBe('https://bo.heemina.co.kr/minio/images/menu/first-image.jpg'); // 첫 번째 이미지
      expect(result?.images).toHaveLength(2);
    });

    it('should return null when menu not found', async () => {
      const mockMenuQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(supabase.from).mockReturnValue(mockMenuQuery as any);

      const result = await getMenuItemById(999);

      expect(result).toBeNull();
    });
  });
});

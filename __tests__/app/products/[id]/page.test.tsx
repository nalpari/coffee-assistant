import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductDetailPage from '@/app/products/[id]/page';
import { useParams } from 'next/navigation';
import type { MenuItemDisplay } from '@/types/menu';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
  })),
}));

// Mock useProductQuery hook
vi.mock('@/hooks/use-product-query', () => ({
  useProductQuery: vi.fn(),
}));

// Mock cart store
vi.mock('@/store/cart-store', () => ({
  useCartStore: vi.fn(() => ({
    addItem: vi.fn(),
  })),
}));

import { useProductQuery } from '@/hooks/use-product-query';

describe('ProductDetailPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({ id: '1' });
  });

  const renderWithQueryClient = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
  };

  it('should show fallback UI when image is null', async () => {
    const mockProduct: MenuItemDisplay = {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
      price: 5000,
      discountPrice: undefined,
      image: null, // ✅ 이미지 없음
      images: [],
      category: 'COFFEE',
      categoryId: 1,
      tags: [],
      available: true,
      popular: false,
      cold: true,
      hot: false,
      orderNo: 1,
    };

    vi.mocked(useProductQuery).mockReturnValue({
      data: mockProduct,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQueryClient(<ProductDetailPage />);

    // 이미지 대체 UI 확인
    await waitFor(() => {
      expect(screen.getByText('이미지 준비중')).toBeInTheDocument();
    });

    // Next.js Image 컴포넌트가 렌더링되지 않았는지 확인
    const images = screen.queryAllByRole('img');
    expect(images).toHaveLength(0);

    // 상품 이름 확인
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should render image when valid image URL exists', async () => {
    const mockProduct: MenuItemDisplay = {
      id: 1,
      name: 'Product with Image',
      description: 'Test Description',
      price: 5000,
      discountPrice: undefined,
      image: 'https://bo.heemina.co.kr/minio/images/menu/test-image.jpg', // ✅ 유효한 이미지
      images: [
        {
          fileUuid: 'test-image.jpg',
          fileName: 'test.jpg',
          menuId: 1,
          menuType: 'menu',
          ordering: 0,
          createdBy: 'system',
          createdDate: new Date(),
        },
      ],
      category: 'COFFEE',
      categoryId: 1,
      tags: [],
      available: true,
      popular: false,
      cold: true,
      hot: false,
      orderNo: 1,
    };

    vi.mocked(useProductQuery).mockReturnValue({
      data: mockProduct,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQueryClient(<ProductDetailPage />);

    await waitFor(() => {
      const image = screen.getByAltText('Product with Image');
      expect(image).toBeInTheDocument();
    });

    // 이미지 대체 UI가 표시되지 않음
    expect(screen.queryByText('이미지 준비중')).not.toBeInTheDocument();
  });

  it('should not throw URL error when scrolling with null image', async () => {
    const mockProduct: MenuItemDisplay = {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
      price: 5000,
      discountPrice: undefined,
      image: null,
      images: [],
      category: 'COFFEE',
      categoryId: 1,
      tags: [],
      available: true,
      popular: false,
      cold: true,
      hot: false,
      orderNo: 1,
    };

    vi.mocked(useProductQuery).mockReturnValue({
      data: mockProduct,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    // 콘솔 에러 감지
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithQueryClient(<ProductDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('이미지 준비중')).toBeInTheDocument();
    });

    // 스크롤 이벤트 시뮬레이션 (실제로는 intersection observer가 동작)
    // Next.js Image lazy loading은 브라우저 환경에서 작동하므로 테스트 환경에서는 제한적

    // URL 에러가 발생하지 않았는지 확인
    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Failed to construct \'URL\'')
    );

    consoleErrorSpy.mockRestore();
  });

  it('should show loading spinner while fetching data', () => {
    vi.mocked(useProductQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    renderWithQueryClient(<ProductDetailPage />);

    // LoadingSpinner가 표시되는지 확인 (실제 구현에 따라 다를 수 있음)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should show error message when product fetch fails', () => {
    vi.mocked(useProductQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch product'),
    } as any);

    renderWithQueryClient(<ProductDetailPage />);

    // 에러 메시지는 error.message로 표시됨
    expect(screen.getByText('Failed to fetch product')).toBeInTheDocument();
  });

  it('should handle out of stock products correctly', async () => {
    const mockProduct: MenuItemDisplay = {
      id: 1,
      name: 'Out of Stock Product',
      description: 'Test Description',
      price: 5000,
      discountPrice: undefined,
      image: 'https://bo.heemina.co.kr/minio/images/menu/test-image.jpg',
      images: [],
      category: 'COFFEE',
      categoryId: 1,
      tags: [],
      available: false, // ✅ 품절
      popular: false,
      cold: true,
      hot: false,
      orderNo: 1,
    };

    vi.mocked(useProductQuery).mockReturnValue({
      data: mockProduct,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQueryClient(<ProductDetailPage />);

    await waitFor(() => {
      // '품절' 텍스트가 여러 곳에 있으므로 getAllByText 사용
      const outOfStockElements = screen.getAllByText('품절');
      expect(outOfStockElements.length).toBeGreaterThan(0);
    });

    // 장바구니 버튼이 비활성화되었는지 확인
    const addToCartButton = screen.getByTestId('add-to-cart-button');
    expect(addToCartButton).toBeDisabled();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartItem } from '@/components/cart/CartItem';
import type { CartItem as CartItemType } from '@/types/cart';

describe('CartItem', () => {
  const mockOnUpdateQuantity = vi.fn();
  const mockOnRemove = vi.fn();

  const createMockItem = (overrides?: Partial<CartItemType>): CartItemType => ({
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 5000,
    discountPrice: undefined,
    image: 'https://bo.heemina.co.kr/minio/images/menu/test.jpg',
    images: [],
    category: 'COFFEE',
    categoryId: 1,
    tags: [],
    available: true,
    popular: false,
    cold: true,
    hot: false,
    orderNo: 1,
    quantity: 1,
    ...overrides,
  });

  it('should show fallback when image is null', () => {
    const mockItem = createMockItem({ image: null });

    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('No Image')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should show fallback when image is empty string', () => {
    const mockItem = createMockItem({ image: '' as any });

    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('No Image')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should show fallback when image is whitespace only', () => {
    const mockItem = createMockItem({ image: '   ' as any });

    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('No Image')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should render image when valid URL exists', () => {
    const mockItem = createMockItem({
      image: 'https://bo.heemina.co.kr/minio/images/menu/test.jpg',
    });

    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemove={mockOnRemove}
      />
    );

    const img = screen.getByAltText('Test Product');
    expect(img).toBeInTheDocument();
    expect(screen.queryByText('No Image')).not.toBeInTheDocument();
  });

  it('should display product name and quantity', () => {
    const mockItem = createMockItem({ quantity: 3 });

    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should display price correctly', () => {
    const mockItem = createMockItem({ price: 5000 });

    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemove={mockOnRemove}
      />
    );

    const priceElements = screen.getAllByText('5,000원');
    expect(priceElements.length).toBeGreaterThan(0);
  });

  it('should display discount price when available', () => {
    const mockItem = createMockItem({
      price: 5000,
      discountPrice: 4000,
    });

    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemove={mockOnRemove}
      />
    );

    const discountPriceElements = screen.getAllByText('4,000원');
    expect(discountPriceElements.length).toBeGreaterThan(0);
    const originalPriceElements = screen.getAllByText('5,000원');
    expect(originalPriceElements.length).toBeGreaterThan(0);
  });

  it('should not throw URL error with null image', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockItem = createMockItem({ image: null });

    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemove={mockOnRemove}
      />
    );

    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("Failed to construct 'URL'")
    );

    consoleErrorSpy.mockRestore();
  });

  it('should not throw URL error with empty string image', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockItem = createMockItem({ image: '' as any });

    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemove={mockOnRemove}
      />
    );

    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("Failed to construct 'URL'")
    );

    consoleErrorSpy.mockRestore();
  });
});

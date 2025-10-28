# Coffee Assistant - 기능 구현 가이드

## 📋 문서 개요

이 문서는 `REQUIREMENTS.md`를 기반으로 Coffee Assistant 프로젝트의 **실제 구현을 위한 Phase별 작업 지침**을 제공합니다.

**대상 독자**: 프로젝트를 구현할 개발자
**목적**: 단계별 작업 가이드 및 검증 기준 제공
**예상 개발 시간**: 8-13시간 (5개 Phase)

---

## 🏗️ 프로젝트 아키텍처

### 기술 스택 요약
- **Framework**: Next.js 16.0.0 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Package Manager**: pnpm

### 디렉토리 구조
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Layout components (Header, Footer)
│   ├── menu/               # Menu related components
│   ├── cart/               # Cart related components
│   └── order/              # Order related components
├── store/                  # Zustand stores
│   └── cart-store.ts       # Cart state management
├── types/                  # TypeScript type definitions
│   ├── menu.ts             # MenuItem, Category types
│   └── cart.ts             # CartItem, Order types
├── data/                   # Mock data
│   └── mock-menu.ts        # Menu items data
└── lib/                    # Utility functions
    └── utils.ts            # cn() helper
```

---

## 📦 Phase 1: 프로젝트 기반 설정

**⏱️ 예상 시간**: 1-2시간
**🎯 목표**: 필수 패키지 설치, 타입 정의, 색상 테마 설정, 모크 데이터 준비

### 1.1 필수 패키지 설치

```bash
# 상태 관리, 애니메이션, 아이콘 라이브러리
pnpm add zustand framer-motion lucide-react

# shadcn/ui 컴포넌트 추가
pnpm dlx shadcn@latest add card dialog badge input sheet
```

### 1.2 TypeScript 타입 정의 생성

#### 📄 `src/types/menu.ts`
```typescript
/**
 * 메뉴 카테고리 타입
 * DB: category 테이블의 id와 매핑
 * 실제 DB: 1=COFFEE, 2=NON-COFFEE, 3=SIGNATURE, 4=SMOOTHIE & FRAPPE, 5=ADE & TEA, 6=COLD BREW
 */
export type CategoryId = 1 | 2 | 3 | 4 | 5 | 6;
export type CategoryName = 'COFFEE' | 'NON-COFFEE' | 'SIGNATURE' | 'SMOOTHIE & FRAPPE' | 'ADE & TEA' | 'COLD BREW';

/**
 * 공통 엔티티 필드 (감사 추적용)
 */
export interface BaseEntity {
  createdBy: string;       // 생성자 (varchar(255))
  createdDate: Date;       // 생성일시 (timestamp)
  updatedBy?: string;      // 수정자 (varchar(255), nullable)
  updatedDate?: Date;      // 수정일시 (timestamp, nullable)
}

/**
 * 메뉴 아이템 인터페이스
 * DB 테이블: menu
 */
export interface MenuItem extends BaseEntity {
  id: number;              // 고유 식별자 (bigint, auto increment)
  name: string;            // 메뉴 이름 (varchar(255))
  description: string;     // 상세 설명 (varchar(500))
  price: number;           // 기본 가격 (int4, 원 단위)
  discountPrice?: number;  // 할인 가격 (int4, nullable)
  cold: boolean;           // 차가운 음료 제공 여부
  hot: boolean;            // 따뜻한 음료 제공 여부
  categoryId?: number;     // 카테고리 FK (bigint, nullable)
  status: string;          // 메뉴 상태 (common_code.id 참조, 예: 'E0101'=사용, 'E0102'=미사용)
  marketing: string[];     // 마케팅 태그 (_text 배열, common_code.id 참조, 예: ['E0201', 'E0202'])
  orderNo: number;         // 정렬 순서 (int4)
  available?: boolean;     // 프론트엔드 전용: 재고 여부 (status에서 파생, E0101=true)
  popular?: boolean;       // 프론트엔드 전용: 인기 메뉴 여부 (marketing에 'E0202' 포함 시 true)
}

/**
 * 카테고리 정보 인터페이스
 * DB 테이블: category
 */
export interface CategoryInfo extends BaseEntity {
  id: number;              // 고유 식별자 (bigint, auto increment)
  name: string;            // 카테고리 이름 (varchar(255), 예: 'COFFEE', 'NON-COFFEE', 'SIGNATURE')
  orderNo: number;         // 정렬 순서 (int4)
  status: string;          // 상태 (common_code.id 참조, 예: 'D0101'=사용, 'D0102'=미사용)
  icon?: string;           // 프론트엔드 전용: 아이콘 이름 (lucide-react)
}

/**
 * 이미지 정보 인터페이스
 * DB 테이블: image
 */
export interface MenuImage extends Pick<BaseEntity, 'createdBy' | 'createdDate'> {
  fileUuid: string;        // 파일 UUID (varchar(255), PK)
  fileName: string;        // 파일명 (varchar(255))
  menuId: number;          // 메뉴 FK (bigint)
  menuType: string;        // 메뉴 타입 구분자 (varchar(255))
  ordering: number;        // 이미지 정렬 순서 (int4)
}

/**
 * 공통코드 인터페이스
 * DB 테이블: common_code
 */
export interface CommonCode extends BaseEntity {
  id: string;              // 코드 ID (varchar(50), PK)
  name: string;            // 코드 이름 (varchar(100))
  value: string;           // 코드 값 (varchar(100), unique)
  description?: string;    // 코드 설명 (text, nullable)
  extraValue?: string;     // 추가 값 (text, nullable)
  parentId?: string;       // 부모 코드 ID (varchar(50), nullable, self FK)
  sortOrder: number;       // 정렬 순서 (int4, default 0)
  delYn: string;           // 삭제 여부 (varchar(1), default 'N')
}

/**
 * 프론트엔드 전용 - 간소화된 메뉴 아이템
 * API 응답에서 사용
 */
export interface MenuItemDisplay {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;           // 첫 번째 이미지 URL
  images: MenuImage[];     // 전체 이미지 목록
  category: string;        // 카테고리명 (조인 후)
  categoryId?: number;
  tags: string[];          // 마케팅 태그 (common_code 조인 후 name 배열)
  available: boolean;      // status 기반 계산
  popular: boolean;        // marketing 배열에서 "인기" 태그 포함 여부
  cold: boolean;
  hot: boolean;
  orderNo: number;
}
```

#### 📄 `src/types/cart.ts`
```typescript
import type { MenuItemDisplay } from './menu';

/**
 * 장바구니 아이템 (수량 포함)
 */
export interface CartItem extends MenuItemDisplay {
  quantity: number;        // 수량 (최소 1)
}

/**
 * 주문 정보
 * 향후 DB 연동 시 order 테이블 생성 예정
 */
export interface Order {
  id: string;              // 주문 고유 ID (UUID)
  items: CartItem[];       // 주문 아이템 목록
  totalPrice: number;      // 총 금액
  timestamp: Date;         // 주문 시간
  status: 'pending' | 'confirmed' | 'completed';
}
```

### 1.3 Tailwind CSS 색상 테마 설정

#### 📄 `src/app/globals.css` (추가)
```css
@layer base {
  :root {
    /* Primary Color (주황) - 식욕 촉진, 브랜드 컬러 */
    --primary: 25 95% 53%;
    --primary-foreground: 0 0% 100%;

    /* Accent Color (빨강) - CTA, 중요 요소 */
    --accent: 0 84% 60%;
    --accent-foreground: 0 0% 100%;

    /* Card Background (약간의 그레이) */
    --card: 0 0% 98%;
    --card-foreground: 0 0% 10%;

    /* Border Radius */
    --radius: 0.75rem;
  }

  .dark {
    --primary: 25 95% 53%;
    --primary-foreground: 0 0% 100%;
    --accent: 0 84% 60%;
    --accent-foreground: 0 0% 100%;
    --card: 0 0% 14%;
    --card-foreground: 0 0% 98%;
  }
}
```

### 1.4 Zustand 스토어 초기 구조

#### 📄 `src/store/cart-store.ts`
```typescript
import { create } from 'zustand';
import type { MenuItemDisplay } from '@/types/menu';
import type { CartItem } from '@/types/cart';

interface CartStore {
  items: CartItem[];

  // 아이템 추가 (이미 있으면 수량 증가)
  addItem: (item: MenuItemDisplay) => void;

  // 아이템 제거
  removeItem: (id: number) => void;

  // 수량 업데이트
  updateQuantity: (id: number, quantity: number) => void;

  // 장바구니 비우기
  clearCart: () => void;

  // 총 금액 계산 (할인가 우선 적용)
  getTotalPrice: () => number;

  // 총 아이템 개수
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    const { items } = get();
    const existingItem = items.find((i) => i.id === item.id);

    if (existingItem) {
      set({
        items: items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ items: [...items, { ...item, quantity: 1 }] });
    }
  },

  removeItem: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) });
  },

  updateQuantity: (id, quantity) => {
    if (quantity < 1) {
      get().removeItem(id);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.id === id ? { ...i, quantity } : i
      ),
    });
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotalPrice: () => {
    return get().items.reduce((sum, item) => {
      // 할인가가 있으면 할인가 사용, 없으면 정가 사용
      const itemPrice = item.discountPrice ?? item.price;
      return sum + itemPrice * item.quantity;
    }, 0);
  },

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
```

### 1.5 모크 데이터 생성

#### 📄 `src/data/mock-menu.ts`
```typescript
import type { MenuItemDisplay } from '@/types/menu';

/**
 * 모크 메뉴 데이터
 * 실제 DB 연동 시 API 응답으로 대체 예정
 *
 * DB 스키마 기반:
 * - id: bigint (auto increment)
 * - price/discountPrice: int4 (원 단위)
 * - cold/hot: boolean (온도 옵션)
 * - category: category 테이블 조인 후 이름
 * - tags: marketing 필드 (_text 배열) → common_code 조인 후 이름 배열
 * - available: status 코드 기반 계산 (E0101 = 사용)
 * - popular: marketing 배열에 "Best" 태그 포함 여부
 *
 * 실제 DB 데이터 기반:
 * - Category IDs: 1=COFFEE, 2=NON-COFFEE, 3=SIGNATURE, 4=SMOOTHIE & FRAPPE, 5=ADE & TEA, 6=COLD BREW
 * - Status: E0101=사용, E0102=미사용
 * - Marketing: E0201=New, E0202=Best, E0203=Event
 */
export const mockMenuItems: MenuItemDisplay[] = [
  {
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
 * 실제 DB 데이터 기반
 */
export const categories = [
  { id: 1, name: 'COFFEE', icon: 'Coffee' },
  { id: 2, name: 'NON-COFFEE', icon: 'Droplet' },
  { id: 3, name: 'SIGNATURE', icon: 'Star' },
  { id: 4, name: 'SMOOTHIE & FRAPPE', icon: 'IceCream' },
  { id: 5, name: 'ADE & TEA', icon: 'Coffee' },
  { id: 6, name: 'COLD BREW', icon: 'Coffee' },
];
```

### ✅ Phase 1 검증 기준
- [ ] `pnpm dev` 실행 시 오류 없음
- [ ] TypeScript 컴파일 에러 없음
- [ ] `src/store/cart-store.ts`에서 Zustand 스토어 정상 동작
- [ ] 브라우저 개발자 도구에서 CSS 변수 확인 (`--primary`, `--accent`)
- [ ] 모크 데이터 타입 일치 확인

---

## 🎨 Phase 2: 메인 UI 구조 개발

**⏱️ 예상 시간**: 2-3시간
**🎯 목표**: 헤더, 카테고리 탭, 메뉴 그리드, 장바구니 플로팅 버튼 구현

### 2.1 컴포넌트 구조 설정

필요한 컴포넌트 목록:
- `Header` - 상단 고정 헤더 (검색창 포함)
- `CategoryTabs` - 카테고리 필터 탭
- `MenuGrid` - 메뉴 카드 그리드
- `MenuCard` - 개별 메뉴 카드
- `CartButton` - 플로팅 장바구니 버튼

### 2.2 Header 컴포넌트

#### 📄 `src/components/layout/Header.tsx`
```typescript
'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">☕</span>
          <h1 className="text-xl font-bold">Coffee Assistant</h1>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="메뉴 검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </header>
  );
}
```

### 2.3 CategoryTabs 컴포넌트

#### 📄 `src/components/menu/CategoryTabs.tsx`
```typescript
'use client';

import { Coffee, Droplet, Star, IceCream } from 'lucide-react';

interface CategoryTabsProps {
  selectedCategory: number | 'all';
  onCategoryChange: (category: number | 'all') => void;
}

// 실제 DB 카테고리 데이터 기반
const categories = [
  { id: 'all' as const, name: '전체', Icon: null },
  { id: 1, name: 'COFFEE', Icon: Coffee },
  { id: 2, name: 'NON-COFFEE', Icon: Droplet },
  { id: 3, name: 'SIGNATURE', Icon: Star },
  { id: 4, name: 'SMOOTHIE & FRAPPE', Icon: IceCream },
  { id: 5, name: 'ADE & TEA', Icon: Coffee },
  { id: 6, name: 'COLD BREW', Icon: Coffee },
];

export function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="sticky top-16 z-40 w-full border-b bg-background">
      <div className="container px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(({ id, name, Icon }) => {
            const isActive = selectedCategory === id;
            return (
              <button
                key={id}
                onClick={() => onCategoryChange(id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full
                  whitespace-nowrap transition-colors
                  ${isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card hover:bg-muted'
                  }
                `}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span className="font-medium">{name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

### 2.4 MenuCard 컴포넌트

#### 📄 `src/components/menu/MenuCard.tsx`
```typescript
'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { MenuItem } from '@/types/menu';

interface MenuCardProps {
  item: MenuItem;
  onClick: () => void;
}

export function MenuCard({ item, onClick }: MenuCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`
        cursor-pointer transition-all hover:shadow-lg
        ${!item.available && 'opacity-50'}
      `}
    >
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-t-xl">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {item.popular && (
              <Badge className="bg-accent text-accent-foreground">인기</Badge>
            )}
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          {/* Out of Stock Overlay */}
          {!item.available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-white font-bold text-lg">품절</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1">{item.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {item.description}
          </p>
          <p className="text-primary font-bold text-xl">
            {item.price.toLocaleString('ko-KR')}원
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2.5 MenuGrid 컴포넌트

#### 📄 `src/components/menu/MenuGrid.tsx`
```typescript
'use client';

import { MenuCard } from './MenuCard';
import type { MenuItem } from '@/types/menu';

interface MenuGridProps {
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
}

export function MenuGrid({ items, onItemClick }: MenuGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground text-lg">메뉴를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {items.map((item) => (
        <MenuCard
          key={item.id}
          item={item}
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  );
}
```

### 2.6 CartButton 컴포넌트 (플로팅)

#### 📄 `src/components/cart/CartButton.tsx`
```typescript
'use client';

import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CartButtonProps {
  itemCount: number;
  onClick: () => void;
}

export function CartButton({ itemCount, onClick }: CartButtonProps) {
  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        size="lg"
        onClick={onClick}
        className="h-16 w-16 rounded-full shadow-lg"
      >
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          {itemCount > 0 && (
            <Badge
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center"
              variant="destructive"
            >
              {itemCount}
            </Badge>
          )}
        </div>
      </Button>
    </div>
  );
}
```

### 2.7 메인 페이지 통합

#### 📄 `src/app/page.tsx` (기본 구조)
```typescript
'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { CategoryTabs } from '@/components/menu/CategoryTabs';
import { MenuGrid } from '@/components/menu/MenuGrid';
import { CartButton } from '@/components/cart/CartButton';
import { useCartStore } from '@/store/cart-store';
import { mockMenuItems } from '@/data/mock-menu';
import type { Category } from '@/types/menu';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { getTotalItems } = useCartStore();

  // 필터링된 메뉴 아이템
  const filteredItems = mockMenuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleItemClick = (item: MenuItem) => {
    // Phase 3에서 모달 열기 구현
    console.log('Clicked item:', item);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <CategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className="container mx-auto pb-24">
        <MenuGrid
          items={filteredItems}
          onItemClick={handleItemClick}
        />
      </main>

      <CartButton
        itemCount={getTotalItems()}
        onClick={() => setIsCartOpen(true)}
      />
    </div>
  );
}
```

### ✅ Phase 2 검증 기준
- [ ] 헤더가 상단에 고정되고 스크롤 시에도 유지됨
- [ ] 검색창에 입력 시 메뉴 필터링 동작
- [ ] 카테고리 탭 클릭 시 해당 카테고리만 표시
- [ ] 메뉴 카드가 그리드 형태로 정렬 (2열/3열/4열)
- [ ] 인기 메뉴에 "인기" 배지 표시
- [ ] 품절 메뉴 시각적 구분 (흐림 처리)
- [ ] 장바구니 버튼이 우측 하단에 플로팅
- [ ] 반응형 레이아웃 동작 (모바일/태블릿/데스크톱)

---

## ⚡ Phase 3: 인터랙션 로직 구현

**⏱️ 예상 시간**: 2-3시간
**🎯 목표**: 메뉴 상세 모달, 장바구니 사이드바, 실시간 검색 로직 완성

### 3.1 메뉴 상세 모달 컴포넌트

#### 📄 `src/components/menu/MenuDetailModal.tsx`
```typescript
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart-store';
import type { MenuItem } from '@/types/menu';

interface MenuDetailModalProps {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenuDetailModal({ item, open, onOpenChange }: MenuDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  if (!item) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(item);
    }
    setQuantity(1);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            {/* Badges */}
            <div className="flex gap-2">
              {item.popular && (
                <Badge className="bg-accent text-accent-foreground">인기</Badge>
              )}
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>

            {/* Description */}
            <p className="text-muted-foreground">{item.description}</p>

            {/* Price */}
            <div className="text-3xl font-bold text-primary">
              {item.price.toLocaleString('ko-KR')}원
            </div>

            {/* Quantity Control */}
            <div className="flex items-center gap-4">
              <span className="font-medium">수량</span>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Total Price */}
            <div className="flex justify-between items-center p-4 bg-card rounded-lg">
              <span className="font-medium">합계</span>
              <span className="text-2xl font-bold text-primary">
                {(item.price * quantity).toLocaleString('ko-KR')}원
              </span>
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={!item.available}
            >
              {item.available ? '장바구니에 담기' : '품절'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 3.2 장바구니 사이드바 컴포넌트

#### 📄 `src/components/cart/CartSheet.tsx`
```typescript
'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
}

export function CartSheet({ open, onOpenChange, onCheckout }: CartSheetProps) {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();

  const handleCheckout = () => {
    onCheckout();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>장바구니 ({items.length})</SheetTitle>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p>장바구니가 비어있습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-card rounded-lg">
                  {/* Item Info */}
                  <div className="flex-1">
                    <h4 className="font-bold">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.price.toLocaleString('ko-KR')}원
                    </p>
                  </div>

                  {/* Quantity Control */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Remove Button */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            {/* Total Price */}
            <div className="flex justify-between items-center text-xl font-bold">
              <span>총 금액</span>
              <span className="text-primary">
                {getTotalPrice().toLocaleString('ko-KR')}원
              </span>
            </div>

            {/* Checkout Button */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleCheckout}
            >
              주문하기
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

### 3.3 메인 페이지 통합 (업데이트)

#### 📄 `src/app/page.tsx` (Phase 3 완성)
```typescript
'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { CategoryTabs } from '@/components/menu/CategoryTabs';
import { MenuGrid } from '@/components/menu/MenuGrid';
import { MenuDetailModal } from '@/components/menu/MenuDetailModal';
import { CartButton } from '@/components/cart/CartButton';
import { CartSheet } from '@/components/cart/CartSheet';
import { useCartStore } from '@/store/cart-store';
import { mockMenuItems } from '@/data/mock-menu';
import type { Category, MenuItem } from '@/types/menu';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { getTotalItems } = useCartStore();

  // 필터링된 메뉴 아이템
  const filteredItems = mockMenuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCheckout = () => {
    // Phase 4에서 주문 플로우 구현
    console.log('Checkout initiated');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <CategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className="container mx-auto pb-24">
        <MenuGrid
          items={filteredItems}
          onItemClick={handleItemClick}
        />
      </main>

      {/* Modals */}
      <MenuDetailModal
        item={selectedItem}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      <CartSheet
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        onCheckout={handleCheckout}
      />

      {/* Floating Cart Button */}
      <CartButton
        itemCount={getTotalItems()}
        onClick={() => setIsCartOpen(true)}
      />
    </div>
  );
}
```

### ✅ Phase 3 검증 기준
- [ ] 메뉴 카드 클릭 시 상세 모달 열림
- [ ] 모달에서 수량 증감 버튼 동작
- [ ] "장바구니에 담기" 버튼 클릭 시 아이템 추가
- [ ] 장바구니 버튼 클릭 시 사이드바 열림
- [ ] 사이드바에서 수량 변경 및 삭제 가능
- [ ] 총 금액 자동 계산 및 실시간 업데이트
- [ ] 장바구니 비어있을 때 빈 상태 표시

---

## 🚀 Phase 4: 주문 플로우 완성

**⏱️ 예상 시간**: 2-3시간
**🎯 목표**: 스와이프 제스처 주문, 주문 확인 애니메이션, 주문 후 초기화

### 4.1 스와이프 버튼 컴포넌트

#### 📄 `src/components/order/SwipeToOrderButton.tsx`
```typescript
'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';

interface SwipeToOrderButtonProps {
  onSwipeComplete: () => void;
  disabled?: boolean;
}

export function SwipeToOrderButton({ onSwipeComplete, disabled = false }: SwipeToOrderButtonProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const x = useMotionValue(0);

  // 버튼 너비 (실제로는 ref로 가져와야 하지만 간단히 고정값 사용)
  const BUTTON_WIDTH = 300;
  const SWIPE_THRESHOLD = BUTTON_WIDTH * 0.7;

  const backgroundColor = useTransform(
    x,
    [0, SWIPE_THRESHOLD],
    ['hsl(var(--primary))', 'hsl(var(--accent))']
  );

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      // 스와이프 완료
      setIsCompleted(true);
      x.set(BUTTON_WIDTH);
      onSwipeComplete();
    } else {
      // 임계값 미달 → 원위치
      x.set(0);
    }
  };

  if (disabled) {
    return (
      <div className="w-full h-16 bg-muted rounded-full flex items-center justify-center">
        <span className="text-muted-foreground font-medium">장바구니가 비어있습니다</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-16 bg-card rounded-full overflow-hidden">
      {/* Background Track */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor }}
      />

      {/* Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-white font-bold text-lg">
          {isCompleted ? '주문 완료!' : '스와이프하여 주문하기'}
        </span>
      </div>

      {/* Swipe Handle */}
      <motion.div
        className="absolute left-2 top-2 h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: BUTTON_WIDTH - 56 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.95 }}
      >
        {isCompleted ? (
          <Check className="h-6 w-6 text-green-600" />
        ) : (
          <ChevronRight className="h-6 w-6 text-primary" />
        )}
      </motion.div>
    </div>
  );
}
```

### 4.2 주문 확인 모달 컴포넌트

#### 📄 `src/components/order/OrderConfirmationModal.tsx`
```typescript
'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface OrderConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalPrice: number;
}

export function OrderConfirmationModal({
  open,
  onOpenChange,
  totalPrice
}: OrderConfirmationModalProps) {
  useEffect(() => {
    if (open) {
      // 3초 후 자동으로 모달 닫기
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center py-8 gap-6">
          {/* Animated Check Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20
            }}
          >
            <CheckCircle2 className="h-24 w-24 text-green-600" />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-2">주문이 완료되었습니다!</h2>
            <p className="text-muted-foreground">
              총 {totalPrice.toLocaleString('ko-KR')}원
            </p>
          </motion.div>

          {/* Close Button */}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 4.3 장바구니 사이드바 업데이트 (스와이프 버튼 추가)

#### 📄 `src/components/cart/CartSheet.tsx` (업데이트)
```typescript
'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SwipeToOrderButton } from '@/components/order/SwipeToOrderButton';
import { useCartStore } from '@/store/cart-store';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
}

export function CartSheet({ open, onOpenChange, onCheckout }: CartSheetProps) {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();

  const handleSwipeComplete = () => {
    onCheckout();
    // 장바구니 시트는 열린 상태로 유지 (주문 완료 모달 표시용)
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>장바구니 ({items.length})</SheetTitle>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p>장바구니가 비어있습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-card rounded-lg">
                  {/* Item Info */}
                  <div className="flex-1">
                    <h4 className="font-bold">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.price.toLocaleString('ko-KR')}원
                    </p>
                  </div>

                  {/* Quantity Control */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Remove Button */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-4 space-y-4">
          {/* Total Price */}
          <div className="flex justify-between items-center text-xl font-bold">
            <span>총 금액</span>
            <span className="text-primary">
              {getTotalPrice().toLocaleString('ko-KR')}원
            </span>
          </div>

          {/* Swipe to Order Button */}
          <SwipeToOrderButton
            onSwipeComplete={handleSwipeComplete}
            disabled={items.length === 0}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

### 4.4 메인 페이지 최종 통합 (Phase 4 완성)

#### 📄 `src/app/page.tsx` (Phase 4 완성)
```typescript
'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { CategoryTabs } from '@/components/menu/CategoryTabs';
import { MenuGrid } from '@/components/menu/MenuGrid';
import { MenuDetailModal } from '@/components/menu/MenuDetailModal';
import { CartButton } from '@/components/cart/CartButton';
import { CartSheet } from '@/components/cart/CartSheet';
import { OrderConfirmationModal } from '@/components/order/OrderConfirmationModal';
import { useCartStore } from '@/store/cart-store';
import { mockMenuItems } from '@/data/mock-menu';
import type { Category, MenuItem } from '@/types/menu';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);

  const { getTotalItems, getTotalPrice, clearCart } = useCartStore();

  // 필터링된 메뉴 아이템
  const filteredItems = mockMenuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCheckout = () => {
    const totalPrice = getTotalPrice();

    // 주문 확인 모달 표시
    setIsOrderConfirmed(true);

    // 장바구니 비우기
    clearCart();

    // 장바구니 시트 닫기
    setIsCartOpen(false);

    // 실제로는 여기서 백엔드 API 호출
    console.log('Order placed:', { totalPrice });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <CategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className="container mx-auto pb-24">
        <MenuGrid
          items={filteredItems}
          onItemClick={handleItemClick}
        />
      </main>

      {/* Modals */}
      <MenuDetailModal
        item={selectedItem}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      <CartSheet
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        onCheckout={handleCheckout}
      />

      <OrderConfirmationModal
        open={isOrderConfirmed}
        onOpenChange={setIsOrderConfirmed}
        totalPrice={getTotalPrice()}
      />

      {/* Floating Cart Button */}
      <CartButton
        itemCount={getTotalItems()}
        onClick={() => setIsCartOpen(true)}
      />
    </div>
  );
}
```

### ✅ Phase 4 검증 기준
- [ ] 스와이프 버튼이 부드럽게 동작
- [ ] 임계값(70%) 도달 시 주문 완료 처리
- [ ] 임계값 미달 시 자동으로 원위치
- [ ] 주문 완료 시 체크 아이콘 애니메이션 표시
- [ ] 주문 확인 모달이 팝업으로 나타남
- [ ] 주문 후 장바구니 자동 비우기
- [ ] 3초 후 주문 확인 모달 자동 닫기

---

## ✨ Phase 5: 최적화 및 테스트

**⏱️ 예상 시간**: 1-2시간
**🎯 목표**: 이미지 최적화, 성능 개선, 접근성 보장, Lighthouse 90+ 달성

### 5.1 이미지 최적화

#### 이미지 컴포넌트 최적화 적용
- `next/image`의 `priority` 속성 사용 (첫 화면 이미지)
- `loading="lazy"` 자동 적용 (하단 이미지)
- `sizes` 속성으로 반응형 이미지 최적화

```typescript
// MenuCard.tsx에서 이미지 최적화 예시
<Image
  src={item.image}
  alt={item.name}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
  priority={item.popular} // 인기 메뉴는 우선 로드
/>
```

### 5.2 검색 디바운싱

#### 📄 `src/hooks/useDebounce.ts` (생성)
```typescript
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

#### 📄 `src/app/page.tsx` (검색 디바운싱 적용)
```typescript
'use client';

import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
// ... 기타 imports

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // ... 기타 상태

  // 디바운싱된 검색어 사용
  const filteredItems = mockMenuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // ... 나머지 코드
}
```

### 5.3 접근성 개선

#### ARIA 레이블 추가
```typescript
// CartButton.tsx
<Button
  size="lg"
  onClick={onClick}
  className="h-16 w-16 rounded-full shadow-lg"
  aria-label={`장바구니, ${itemCount}개 아이템`}
>
  {/* ... */}
</Button>

// MenuCard.tsx
<Card
  onClick={onClick}
  className="..."
  role="button"
  tabIndex={0}
  aria-label={`${item.name}, ${item.price}원`}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick();
    }
  }}
>
  {/* ... */}
</Card>
```

#### 포커스 스타일 개선
```css
/* globals.css에 추가 */
@layer base {
  *:focus-visible {
    outline: 2px solid hsl(var(--primary));
    outline-offset: 2px;
    border-radius: 0.25rem;
  }
}
```

### 5.4 성능 최적화 체크리스트

#### Next.js 최적화
- [ ] Server Components 활용 (정적 콘텐츠)
- [ ] Client Components 최소화 (`'use client'` 필요한 곳만)
- [ ] Dynamic imports for heavy components
- [ ] Metadata API 사용 (SEO)

#### React 최적화
- [ ] `useMemo`로 필터링 로직 메모이제이션
- [ ] `useCallback`으로 핸들러 함수 최적화
- [ ] React Compiler 자동 최적화 활성화 (Next.js 설정)

#### Lighthouse 테스트
```bash
# 프로덕션 빌드 후 테스트
pnpm build
pnpm start

# Chrome DevTools > Lighthouse 실행
# 목표: Performance 90+, Accessibility 95+
```

### 5.5 반응형 레이아웃 최종 검증

#### 테스트 해상도
- **모바일**: 375px (iPhone SE), 390px (iPhone 12)
- **태블릿**: 768px (iPad Mini), 1024px (iPad Pro)
- **데스크톱**: 1280px, 1920px

#### 반응형 체크리스트
- [ ] 헤더 검색창 모바일에서 축소
- [ ] 카테고리 탭 가로 스크롤 (모바일)
- [ ] 메뉴 그리드 2열/3열/4열 정상 동작
- [ ] 모달 모바일에서 풀스크린
- [ ] 장바구니 사이드바 모바일에서 풀스크린
- [ ] 플로팅 버튼 모바일에서 터치 영역 충분 (44px)

### 5.6 브라우저 호환성 테스트

#### 지원 브라우저
- Chrome 100+ (주요 타겟)
- Safari 15+ (iOS)
- Edge 100+
- Firefox 100+

#### 테스트 항목
- [ ] Framer Motion 애니메이션 정상 동작
- [ ] CSS Grid 레이아웃 정상 표시
- [ ] Touch 제스처 동작 (모바일)
- [ ] Dialog/Sheet 컴포넌트 정상 작동

### ✅ Phase 5 검증 기준
- [ ] 모든 이미지 Next.js Image 컴포넌트 사용
- [ ] 검색 디바운싱 적용 (300ms)
- [ ] 반응형 레이아웃 완벽 동작 (3개 해상도 테스트)
- [ ] Lighthouse Performance 90+ 달성
- [ ] Lighthouse Accessibility 95+ 달성
- [ ] 키보드 네비게이션 가능 (Tab, Enter)
- [ ] 스크린 리더 호환 (ARIA 레이블)

---

## 📚 부록 A: 데이터 모델 상세

### 데이터베이스 스키마 참고
실제 데이터베이스 스키마는 `docs/ddl.md` 참고

### MenuItem 타입 (DB 연동 전)
```typescript
interface MenuItem extends BaseEntity {
  id: number;              // bigint (auto increment)
  name: string;            // varchar(255)
  description: string;     // varchar(500)
  price: number;           // int4 (원 단위, 양수)
  discountPrice?: number;  // int4 (원 단위, nullable)
  cold: boolean;           // 차가운 음료 제공 여부
  hot: boolean;            // 따뜻한 음료 제공 여부
  categoryId?: number;     // bigint (FK to category)
  status: string;          // varchar(255) (common_code.id 참조)
  marketing: string[];     // _text 배열 (common_code.id 참조)
  orderNo: number;         // int4 (정렬 순서)
}
```

### MenuItemDisplay 타입 (프론트엔드 전용)
```typescript
interface MenuItemDisplay {
  id: number;
  name: string;            // 최대 255자
  description: string;     // 최대 500자
  price: number;           // 원 단위
  discountPrice?: number;  // 할인가 (있는 경우)
  image: string;           // 첫 번째 이미지 URL
  images: MenuImage[];     // 전체 이미지 목록
  category: string;        // 카테고리명 (조인 후)
  categoryId?: number;
  tags: string[];          // 마케팅 태그 (최대 5개 권장)
  available: boolean;      // status 기반 계산
  popular: boolean;        // marketing 배열에서 파생
  cold: boolean;
  hot: boolean;
  orderNo: number;
}
```

### CartItem 타입
```typescript
interface CartItem extends MenuItemDisplay {
  quantity: number;        // 최소 1, 최대 99 권장
}
```

### Order 타입 (향후 DB 연동)
```typescript
interface Order {
  id: string;              // UUID
  items: CartItem[];       // 최소 1개
  totalPrice: number;      // items의 합계 (할인가 우선)
  timestamp: Date;         // 주문 생성 시간
  status: 'pending' | 'confirmed' | 'completed';
}
```

### 공통코드 구조 (계층형)
```typescript
interface CommonCode extends BaseEntity {
  id: string;              // varchar(50) (예: "E0101")
  name: string;            // varchar(100) (예: "사용")
  value: string;           // varchar(100) (unique, 예: "MENU_ACTIVE")
  parentId?: string;       // varchar(50) (self FK, 예: "E01")
  sortOrder: number;       // int4 (정렬)
  delYn: string;           // varchar(1) ('Y' | 'N')
}

// 실제 DB 공통코드 예시
// - 메뉴 관련: E (parent)
//   - 메뉴 상태: E01 (parent)
//     - E0101 (child): "사용" (MENU_ACTIVE)
//     - E0102 (child): "미사용" (MENU_INACTIVE)
//   - 메뉴 마케팅 유형: E02 (parent)
//     - E0201 (child): "New" (MENU_TYPE_NEW)
//     - E0202 (child): "Best" (MENU_TYPE_BEST)
//     - E0203 (child): "Event" (MENU_TYPE_EVENT)
// - 카테고리 관련: D (parent)
//   - 카테고리 상태: D01 (parent)
//     - D0101 (child): "사용" (CATEGORY_ACTIVE)
//     - D0102 (child): "미사용" (CATEGORY_INACTIVE)
```

---

## 📚 부록 B: shadcn/ui 컴포넌트 설치 가이드

### 설치된 컴포넌트 목록
```bash
# Phase 1에서 설치
pnpm dlx shadcn@latest add button card dialog badge input sheet
```

### 사용 예시
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
```

---

## 📚 부록 C: Zustand 스토어 구조

### CartStore 인터페이스
```typescript
interface CartStore {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}
```

### 사용 예시
```typescript
import { useCartStore } from '@/store/cart-store';

function MyComponent() {
  const { items, addItem, getTotalPrice } = useCartStore();

  return (
    <div>
      <p>총 금액: {getTotalPrice()}원</p>
      <button onClick={() => addItem(menuItem)}>
        장바구니에 담기
      </button>
    </div>
  );
}
```

---

## 📚 부록 D: Framer Motion 애니메이션 패턴

### 스와이프 제스처
```typescript
import { motion, useMotionValue } from 'framer-motion';

const x = useMotionValue(0);

<motion.div
  style={{ x }}
  drag="x"
  dragConstraints={{ left: 0, right: 200 }}
  onDragEnd={(event, info) => {
    if (info.offset.x > 140) {
      // 액션 실행
    } else {
      x.set(0); // 원위치
    }
  }}
/>
```

### 모달 애니메이션
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
  transition={{ duration: 0.2 }}
>
  {/* 모달 내용 */}
</motion.div>
```

### 체크 아이콘 애니메이션
```typescript
<motion.div
  initial={{ scale: 0, rotate: -180 }}
  animate={{ scale: 1, rotate: 0 }}
  transition={{
    type: 'spring',
    stiffness: 260,
    damping: 20
  }}
>
  <CheckCircle2 className="h-24 w-24" />
</motion.div>
```

---

## 🔧 트러블슈팅

### 자주 발생하는 문제

#### 1. Image 컴포넌트 오류
**문제**: `Image with src "..." is missing required "width" or "height" properties`
**해결**: `fill` 속성 사용 시 부모 요소에 `position: relative` 적용

```typescript
<div className="relative aspect-square w-full">
  <Image src="..." alt="..." fill />
</div>
```

#### 2. Zustand 상태 업데이트 안됨
**문제**: 장바구니 아이템 추가했는데 UI 업데이트 안됨
**해결**: `set()` 함수 내부에서 불변성 유지

```typescript
// ❌ 잘못된 방법
set({ items: items.push(newItem) });

// ✅ 올바른 방법
set({ items: [...items, newItem] });
```

#### 3. Framer Motion 애니메이션 버벅임
**문제**: 스와이프 동작이 부드럽지 않음
**해결**: `dragElastic` 속성 조정, GPU 가속 활성화

```typescript
<motion.div
  drag="x"
  dragElastic={0.1}
  style={{ x, willChange: 'transform' }}
/>
```

#### 4. Tailwind CSS 클래스 적용 안됨
**문제**: 동적 클래스명이 작동하지 않음
**해결**: 풀 클래스명 사용, 조건부 결합은 `cn()` 사용

```typescript
// ❌ 잘못된 방법
className={`text-${color}-500`}

// ✅ 올바른 방법
className={cn(
  'text-base',
  color === 'red' && 'text-red-500',
  color === 'blue' && 'text-blue-500'
)}
```

---

## 📝 체크리스트 요약

### Phase 1
- [ ] zustand, framer-motion, lucide-react 설치
- [ ] shadcn/ui 컴포넌트 설치 (card, dialog, badge, input, sheet)
- [ ] TypeScript 타입 정의 (`menu.ts`, `cart.ts`)
- [ ] Tailwind CSS 색상 변수 추가
- [ ] Zustand 스토어 생성
- [ ] 모크 데이터 생성

### Phase 2
- [ ] Header 컴포넌트
- [ ] CategoryTabs 컴포넌트
- [ ] MenuCard 컴포넌트
- [ ] MenuGrid 컴포넌트
- [ ] CartButton 컴포넌트
- [ ] 메인 페이지 기본 구조

### Phase 3
- [ ] MenuDetailModal 컴포넌트
- [ ] CartSheet 컴포넌트
- [ ] 실시간 검색 로직
- [ ] 카테고리 필터링 로직
- [ ] 장바구니 상태 관리 통합

### Phase 4
- [ ] SwipeToOrderButton 컴포넌트
- [ ] OrderConfirmationModal 컴포넌트
- [ ] 주문 플로우 통합
- [ ] 주문 후 장바구니 초기화

### Phase 5
- [ ] 이미지 최적화 (Next.js Image)
- [ ] 검색 디바운싱 (useDebounce hook)
- [ ] 접근성 개선 (ARIA 레이블, 키보드 네비게이션)
- [ ] Lighthouse 테스트 (Performance 90+, Accessibility 95+)
- [ ] 반응형 레이아웃 테스트 (3개 해상도)
- [ ] 브라우저 호환성 테스트

---

## 🎯 다음 단계 (Post-MVP)

### Phase 6: 백엔드 연동 (선택)
- Supabase 또는 Firebase 통합
- 실시간 주문 상태 업데이트
- 사용자 인증 (소셜 로그인)

### Phase 7: 추가 기능
- 주문 내역 조회
- 찜하기/즐겨찾기
- 리뷰 및 평점 시스템

### Phase 8: PWA 변환
- Service Worker 설정
- 오프라인 지원
- 푸시 알림

---

## 📞 참고 자료

- [Next.js 16 공식 문서](https://nextjs.org/docs)
- [shadcn/ui 컴포넌트](https://ui.shadchn.com/docs)
- [Zustand 가이드](https://docs.pmnd.rs/zustand)
- [Framer Motion API](https://www.framer.com/motion/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

---

**문서 버전**: 1.0
**작성일**: 2025-10-27
**기반 문서**: `REQUIREMENTS.md`

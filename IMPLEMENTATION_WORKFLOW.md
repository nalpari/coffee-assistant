# FastOrder 스타일 음식 주문 앱 구현 워크플로우

## 📋 프로젝트 개요

**목표**: 패스트오더 앱과 유사한 빠르고 직관적인 음식 주문 웹 애플리케이션 구현

**핵심 특징**:
- ⚡ 10초 이내 주문 완료 프로세스
- 🔍 검색 중심의 빠른 메뉴 탐색
- 📱 모바일 퍼스트 반응형 디자인
- 🎨 직관적이고 매력적인 UI/UX
- 👆 터치 제스처 기반 인터랙션

---

## 🛠 기술 스택

### 현재 프로젝트 환경
- **Framework**: Next.js 16.0.0 (App Router, React Compiler 활성화)
- **React**: 19.2.0
- **TypeScript**: 5 (strict mode)
- **Styling**: Tailwind CSS v4 (CSS 변수 기반)
- **UI 라이브러리**: shadcn/ui (Radix UI 기반)
- **패키지 매니저**: pnpm
- **폰트**: Geist Sans + Geist Mono

### 추가 필요 라이브러리
```bash
# 필수 컴포넌트
pnpm dlx shadcn@latest add card input dialog sheet tabs badge separator

# 상태 관리 (선택)
pnpm add zustand

# 애니메이션
pnpm add framer-motion
```

---

## 📐 데이터 구조 설계

### TypeScript 타입 정의

```typescript
// types/menu.ts
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'coffee' | 'dessert' | 'beverage' | 'food';
  tags: string[];
  available: boolean;
  popular?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  items: CartItem[];
  totalPrice: number;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'completed';
}

export interface CartStore {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}
```

---

## 🎨 디자인 시스템 커스터마이징

### 색상 테마 (Tailwind CSS v4)

음식 주문 앱에 적합한 따뜻한 색상 팔레트로 변경:

```css
/* src/app/globals.css */
@theme {
  /* Primary: 주황색 계열 (식욕 촉진) */
  --color-primary: 25 95% 53%;
  --color-primary-foreground: 0 0% 100%;

  /* Accent: 빨강 계열 (행동 유도) */
  --color-accent: 0 84% 60%;
  --color-accent-foreground: 0 0% 100%;

  /* 배경 및 카드 */
  --color-background: 0 0% 100%;
  --color-card: 0 0% 98%;
  --color-card-foreground: 0 0% 5%;

  /* 텍스트 */
  --color-foreground: 0 0% 10%;
  --color-muted: 0 0% 96%;
  --color-muted-foreground: 0 0% 45%;

  /* 테두리 및 그림자 */
  --radius: 0.75rem; /* 더 부드러운 모서리 */
}

@media (prefers-color-scheme: dark) {
  @theme {
    --color-background: 0 0% 5%;
    --color-card: 0 0% 10%;
    --color-foreground: 0 0% 95%;
  }
}
```

### 모바일 터치 최적화

```css
/* 최소 터치 영역: 44px */
.touchable {
  @apply min-h-[44px] min-w-[44px];
}

/* 큰 버튼 스타일 */
.btn-large {
  @apply h-14 text-lg font-semibold rounded-xl;
}
```

---

## 📂 컴포넌트 구조

### 페이지 레이아웃

```
src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 메인 페이지 (메뉴 리스트)
│   └── globals.css             # 글로벌 스타일
│
├── components/
│   ├── ui/                     # shadcn/ui 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   └── separator.tsx
│   │
│   ├── layout/
│   │   ├── Header.tsx          # 헤더 + 검색바
│   │   ├── CategoryTabs.tsx    # 카테고리 탭
│   │   └── CartSheet.tsx       # 장바구니 사이드바
│   │
│   ├── menu/
│   │   ├── MenuGrid.tsx        # 메뉴 그리드 레이아웃
│   │   ├── MenuCard.tsx        # 메뉴 카드 컴포넌트
│   │   └── MenuDetail.tsx      # 상품 상세 모달
│   │
│   └── order/
│       ├── OrderSummary.tsx    # 주문 요약
│       └── SwipeToOrder.tsx    # 스와이프 주문 버튼
│
├── lib/
│   ├── utils.ts                # 유틸리티 함수
│   └── store.ts                # Zustand 스토어
│
├── types/
│   └── menu.ts                 # 타입 정의
│
└── data/
    └── mock-menu.ts            # 모크 데이터
```

---

## 🚀 구현 로드맵

### **Phase 1: 기반 설정** (1-2시간)

#### 1.1 shadcn/ui 컴포넌트 설치
```bash
pnpm dlx shadcn@latest add card input dialog sheet tabs badge separator
```

#### 1.2 타입 정의 및 모크 데이터
- [ ] `types/menu.ts` 생성
- [ ] `data/mock-menu.ts` 생성 (20-30개 메뉴 아이템)
- [ ] 이미지 최적화 설정 (`next.config.ts`)

#### 1.3 색상 테마 커스터마이징
- [ ] `src/app/globals.css` 수정 (주황/빨강 계열 색상)
- [ ] 다크모드 색상 조정
- [ ] 터치 최적화 스타일 추가

**검증 체크리스트**:
- ✅ 모든 shadcn/ui 컴포넌트가 정상 설치됨
- ✅ TypeScript 타입 에러 없음
- ✅ 모크 데이터가 타입 정의와 일치함
- ✅ 브라우저에서 커스텀 색상이 적용됨

---

### **Phase 2: 메인 UI 구조** (2-3시간)

#### 2.1 헤더 컴포넌트
```tsx
// components/layout/Header.tsx
'use client'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-primary">FastOrder</h1>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="메뉴 검색..."
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
```

#### 2.2 카테고리 탭
```tsx
// components/layout/CategoryTabs.tsx
'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const categories = [
  { value: 'all', label: '전체' },
  { value: 'coffee', label: '커피' },
  { value: 'dessert', label: '디저트' },
  { value: 'beverage', label: '음료' },
  { value: 'food', label: '푸드' },
]

export function CategoryTabs() {
  return (
    <div className="sticky top-[88px] z-40 bg-background border-b">
      <div className="container mx-auto px-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="touchable"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
```

#### 2.3 메뉴 카드 컴포넌트
```tsx
// components/menu/MenuCard.tsx
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MenuItem } from '@/types/menu'

interface MenuCardProps {
  item: MenuItem
  onClick: () => void
}

export function MenuCard({ item, onClick }: MenuCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow touchable"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          {item.popular && (
            <Badge className="absolute top-2 right-2 bg-accent">
              인기
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <p className="text-xl font-bold text-primary">
          {item.price.toLocaleString()}원
        </p>
      </CardFooter>
    </Card>
  )
}
```

#### 2.4 메뉴 그리드
```tsx
// components/menu/MenuGrid.tsx
'use client'

import { useState } from 'react'
import { MenuCard } from './MenuCard'
import { MenuDetail } from './MenuDetail'
import type { MenuItem } from '@/types/menu'

interface MenuGridProps {
  items: MenuItem[]
}

export function MenuGrid({ items }: MenuGridProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {items.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            onClick={() => setSelectedItem(item)}
          />
        ))}
      </div>

      <MenuDetail
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  )
}
```

**검증 체크리스트**:
- ✅ 헤더가 상단에 고정됨
- ✅ 검색창 포커스 시 키보드 입력 가능
- ✅ 카테고리 탭 클릭 시 선택 상태 변경
- ✅ 메뉴 카드가 그리드로 올바르게 표시됨
- ✅ 반응형 레이아웃 동작 확인 (모바일/태블릿/데스크톱)

---

### **Phase 3: 인터랙션 구현** (2-3시간)

#### 3.1 상품 상세 모달
```tsx
// components/menu/MenuDetail.tsx
'use client'

import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import type { MenuItem } from '@/types/menu'

interface MenuDetailProps {
  item: MenuItem | null
  onClose: () => void
}

export function MenuDetail({ item, onClose }: MenuDetailProps) {
  const [quantity, setQuantity] = useState(1)

  if (!item) return null

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>

        <DialogHeader>
          <DialogTitle className="text-2xl">{item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-muted-foreground">{item.description}</p>

          <div className="flex gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-primary">
              {item.price.toLocaleString()}원
            </p>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold w-8 text-center">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button className="w-full btn-large" size="lg">
            {(item.price * quantity).toLocaleString()}원 담기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

#### 3.2 장바구니 사이드바
```tsx
// components/layout/CartSheet.tsx
'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function CartSheet() {
  const itemCount = 3 // TODO: 실제 장바구니 상태 연결

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
          size="icon"
        >
          <ShoppingCart className="h-6 w-6" />
          {itemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>장바구니</SheetTitle>
        </SheetHeader>

        {/* TODO: 장바구니 아이템 리스트 */}
        <div className="flex-1 py-4">
          <p className="text-muted-foreground text-center py-8">
            장바구니가 비어있습니다
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>총 금액</span>
            <span className="text-primary">0원</span>
          </div>
          <Button className="w-full btn-large" size="lg" disabled>
            주문하기
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

#### 3.3 Zustand 스토어 (장바구니 상태 관리)
```typescript
// lib/store.ts
import { create } from 'zustand'
import type { CartStore, MenuItem, CartItem } from '@/types/menu'

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item: MenuItem) => {
    const existingItem = get().items.find((i) => i.id === item.id)

    if (existingItem) {
      set({
        items: get().items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      })
    } else {
      set({ items: [...get().items, { ...item, quantity: 1 }] })
    }
  },

  removeItem: (id: string) => {
    set({ items: get().items.filter((i) => i.id !== id) })
  },

  updateQuantity: (id: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(id)
      return
    }

    set({
      items: get().items.map((i) =>
        i.id === id ? { ...i, quantity } : i
      ),
    })
  },

  clearCart: () => {
    set({ items: [] })
  },

  getTotalPrice: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },
}))
```

**검증 체크리스트**:
- ✅ 메뉴 카드 클릭 시 상세 모달 열림
- ✅ 수량 증감 버튼 동작
- ✅ 장바구니 버튼 클릭 시 사이드바 열림
- ✅ 장바구니에 아이템 추가/제거 동작
- ✅ 총 금액 계산 정확성

---

### **Phase 4: 주문 플로우** (2-3시간)

#### 4.1 스와이프 주문 버튼
```tsx
// components/order/SwipeToOrder.tsx
'use client'

import { useState } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

interface SwipeToOrderProps {
  totalPrice: number
  onComplete: () => void
}

export function SwipeToOrder({ totalPrice, onComplete }: SwipeToOrderProps) {
  const [dragX, setDragX] = useState(0)
  const threshold = 200 // 스와이프 완료 임계값

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > threshold) {
      onComplete()
    } else {
      setDragX(0)
    }
  }

  return (
    <div className="relative h-16 bg-muted rounded-full overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold text-muted-foreground">
          밀어서 주문하기
        </span>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 250 }}
        dragElastic={0.2}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        className="absolute left-0 top-0 h-16 w-16 bg-primary rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg"
        style={{ x: dragX }}
      >
        <ChevronRight className="h-6 w-6 text-primary-foreground" />
      </motion.div>

      <div
        className="absolute left-0 top-0 h-full bg-primary/20 transition-all"
        style={{ width: `${Math.min((dragX / threshold) * 100, 100)}%` }}
      />
    </div>
  )
}
```

#### 4.2 주문 확인 애니메이션
```tsx
// components/order/OrderConfirmation.tsx
'use client'

import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface OrderConfirmationProps {
  isOpen: boolean
  onClose: () => void
}

export function OrderConfirmation({ isOpen, onClose }: OrderConfirmationProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="flex justify-center"
        >
          <CheckCircle className="h-24 w-24 text-primary" />
        </motion.div>

        <h2 className="text-2xl font-bold mt-4">주문 완료!</h2>
        <p className="text-muted-foreground">
          주문이 성공적으로 접수되었습니다.
        </p>
      </DialogContent>
    </Dialog>
  )
}
```

**검증 체크리스트**:
- ✅ 스와이프 동작이 부드럽게 작동
- ✅ 임계값 도달 시 주문 완료 처리
- ✅ 주문 확인 애니메이션 표시
- ✅ 주문 후 장바구니 초기화

---

### **Phase 5: 최적화 및 마무리** (1-2시간)

#### 5.1 이미지 최적화
```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
```

#### 5.2 검색 기능 구현
```tsx
// components/layout/Header.tsx 업데이트
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface HeaderProps {
  onSearch: (query: string) => void
}

export function Header({ onSearch }: HeaderProps) {
  const [query, setQuery] = useState('')

  const handleSearch = (value: string) => {
    setQuery(value)
    onSearch(value)
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-primary">FastOrder</h1>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="메뉴 검색..."
              className="pl-10 h-12 text-base"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
```

#### 5.3 성능 최적화 체크리스트
- [ ] 메뉴 카드에 `loading="lazy"` 적용
- [ ] 서버 컴포넌트 활용 (정적 콘텐츠)
- [ ] 클라이언트 컴포넌트 최소화 (인터랙티브 부분만)
- [ ] 번들 크기 분석 (`pnpm run build`)
- [ ] Lighthouse 성능 점수 90+ 달성

#### 5.4 반응형 디자인 검증
- [ ] 모바일 (320px - 768px)
- [ ] 태블릿 (768px - 1024px)
- [ ] 데스크톱 (1024px+)
- [ ] 가로/세로 모드 전환

**최종 검증 체크리스트**:
- ✅ 모든 이미지 최적화 적용
- ✅ 검색 기능 정상 동작
- ✅ 반응형 레이아웃 완벽 동작
- ✅ 성능 점수 90+ 달성
- ✅ 접근성 검사 통과

---

## 📊 예상 타임라인

| Phase | 작업 내용 | 예상 시간 | 누적 시간 |
|-------|----------|----------|----------|
| 1 | 기반 설정 | 1-2시간 | 1-2시간 |
| 2 | 메인 UI 구조 | 2-3시간 | 3-5시간 |
| 3 | 인터랙션 구현 | 2-3시간 | 5-8시간 |
| 4 | 주문 플로우 | 2-3시간 | 7-11시간 |
| 5 | 최적화 및 마무리 | 1-2시간 | 8-13시간 |

**총 예상 시간**: 8-13시간

---

## 🎯 성공 지표

### 기능적 요구사항
- ✅ 10초 이내 주문 완료 프로세스
- ✅ 실시간 검색 기능
- ✅ 카테고리별 필터링
- ✅ 장바구니 관리
- ✅ 스와이프 주문 제스처

### 기술적 요구사항
- ✅ Next.js 16 App Router 활용
- ✅ React 19 Server Components 최적화
- ✅ TypeScript strict mode
- ✅ 접근성 (WCAG 2.1 AA)
- ✅ 모바일 퍼스트 반응형 디자인

### 성능 목표
- ✅ Lighthouse Performance Score: 90+
- ✅ First Contentful Paint: <1.5s
- ✅ Largest Contentful Paint: <2.5s
- ✅ Cumulative Layout Shift: <0.1

---

## 🔧 개발 명령어

```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린팅
pnpm lint

# 타입 체크
pnpm tsc --noEmit
```

---

## 📚 참고 자료

### shadcn/ui 컴포넌트
- [Card](https://ui.shadcn.com/docs/components/card)
- [Dialog](https://ui.shadcn.com/docs/components/dialog)
- [Sheet](https://ui.shadcn.com/docs/components/sheet)
- [Tabs](https://ui.shadcn.com/docs/components/tabs)

### Next.js 문서
- [App Router](https://nextjs.org/docs/app)
- [Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

### 디자인 참고
- [FastOrder.my](https://fastorder.my/)
- [음식 주문 앱 UI/UX 베스트 프랙티스](https://www.linkedin.com/advice/0/how-can-you-design-mobile-app-ui-quick-easy-vchqf)

---

## ⚠️ 주의사항

1. **이미지 저작권**: 실제 프로덕션에서는 Unsplash API 또는 자체 이미지 사용
2. **결제 시스템**: 실제 결제 연동 시 보안 고려 필수
3. **데이터베이스**: 현재는 모크 데이터, 실제 DB 연동 필요
4. **인증/인가**: 사용자 로그인 시스템 추가 고려
5. **주문 관리**: 백엔드 API 및 주문 추적 시스템 필요

---

## 🚀 다음 단계

1. **백엔드 연동**
   - Supabase 통합
   - RESTful API 설계

2. **추가 기능**
   - 주문 내역 조회
   - 찜하기/즐겨찾기
   - 리뷰 및 평점 시스템
   - 푸시 알림

3. **배포**
   - Vercel 배포
   - 도메인 연결
   - 분석 도구 통합 (Google Analytics)

---

**작성일**: 2025-10-27
**프레임워크**: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui
**패키지 매니저**: pnpm

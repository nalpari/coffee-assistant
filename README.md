# ☕ Coffee Assistant with AI

> AI 기반 커피 추천 및 주문 관리 시스템

Next.js 16, React 19, TypeScript, Tailwind CSS v4, Claude AI를 활용한 현대적인 풀스택 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🤖 AI 쇼핑 어시스턴트
- **Claude AI 기반 대화형 추천**: 자연어로 커피 주문 및 추천
- **개인화된 제안**: 과거 주문 내역을 기반으로 한 맞춤 추천
- **실시간 재고 확인**: 현재 판매 가능한 제품만 추천
- **대화 컨텍스트 유지**: 이전 대화 내용을 기억하여 자연스러운 대화

### 📦 주문 관리 시스템
- **실시간 주문 추적**: 6단계 주문 상태 관리 (접수 → 확인 → 준비 중 → 준비 완료 → 픽업 완료 → 취소)
- **주문 내역 조회**: 과거 주문 내역 확인 및 재주문
- **주문 상태 알림**: 주문 진행 상태 실시간 업데이트

### 🔐 인증 시스템
- **Google OAuth**: 간편한 구글 로그인
- **자동 세션 관리**: Supabase 미들웨어를 통한 자동 토큰 갱신
- **보호된 라우트**: 인증 필요 페이지 자동 보호

### 🛒 스마트 장바구니
- **실시간 업데이트**: Zustand 기반 빠른 상태 관리
- **재고 검증**: 장바구니 담기 전 자동 재고 확인
- **할인 가격 적용**: 할인 상품 자동 계산
- **사이드 시트 UI**: 어디서나 접근 가능한 장바구니

## 🛠 기술 스택

### Core Framework
- **Next.js 16.0.0** - React 기반 풀스택 프레임워크 (App Router, React Compiler)
- **React 19.2.0** - 최신 React (use hook, Activity API)
- **TypeScript 5** - 타입 안전성

### Backend & AI
- **Anthropic Claude API** - AI 쇼핑 어시스턴트
- **Supabase** - PostgreSQL 데이터베이스, Google OAuth, 실시간 구독
- **TanStack Query v5** - 서버 상태 관리, 캐싱, 자동 리페칭
- **Zustand** - 클라이언트 상태 관리 (장바구니, 채팅)

### UI & Styling
- **Tailwind CSS v4** - 유틸리티 기반 CSS
- **shadcn/ui** - Radix UI 기반 접근성 높은 컴포넌트
- **Framer Motion** - 고급 애니메이션
- **Lucide React** - 아이콘 라이브러리
- **다크 모드 지원** - 자동 테마 전환

### Testing & Quality
- **Vitest** - 빠른 유닛/통합 테스트
- **Testing Library** - React 컴포넌트 테스팅
- **ESLint 9** - 코드 품질 관리
- **TypeScript Strict Mode** - 타입 안전성 강화

### Development Tools
- **pnpm** - 고성능 패키지 매니저
- **React Compiler** - 자동 최적화
- **Geist Font** - Vercel 최적화 폰트

## 📋 필수 요구사항

- **Node.js** 22 이상
- **pnpm** 9 이상
- **Supabase 프로젝트** (데이터베이스 및 인증)
- **Anthropic API 키** (Claude AI)

## 🚀 시작하기

### 1. 저장소 클론 및 의존성 설치

```bash
# 저장소 클론
git clone <repository-url>
cd coffee-assistant-with-ai

# pnpm 설치 (미설치 시)
npm install -g pnpm

# 의존성 설치
pnpm install
```

### 2. 환경 변수 설정

```bash
# 환경 변수 파일 생성
cp .env.local.example .env.local
```

`.env.local` 파일을 열어 다음 값들을 입력하세요:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic AI Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key
```

**환경 변수 획득 방법:**
- **Supabase**: [Supabase 대시보드](https://supabase.com/dashboard) → 프로젝트 설정 → API
- **Anthropic**: [Anthropic Console](https://console.anthropic.com/) → API Keys

### 3. 데이터베이스 설정 (Supabase)

Supabase 프로젝트에서 다음 테이블들을 생성해야 합니다:

- `menu_items` - 메뉴 아이템
- `orders` - 주문 정보
- `order_items` - 주문 상세
- `users` - 사용자 정보

자세한 스키마는 프로젝트 문서를 참조하세요.

### 4. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📜 주요 명령어

### 개발

```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

### 테스트

```bash
# 테스트 실행 (watch mode)
pnpm test

# UI와 함께 테스트 실행
pnpm test:ui

# 커버리지 리포트 생성
pnpm test:coverage
```

### 코드 품질

```bash
# ESLint 실행
pnpm lint
```

### 패키지 관리

```bash
# 의존성 추가
pnpm add <package-name>

# 개발 의존성 추가
pnpm add -D <package-name>

# 의존성 제거
pnpm remove <package-name>

# 의존성 업데이트
pnpm update
```

## 🏗 프로젝트 구조

```
coffee-assistant-with-ai/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # 루트 레이아웃
│   │   ├── page.tsx              # 홈페이지
│   │   ├── ai-recommendations/   # AI 추천 페이지
│   │   ├── products/[id]/        # 제품 상세
│   │   ├── orders/               # 주문 관리
│   │   ├── checkout/             # 결제
│   │   ├── dashboard/            # 대시보드
│   │   ├── auth/                 # 인증 페이지
│   │   ├── api/                  # API 라우트
│   │   │   ├── chat/             # AI 채팅
│   │   │   └── orders/           # 주문 API
│   │   └── actions/              # 서버 액션
│   │
│   ├── components/               # React 컴포넌트
│   │   ├── ui/                   # shadcn/ui 컴포넌트
│   │   ├── auth/                 # 인증 컴포넌트
│   │   ├── cart/                 # 장바구니
│   │   ├── menu/                 # 메뉴 디스플레이
│   │   ├── orders/               # 주문 컴포넌트
│   │   ├── chat/                 # AI 채팅 UI
│   │   └── layout/               # 레이아웃 컴포넌트
│   │
│   ├── lib/                      # 유틸리티 & 클라이언트
│   │   ├── supabase.ts           # Supabase 클라이언트
│   │   ├── claude-client.ts      # Claude API 클라이언트
│   │   ├── shopping-agent.ts     # AI 쇼핑 에이전트
│   │   └── ...                   # 기타 유틸리티
│   │
│   ├── hooks/                    # 커스텀 훅
│   │   ├── use-menu-query.ts     # 메뉴 데이터
│   │   ├── use-orders-query.ts   # 주문 데이터
│   │   └── ...
│   │
│   ├── store/                    # Zustand 스토어
│   │   ├── cart-store.ts         # 장바구니 상태
│   │   └── chat-store.ts         # 채팅 상태
│   │
│   ├── types/                    # TypeScript 타입
│   │   ├── menu.ts
│   │   ├── order.ts
│   │   ├── cart.ts
│   │   └── ...
│   │
│   └── contexts/                 # React 컨텍스트
│       └── AuthContext.tsx       # 인증 컨텍스트
│
├── middleware.ts                 # Next.js 미들웨어 (세션 관리)
├── vitest.config.ts              # Vitest 설정
└── ...
```

## 🎯 핵심 아키텍처

### AI 쇼핑 어시스턴트 플로우

```
사용자 메시지
    ↓
ConversationManager (컨텍스트 수집)
    ↓
ShoppingAgent (Claude API 호출)
    ↓
응답 파싱 및 액션 실행
    ├─ recommend: 제품 추천
    ├─ add_to_cart: 장바구니 추가
    ├─ checkout: 결제 시작
    ├─ get_orders: 주문 조회
    └─ chat: 일반 대화
```

### 상태 관리 전략

- **UI 상태**: React useState/useReducer
- **클라이언트 글로벌 상태**: Zustand (cart, chat)
- **서버 상태**: TanStack Query (menu, orders, products)
- **인증 상태**: React Context + Supabase

### 데이터 페칭 패턴

- **서버 컴포넌트**: 직접 Supabase 쿼리
- **클라이언트 컴포넌트**: TanStack Query 훅
- **Mutations**: 서버 액션 또는 API 라우트

## 🎨 UI 컴포넌트

### shadcn/ui 컴포넌트 추가

```bash
# 단일 컴포넌트 설치
pnpm dlx shadcn@latest add button

# 여러 컴포넌트 한 번에 설치
pnpm dlx shadcn@latest add card input dialog sheet

# 사용 가능한 컴포넌트: https://ui.shadcn.com/docs/components
```

### 스타일링 예제

```tsx
import { cn } from '@/lib/utils'

// Tailwind 유틸리티 클래스
<div className="flex items-center gap-4 dark:bg-black">
  {/* 다크 모드 지원 */}
</div>

// 조건부 클래스 병합
<div className={cn(
  "base-class",
  isActive && "active-class",
  className
)}>
  {/* clsx + tailwind-merge로 충돌 방지 */}
</div>
```

## 🧪 테스팅

### 테스트 작성 예제

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

### 테스트 실행

```bash
# Watch mode로 테스트 실행
pnpm test

# UI와 함께 테스트
pnpm test:ui

# 커버리지 확인
pnpm test:coverage
```

## 🚢 배포

### Vercel 배포 (권장)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. GitHub에 푸시
2. [Vercel](https://vercel.com) 에서 프로젝트 임포트
3. 환경 변수 설정
4. 배포

### 환경 변수 설정 (Vercel)

프로젝트 설정 → Environment Variables에서 다음 변수들을 추가:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

## 📚 개발 가이드

### 컴포넌트 작성 컨벤션

```typescript
// 서버 컴포넌트 (기본)
export default async function ServerComponent() {
  const data = await fetchData()
  return <div>{data}</div>
}

// 클라이언트 컴포넌트 (상호작용 필요 시)
'use client'
export default function ClientComponent() {
  const [state, setState] = useState()
  return <div onClick={() => setState('value')}>{state}</div>
}
```

### 경로 별칭 사용

```typescript
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/types/menu'
```

### API 라우트 작성

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const data = await fetchData()
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  // 처리 로직
  return NextResponse.json({ success: true })
}
```

## 🤝 기여하기

이 프로젝트는 현재 비공개입니다.

## 📄 라이선스

Private

## 🔗 관련 문서

### 프레임워크 & 라이브러리
- [Next.js 문서](https://nextjs.org/docs)
- [React 19 문서](https://react.dev)
- [TypeScript 문서](https://www.typescriptlang.org/docs)

### Backend & AI
- [Supabase 문서](https://supabase.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [TanStack Query](https://tanstack.com/query/latest)

### UI & Styling
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)
- [Framer Motion](https://www.framer.com/motion)

### Testing
- [Vitest](https://vitest.dev)
- [Testing Library](https://testing-library.com)

## 💡 추가 정보

- **CLAUDE.md**: AI 어시스턴트를 위한 상세한 프로젝트 가이드
- **IMPLEMENTATION_GUIDE.md**: 구현 가이드 및 베스트 프랙티스
- **REQUIREMENTS.md**: 프로젝트 요구사항 명세

---

**Made with ❤️ using Next.js, React, and Claude AI**

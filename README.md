# Coffee Assistant with AI

AI 기반 커피 추천 및 관리 시스템입니다. Next.js 16과 React 19를 사용하여 개발된 현대적인 웹 애플리케이션입니다.

## 기술 스택

### 코어 프레임워크
- **Next.js 16.0.0** - React 기반 풀스택 프레임워크
- **React 19.2.0** - 최신 React 버전 (React Compiler 활성화)
- **TypeScript 5** - 타입 안전성을 위한 정적 타입 시스템

### 스타일링 & UI
- **Tailwind CSS v4** - 유틸리티 기반 CSS 프레임워크
  - `@tailwindcss/postcss` - PostCSS 플러그인 아키텍처
  - `@tailwindcss/typography` - 타이포그래피 스타일링
  - `tailwindcss-animate` - 애니메이션 유틸리티
- **shadcn/ui** - 아름답고 접근성 높은 React 컴포넌트
  - **Radix UI** - 접근성 높은 UI 프리미티브
  - **class-variance-authority** - 타입 안전한 컴포넌트 변형 시스템
  - **New York 스타일** - 모던하고 세련된 디자인 시스템
  - **Zinc 베이스 컬러** - 뉴트럴한 색상 팔레트
- **Geist Font** - Vercel의 최적화된 폰트 시스템 (Sans & Mono)
- **다크 모드 지원** - CSS 커스텀 속성을 활용한 자동 테마 전환

### 개발 도구
- **ESLint 9** - 코드 품질 관리
- **React Compiler** - 자동 React 최적화
- **pnpm** - 빠르고 효율적인 패키지 관리자

## 프로젝트 구조

```
coffee-assistant-with-ai/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # 루트 레이아웃 (Geist 폰트, 메타데이터)
│   │   ├── page.tsx        # 홈페이지
│   │   ├── globals.css     # 전역 스타일 (Tailwind, CSS Variables)
│   │   └── favicon.ico     # 파비콘
│   ├── components/         # React 컴포넌트
│   │   └── ui/             # shadcn/ui 컴포넌트
│   │       └── button.tsx  # 버튼 컴포넌트 (설치됨)
│   └── lib/                # 유틸리티 함수
│       └── utils.ts        # cn() 클래스명 병합 유틸리티
├── public/                 # 정적 파일 (SVG 아이콘)
├── .npmrc                  # pnpm 설정
├── .nvmrc                  # Node 버전 명시
├── components.json         # shadcn/ui 설정
├── tailwind.config.ts      # Tailwind CSS 설정
├── postcss.config.mjs      # PostCSS 설정
├── next.config.ts          # Next.js 설정 (React Compiler)
├── tsconfig.json           # TypeScript 설정 (경로 별칭)
├── eslint.config.mjs       # ESLint 설정
├── pnpm-lock.yaml          # pnpm 잠금 파일
└── pnpm-workspace.yaml     # pnpm 워크스페이스 설정
```

## 시작하기

### 필수 요구사항
- Node.js 22 이상
- pnpm 9 이상

### pnpm 설치 (미설치 시)
```bash
npm install -g pnpm
```

### 의존성 설치
```bash
pnpm install
```

### 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

`src/app/page.tsx` 파일을 수정하면 페이지가 자동으로 업데이트됩니다.

### 빌드 및 배포

```bash
# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 코드 린트
pnpm lint
```

### 주요 pnpm 명령어

```bash
# 의존성 추가
pnpm add <package-name>

# 개발 의존성 추가
pnpm add -D <package-name>

# 의존성 제거
pnpm remove <package-name>

# 의존성 업데이트
pnpm update

# 캐시 정리
pnpm store prune
```

## 주요 기능

### App Router
- 파일 기반 라우팅 시스템
- 서버 컴포넌트 기본 지원
- 자동 코드 분할 및 최적화

### 타입스크립트
- Strict 모드 활성화
- `@/*` 경로 별칭으로 간편한 임포트
- 자동 JSX 런타임 (React 임포트 불필요)

### 반응형 디자인
- Tailwind CSS 유틸리티 클래스
- 모바일 우선 접근 방식
- 다크 모드 자동 지원

## 개발 가이드

### 컴포넌트 작성
```typescript
// 서버 컴포넌트 (기본)
export default function ServerComponent() {
  return <div>Server Component</div>
}

// 클라이언트 컴포넌트 (상호작용이 필요한 경우)
'use client'
export default function ClientComponent() {
  return <div>Client Component</div>
}
```

### 경로 별칭 사용
```typescript
// tsconfig.json과 components.json에 정의된 경로 별칭
import { Button } from '@/components/ui/button'      // UI 컴포넌트
import { cn } from '@/lib/utils'                     // 유틸리티 함수
import Component from '@/components/Component'       // 일반 컴포넌트
// import { useHook } from '@/hooks/useHook'         // 커스텀 훅 (향후)
```

### 스타일링
```tsx
import { cn } from '@/lib/utils'

// Tailwind 유틸리티 클래스 사용
<div className="flex items-center gap-4 dark:bg-black">
  {/* 다크 모드: dark: 접두사 사용 */}
</div>

// cn() 유틸리티로 조건부 클래스 병합
<div className={cn(
  "base-class",
  isActive && "active-class",
  className  // 외부에서 전달된 클래스
)}>
  {/* clsx + tailwind-merge로 클래스 충돌 방지 */}
</div>
```

### shadcn/ui 컴포넌트 사용
```tsx
import { Button } from '@/components/ui/button'

export default function Example() {
  return (
    <div className="flex gap-2">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
    </div>
  )
}
```

#### 컴포넌트 추가하기
```bash
# 원하는 컴포넌트 설치 (src/components/ui/에 복사됨)
pnpm dlx shadcn@latest add button   # 이미 설치됨
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add dropdown-menu

# 여러 컴포넌트 한 번에 설치
pnpm dlx shadcn@latest add card input dialog

# 전체 목록: https://ui.shadcn.com/docs/components
```

#### 컴포넌트 커스터마이징
shadcn/ui 컴포넌트는 프로젝트에 직접 복사되므로 자유롭게 수정 가능합니다:
```tsx
// src/components/ui/button.tsx를 열어서 직접 수정
export interface ButtonProps {
  // 새로운 props 추가
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, ...props }, ref) => {
    // 커스텀 로직 추가
    return <Comp className={cn(buttonVariants({ variant, size, className }))} />
  }
)
```

## 배포

### Vercel (권장)
가장 쉬운 배포 방법은 Next.js 개발팀이 만든 [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)을 사용하는 것입니다.

자세한 내용은 [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)를 참조하세요.

## 참고 자료

### 프레임워크
- [Next.js 공식 문서](https://nextjs.org/docs) - Next.js 기능 및 API 학습
- [Next.js 학습 코스](https://nextjs.org/learn) - 인터랙티브 Next.js 튜토리얼
- [React 19 문서](https://react.dev) - React 최신 기능 및 API

### 스타일링 & UI
- [Tailwind CSS v4](https://tailwindcss.com/docs) - Tailwind CSS 유틸리티 클래스
- [shadcn/ui](https://ui.shadcn.com) - UI 컴포넌트 및 예제
- [Radix UI](https://www.radix-ui.com) - 접근성 높은 UI 프리미티브

### 개발 도구
- [pnpm](https://pnpm.io) - 빠른 패키지 관리자
- [TypeScript](https://www.typescriptlang.org) - 타입스크립트 문서

## 라이선스

Private

# shadcn/ui 설치 완료

## 설치 일자
2025년 10월 27일

## 프로젝트 환경
- **React**: 19.2.0
- **Next.js**: 16.0.0
- **TypeScript**: 5
- **Tailwind CSS**: v4
- **패키지 매니저**: pnpm

## 설치된 패키지

### 핵심 의존성
```json
{
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.3.1",
  "@radix-ui/react-slot": "^1.2.3"
}
```

### 개발 의존성
```json
{
  "@tailwindcss/typography": "^0.5.19",
  "tailwindcss-animate": "^1.0.7"
}
```

## 생성된 파일 및 설정

### 1. 유틸리티 함수
**파일**: `src/lib/utils.ts`
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 2. shadcn/ui 설정 파일
**파일**: `components.json`
```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### 3. Tailwind 설정
**파일**: `tailwind.config.ts`
- shadcn/ui 색상 시스템 통합
- HSL 기반 CSS 변수 사용
- 반응형 radius 설정
- tailwindcss-animate 플러그인 추가

### 4. 전역 CSS
**파일**: `src/app/globals.css`
- shadcn/ui CSS 변수 정의
- 라이트/다크 모드 색상 팔레트
- Tailwind v4 호환 스타일

### 5. 설치된 컴포넌트
- ✅ **Button** (`src/components/ui/button.tsx`)

## 사용 방법

### 컴포넌트 추가하기
```bash
pnpm dlx shadcn@latest add [component-name]
```

### 사용 가능한 주요 컴포넌트
- `button` - 버튼 컴포넌트
- `card` - 카드 컴포넌트
- `dialog` - 다이얼로그/모달
- `input` - 입력 필드
- `label` - 레이블
- `select` - 선택 박스
- `textarea` - 텍스트 영역
- `toast` - 토스트 알림
- `dropdown-menu` - 드롭다운 메뉴
- `tabs` - 탭 컴포넌트
- `table` - 테이블
- `form` - 폼 컴포넌트

전체 컴포넌트 목록: https://ui.shadcn.com/docs/components

### Button 컴포넌트 사용 예제

```tsx
import { Button } from "@/components/ui/button"

export default function Example() {
  return (
    <div>
      {/* 기본 버튼 */}
      <Button>Click me</Button>

      {/* 변형 */}
      <Button variant="destructive">Delete</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>

      {/* 크기 */}
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">🔥</Button>
    </div>
  )
}
```

## Tailwind v4 호환성 이슈 해결

### 문제 1: `@apply` 유틸리티 클래스
**에러**: `Cannot apply unknown utility class 'border-border'`

**해결**:
```css
/* Before (Tailwind v3 방식) */
@layer base {
  * {
    @apply border-border;
  }
}

/* After (Tailwind v4 방식) */
@layer base {
  * {
    border-color: hsl(var(--border));
  }
}
```

### 문제 2: darkMode 설정
**에러**: `Type '["class"]' is not assignable to type 'DarkModeStrategy'`

**해결**:
```typescript
// Before
const config: Config = {
  darkMode: ["class"], // ❌ Tailwind v4에서 지원 안 함
}

// After
const config: Config = {
  // darkMode 설정 제거
  // Tailwind v4는 CSS에서 .dark 클래스로 자동 처리
}
```

## 색상 시스템

### CSS 변수 기반 색상
shadcn/ui는 HSL 색상 공간을 사용하여 CSS 변수로 테마를 관리합니다.

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  /* ... */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  /* ... */
}
```

### 색상 사용 예제
```tsx
<div className="bg-background text-foreground">
  <Button className="bg-primary text-primary-foreground">
    Primary Button
  </Button>
</div>
```

## 다크 모드 구현

### 1. next-themes 설치
```bash
pnpm add next-themes
```

### 2. 테마 프로바이더 추가
```tsx
// src/components/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### 3. 레이아웃에 적용
```tsx
// src/app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## 검증 결과

### 빌드 테스트
```bash
pnpm build
```
✅ **성공** - Next.js 프로덕션 빌드 완료 (1257.5ms)

### 생성된 파일
- ✅ `src/lib/utils.ts` - 유틸리티 함수
- ✅ `components.json` - shadcn/ui 설정
- ✅ `tailwind.config.ts` - Tailwind 설정 (v4 호환)
- ✅ `src/app/globals.css` - 전역 CSS 및 테마
- ✅ `src/components/ui/button.tsx` - Button 컴포넌트

## 추가 리소스

### 공식 문서
- [shadcn/ui 공식 문서](https://ui.shadcn.com)
- [컴포넌트 목록](https://ui.shadcn.com/docs/components)
- [테마 커스터마이징](https://ui.shadcn.com/themes)

### Tailwind CSS v4
- [Tailwind CSS v4 문서](https://tailwindcss.com/docs)
- [마이그레이션 가이드](https://tailwindcss.com/docs/upgrade-guide)

### Radix UI
- [Radix UI 문서](https://www.radix-ui.com)
- [Radix Primitives](https://www.radix-ui.com/primitives)

## 다음 단계

1. **테마 전환 구현**: next-themes를 사용한 다크 모드 토글 버튼 추가
2. **컴포넌트 추가**: 프로젝트에 필요한 shadcn/ui 컴포넌트 설치
3. **커스텀 테마**: 브랜드 색상에 맞게 CSS 변수 조정
4. **폼 구현**: shadcn/ui + react-hook-form + zod 통합

## 문제 해결

### 컴포넌트 추가 시 에러
```bash
# 캐시 정리 후 재시도
pnpm store prune
pnpm install
pnpm dlx shadcn@latest add [component-name]
```

### 스타일 적용 안 됨
1. `tailwind.config.ts`의 content 경로 확인
2. `globals.css`가 layout.tsx에 임포트되었는지 확인
3. 개발 서버 재시작: `pnpm dev`

### TypeScript 에러
```bash
# 타입 재생성
pnpm build
```

## 결론

shadcn/ui가 성공적으로 설치되었습니다. 이제 아름답고 접근성 높은 UI 컴포넌트를 사용하여 프로젝트를 개발할 수 있습니다.

- ✅ Tailwind CSS v4 호환
- ✅ Next.js 16 App Router 지원
- ✅ React 19 호환
- ✅ TypeScript 완전 지원
- ✅ 다크 모드 준비 완료

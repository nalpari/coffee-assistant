# PRD: Footer Navigation Bar (하단 네비게이션 바)

## 📋 Document Information
- **작성일**: 2025-10-31
- **버전**: 1.0.0
- **상태**: Draft
- **담당자**: Frontend Team
- **우선순위**: Medium

---

## 🎯 Overview

### Purpose
모바일 환경에서 사용자가 주요 기능에 빠르게 접근할 수 있도록 화면 하단에 고정된 네비게이션 바를 제공합니다.

### Goals
- 모바일 UX 향상: 주요 기능에 대한 접근성 개선
- 일관된 네비게이션: 앱 전체에서 일관된 네비게이션 경험 제공
- 시각적 피드백: 현재 활성화된 페이지를 명확하게 표시

### Success Metrics
- 네비게이션 사용률 > 70%
- 페이지 이동 시간 < 1초
- 사용자 만족도 > 85%

---

## 🎨 Design Specifications

### Visual Reference
참조 이미지와 동일한 디자인 패턴을 따릅니다:
- 하단 고정형 네비게이션 바
- 5개의 아이콘 버튼
- 회색/검은색 상태 표시

### Layout
```
┌─────────────────────────────────────────┐
│                                         │
│         Main Content Area               │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  [홈]  [주문내역]  [AI추천]  [쿠폰]  [마이] │ ← Footer Navigation
└─────────────────────────────────────────┘
```

### Component Structure
```tsx
<footer className="fixed bottom-0 left-0 right-0 bg-white border-t">
  <nav className="flex justify-around items-center h-16">
    <NavButton icon="Home" label="홈" active={true} />
    <NavButton icon="Receipt" label="주문내역" active={false} />
    <NavButton icon="Sparkles" label="AI추천" active={false} />
    <NavButton icon="Ticket" label="쿠폰" active={false} />
    <NavButton icon="User" label="마이" active={false} />
  </nav>
</footer>
```

### Color Specifications

#### Default State (Inactive)
- **아이콘 색상**: `#9CA3AF` (gray-400)
- **라벨 색상**: `#9CA3AF` (gray-400)
- **배경**: 투명

#### Active State
- **아이콘 색상**: `#000000` (black)
- **라벨 색상**: `#000000` (black)
- **배경**: 투명 (선택적으로 subtle background 추가 가능)

#### Container
- **배경색**: `#FFFFFF` (white)
- **테두리**: 상단 `1px solid #E5E7EB` (gray-200)
- **높이**: `64px` (h-16)
- **그림자**: `0 -2px 8px rgba(0, 0, 0, 0.04)` (상단 그림자)

### Typography
- **라벨 폰트 크기**: `11px` (text-xs)
- **라벨 폰트 굵기**: `500` (font-medium)
- **라벨 정렬**: 중앙 정렬

### Icons
- **크기**: `24x24px` (w-6 h-6)
- **스타일**: Line/Outline 스타일
- **라이브러리**: lucide-react 사용

### Spacing
- **버튼 간격**: `justify-around` (자동 균등 분배)
- **아이콘-라벨 간격**: `4px` (gap-1)
- **좌우 패딩**: `safe-area-inset` 고려

---

## ⚙️ Functional Requirements

### FR-1: Navigation Buttons
**설명**: 5개의 주요 네비게이션 버튼 제공

**세부 사항**:
- **홈** (Home)
  - 아이콘: House/Home
  - 기능: 메인 페이지로 이동
  - 경로: `/`

- **주문내역** (Orders)
  - 아이콘: Receipt/FileText
  - 기능: 주문 내역 페이지로 이동
  - 경로: `/orders`

- **AI추천** (AI Recommendations)
  - 아이콘: Sparkles/Bot
  - 기능: AI 기반 커피 추천 페이지로 이동
  - 경로: `/ai-recommendations`

- **쿠폰** (Coupons)
  - 아이콘: Ticket/Gift
  - 기능: 쿠폰 관리 페이지로 이동
  - 경로: `/coupons`

- **마이페이지** (My Page)
  - 아이콘: User/UserCircle
  - 기능: 사용자 프로필 및 설정 페이지로 이동
  - 경로: `/profile`

**우선순위**: P0 (필수)

### FR-2: Active State Indication
**설명**: 현재 활성화된 페이지를 시각적으로 표시

**세부 사항**:
- 현재 경로와 일치하는 버튼을 활성 상태로 표시
- 활성 버튼: 검은색 아이콘 및 라벨
- 비활성 버튼: 회색 아이콘 및 라벨

**우선순위**: P0 (필수)

### FR-3: Fixed Positioning
**설명**: 화면 하단에 고정된 위치

**세부 사항**:
- `position: fixed` 적용
- `bottom: 0` 위치
- 스크롤 시에도 항상 표시
- 컨텐츠 영역과 겹치지 않도록 `pb-16` 패딩 적용

**우선순위**: P0 (필수)

### FR-4: Click Interaction (Phase 1 제외)
**설명**: Phase 1에서는 시각적 요소만 구현, 클릭 이벤트는 추후 구현

**세부 사항**:
- Phase 1: 버튼 렌더링만 구현
- Phase 2: 실제 페이지 이동 기능 추가
- Phase 3: 애니메이션 및 전환 효과 추가

**우선순위**: P1 (Phase 2)

---

## 🔧 Technical Specifications

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Icons**: lucide-react
- **State Management**: React useState (for active state)
- **Routing**: Next.js usePathname hook

### Component Architecture

#### File Structure
```
src/
├── components/
│   └── layout/
│       ├── FooterNavigation.tsx      # Main footer navigation component
│       └── FooterNavButton.tsx       # Individual navigation button
└── app/
    └── layout.tsx                    # Root layout (footer 추가)
```

#### Component Props

**FooterNavigation.tsx**
```typescript
interface FooterNavigationProps {
  className?: string;
}
```

**FooterNavButton.tsx**
```typescript
interface FooterNavButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  isActive: boolean;
  onClick?: () => void; // Phase 2
}
```

### Styling Classes
```css
/* Footer Container */
.footer-nav {
  @apply fixed bottom-0 left-0 right-0;
  @apply bg-white border-t border-gray-200;
  @apply shadow-[0_-2px_8px_rgba(0,0,0,0.04)];
  @apply z-50;
  @apply safe-area-inset-bottom; /* iOS notch 대응 */
}

/* Navigation Container */
.footer-nav-container {
  @apply flex justify-around items-center;
  @apply h-16 px-2;
}

/* Navigation Button */
.footer-nav-button {
  @apply flex flex-col items-center justify-center;
  @apply gap-1 py-2 px-3;
  @apply min-w-[56px];
  @apply transition-colors duration-200;
}

/* Icon */
.footer-nav-icon {
  @apply w-6 h-6;
  @apply transition-colors duration-200;
}

.footer-nav-icon.active {
  @apply text-black;
}

.footer-nav-icon.inactive {
  @apply text-gray-400;
}

/* Label */
.footer-nav-label {
  @apply text-xs font-medium;
  @apply transition-colors duration-200;
}

.footer-nav-label.active {
  @apply text-black;
}

.footer-nav-label.inactive {
  @apply text-gray-400;
}
```

### Responsive Design
```css
/* Mobile First (default) */
- Height: 64px
- Icon Size: 24x24px
- Label: 11px

/* Tablet (768px+) */
- Height: 72px
- Icon Size: 28x28px
- Label: 12px

/* Desktop (1024px+) */
- 데스크톱에서는 사이드바 네비게이션 사용 (footer 숨김)
- Display: hidden on lg:
```

---

## 🚀 Implementation Plan

### Phase 1: Visual Implementation (현재)
**목표**: 시각적 요소만 구현 (링크/이벤트 제외)

**Tasks**:
1. **Setup**
   - [ ] FooterNavigation 컴포넌트 생성
   - [ ] FooterNavButton 컴포넌트 생성
   - [ ] lucide-react 아이콘 import

2. **Layout Integration**
   - [ ] Root layout에 FooterNavigation 추가
   - [ ] Main content에 `pb-16` 패딩 추가
   - [ ] 모바일에서만 표시되도록 responsive 설정

3. **Styling**
   - [ ] Active/Inactive 상태 스타일 구현
   - [ ] 고정 위치 및 그림자 적용
   - [ ] 아이콘 및 라벨 정렬

4. **Testing**
   - [ ] 다양한 화면 크기에서 테스트
   - [ ] iOS Safari safe-area 테스트
   - [ ] 시각적 QA

**예상 소요 시간**: 3-4시간

### Phase 2: Navigation Functionality (추후)
**목표**: 실제 페이지 이동 기능 구현

**Tasks**:
1. [ ] Next.js Link 컴포넌트 통합
2. [ ] usePathname으로 현재 경로 감지
3. [ ] Active state 자동 업데이트
4. [ ] 페이지별 라우팅 설정

**예상 소요 시간**: 2-3시간

### Phase 3: Advanced Features (추후)
**목표**: 사용자 경험 향상

**Tasks**:
1. [ ] 페이지 전환 애니메이션
2. [ ] Haptic feedback (모바일)
3. [ ] 배지 표시 (알림, 미확인 주문 등)
4. [ ] 접근성 개선 (ARIA labels)

**예상 소요 시간**: 3-4시간

---

## 📊 Acceptance Criteria

### Phase 1 Acceptance Criteria
- [x] **AC-1**: 5개의 네비게이션 버튼이 화면 하단에 고정되어 표시됨
- [x] **AC-2**: 첫 번째 버튼(홈)이 검은색으로 활성화 상태로 표시됨
- [x] **AC-3**: 나머지 4개 버튼은 회색 비활성 상태로 표시됨
- [x] **AC-4**: 스크롤 시에도 네비게이션 바가 하단에 고정되어 유지됨
- [x] **AC-5**: 버튼 클릭 시 시각적 피드백 없음 (Phase 1 요구사항)
- [x] **AC-6**: 모바일 화면에서만 표시되고, 데스크톱에서는 숨겨짐
- [x] **AC-7**: iOS Safari에서 safe-area를 고려하여 정상 표시됨

### Phase 2 Acceptance Criteria (추후)
- [ ] **AC-8**: 버튼 클릭 시 해당 페이지로 이동함
- [ ] **AC-9**: 현재 페이지에 해당하는 버튼이 자동으로 활성화됨
- [ ] **AC-10**: 페이지 전환이 부드럽게 이루어짐

---

## 🎨 UI/UX Considerations

### Accessibility
- **ARIA Labels**: 각 버튼에 명확한 aria-label 제공
- **Keyboard Navigation**: 키보드로 네비게이션 가능
- **Screen Reader**: 스크린 리더 지원
- **Color Contrast**: WCAG AA 기준 충족 (4.5:1 이상)

### Mobile Optimization
- **Touch Target**: 최소 44x44px 터치 영역 확보
- **Safe Area**: iOS notch 및 bottom bar 대응
- **Performance**: 부드러운 렌더링 및 전환
- **Battery**: 불필요한 리렌더링 방지

### Visual Feedback
- **Hover State**: 데스크톱에서 호버 시 subtle background
- **Active State**: 명확한 색상 변화로 현재 위치 표시
- **Transition**: 부드러운 색상 전환 (200ms)

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
describe('FooterNavigation', () => {
  it('renders 5 navigation buttons', () => {});
  it('marks the first button as active by default', () => {});
  it('applies correct styles to active button', () => {});
  it('applies correct styles to inactive buttons', () => {});
});

describe('FooterNavButton', () => {
  it('renders icon and label correctly', () => {});
  it('applies active styles when isActive is true', () => {});
  it('applies inactive styles when isActive is false', () => {});
});
```

### Visual Regression Tests
- Playwright를 사용한 스크린샷 비교
- 다양한 화면 크기에서 테스트
- Dark mode 대응 확인

### Manual Testing Checklist
- [ ] iPhone SE (작은 화면)
- [ ] iPhone 14 Pro (노치)
- [ ] iPhone 14 Pro Max (큰 화면)
- [ ] Android (Galaxy S23)
- [ ] iPad (태블릿)
- [ ] Desktop (숨김 확인)

---

## 📝 Implementation Code Skeleton

### FooterNavigation.tsx
```typescript
'use client';

import { Home, Receipt, Sparkles, Ticket, User } from 'lucide-react';
import { FooterNavButton } from './FooterNavButton';

export function FooterNavigation() {
  // Phase 1: Hard-coded active state (home)
  const currentPath = '/'; // Phase 2: usePathname()

  const navItems = [
    { icon: Home, label: '홈', href: '/' },
    { icon: Receipt, label: '주문내역', href: '/orders' },
    { icon: Sparkles, label: 'AI추천', href: '/ai-recommendations' },
    { icon: Ticket, label: '쿠폰', href: '/coupons' },
    { icon: User, label: '마이', href: '/profile' },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-50 lg:hidden">
      <nav className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <FooterNavButton
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={item.href === currentPath}
          />
        ))}
      </nav>
    </footer>
  );
}
```

### FooterNavButton.tsx
```typescript
'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface FooterNavButtonProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
}

export function FooterNavButton({
  icon: Icon,
  label,
  href,
  isActive,
}: FooterNavButtonProps) {
  return (
    <button
      type="button"
      className="flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[56px] transition-colors duration-200"
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon
        className={cn(
          'w-6 h-6 transition-colors duration-200',
          isActive ? 'text-black' : 'text-gray-400'
        )}
      />
      <span
        className={cn(
          'text-xs font-medium transition-colors duration-200',
          isActive ? 'text-black' : 'text-gray-400'
        )}
      >
        {label}
      </span>
    </button>
  );
}
```

---

## 🔄 Future Enhancements

### Phase 3 Features
1. **Badge System**
   - 주문내역에 미확인 주문 개수 표시
   - 쿠폰에 사용 가능한 쿠폰 개수 표시
   - AI추천에 새로운 추천 알림

2. **Animation**
   - 버튼 클릭 시 scale 애니메이션
   - 페이지 전환 시 slide 효과
   - 아이콘 변화 시 morph 애니메이션

3. **Personalization**
   - 사용자 선호도에 따른 버튼 순서 커스터마이징
   - 자주 사용하는 기능 하이라이트

4. **Advanced Interactions**
   - Long press로 quick actions 표시
   - Swipe gesture로 페이지 전환
   - Haptic feedback 추가

---

## 📚 References

### Design System
- [Material Design Bottom Navigation](https://m3.material.io/components/navigation-bar)
- [iOS Human Interface Guidelines - Tab Bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
- [shadcn/ui Components](https://ui.shadcn.com/)

### Technical Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [lucide-react Icons](https://lucide.dev/)
- [Safe Area Insets](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

### Inspiration
- Instagram mobile navigation
- Twitter mobile navigation
- Toss mobile navigation
- 배달의민족 mobile navigation

---

## ✅ Sign-off

### Phase 1 Completion Checklist
- [ ] PRD 리뷰 완료
- [ ] 디자인 시안 확인
- [ ] 기술 스택 검증
- [ ] 컴포넌트 구현
- [ ] 시각적 QA 통과
- [ ] 코드 리뷰 완료
- [ ] 배포 준비 완료

**Approved by**:
- Product Manager: _____________
- Design Lead: _____________
- Tech Lead: _____________
- QA Lead: _____________

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-31
**Next Review**: Phase 2 시작 전

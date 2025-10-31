# PRD: 선택된 카테고리명 표시 기능

## 📋 문서 정보

- **작성일**: 2025-10-31
- **우선순위**: P2 (Medium)
- **영향 범위**: 메인 페이지 카테고리 탭 영역
- **예상 소요 시간**: 2-3 hours

---

## 🎯 문제 정의 (Problem Statement)

### 현재 상황

**카테고리 탭 UI** ([CategoryTabs.tsx:23-50](src/components/menu/CategoryTabs.tsx#L23-L50)):
- 카테고리 아이콘 버튼만 표시 (모바일)
- 아이콘 + 카테고리명 표시 (데스크톱, `sm:inline`)
- **선택된 카테고리가 무엇인지 명확하지 않음** (특히 모바일)

**사용자 요구사항**:
```
"카테고리를 선택할 경우 카테고리 아이콘 출력 영역 바로 밑에
카테고리명을 보여줬으면 좋겠다.
단, 카테고리가 '전체'인 경우는 제외"
```

### 문제점

#### 1️⃣ **모바일 UX 문제**

현재 [CategoryTabs.tsx:44](src/components/menu/CategoryTabs.tsx#L44):
```tsx
<span className="font-medium hidden sm:inline whitespace-nowrap text-sm">{name}</span>
```

**문제**:
- 모바일에서는 아이콘만 표시 (`hidden sm:inline`)
- 사용자가 현재 선택한 카테고리 이름을 알 수 없음
- Coffee, Droplet, Star 아이콘만으로는 의미 파악 어려움

#### 2️⃣ **시각적 피드백 부족**

**현재**:
- 선택된 카테고리: 주황색 그라디언트 배경 + 그림자
- 하지만 **선택된 카테고리명을 강조 표시하는 영역 없음**

**개선 필요**:
- 카테고리 탭 아래에 선택된 카테고리명 명시적 표시
- "전체" 카테고리는 제외 (별도 표시 불필요)

---

## 🎯 목표 (Objectives)

### 비즈니스 목표
- [ ] 사용자가 현재 선택한 카테고리를 명확히 인지
- [ ] 모바일 사용자 경험 개선
- [ ] 카테고리 필터링 기능의 명확성 향상

### 기술적 목표
- [ ] CategoryTabs 컴포넌트 아래 카테고리명 표시 영역 추가
- [ ] "전체" 카테고리 선택 시 카테고리명 미표시
- [ ] 반응형 디자인 적용 (모바일/데스크톱)
- [ ] 부드러운 애니메이션 효과

### UX 목표
- [ ] 선택된 카테고리가 시각적으로 명확히 구분
- [ ] 카테고리 전환 시 부드러운 전환 효과
- [ ] 일관된 디자인 시스템 유지

---

## 🎨 디자인 사양 (Design Specifications)

### 레이아웃 구조

**Before** (현재):
```
┌─────────────────────────────────────┐
│ [Header with Search]                │
├─────────────────────────────────────┤
│ [☕] [💧] [⭐] [🍦] [☕] [☕]        │ ← CategoryTabs (아이콘만)
├─────────────────────────────────────┤
│                                     │
│ [Menu Grid]                         │
│                                     │
└─────────────────────────────────────┘
```

**After** (개선):
```
┌─────────────────────────────────────┐
│ [Header with Search]                │
├─────────────────────────────────────┤
│ [☕] [💧] [⭐] [🍦] [☕] [☕]        │ ← CategoryTabs
├─────────────────────────────────────┤
│         선택됨: COFFEE               │ ← 새로운 카테고리명 표시 영역
├─────────────────────────────────────┤
│                                     │
│ [Menu Grid]                         │
│                                     │
└─────────────────────────────────────┘
```

### 카테고리명 표시 영역 스펙

#### 위치
- **부모 컨테이너**: CategoryTabs 컴포넌트 하단
- **정렬**: 중앙 정렬 (`text-center`)
- **간격**: 상단 `pt-3`, 하단 `pb-2`

#### 스타일
```css
/* 컨테이너 */
container: border-t border-gray-200 bg-gradient-to-b from-background to-muted/20

/* 텍스트 */
font-size: text-sm (14px)
font-weight: font-semibold (600)
color: text-primary (주황색)
letter-spacing: tracking-wide

/* 애니메이션 */
transition: all 300ms ease-in-out
opacity: fade-in from 0 to 1
transform: translateY from -8px to 0
```

#### 조건부 렌더링
```typescript
// "전체" 선택 시: 표시 안 함
if (selectedCategory === 'all') {
  return null;
}

// 다른 카테고리 선택 시: 표시
return (
  <div className="category-name-display">
    선택됨: {categoryName}
  </div>
);
```

---

## 🔧 해결 방안 (Solution)

### Option 1: CategoryTabs 컴포넌트 내부에 추가 (권장)

**장점**:
- ✅ 단일 컴포넌트로 관리 (응집도 높음)
- ✅ 카테고리 데이터 직접 접근 가능
- ✅ 상태 관리 단순화

**구현**:
```tsx
// src/components/menu/CategoryTabs.tsx
export function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  // 선택된 카테고리 정보 찾기
  const selectedCategoryInfo = categories.find(cat => cat.id === selectedCategory);
  const shouldShowName = selectedCategory !== 'all' && selectedCategoryInfo;

  return (
    <div className="sticky top-16 z-40 w-full border-b bg-background backdrop-blur">
      <div className="container px-6 py-4 sm:px-8">
        {/* 기존 카테고리 탭 버튼들 */}
        <div className="flex justify-center gap-2 overflow-x-auto scrollbar-hide">
          {/* ... 기존 코드 ... */}
        </div>

        {/* 새로운 카테고리명 표시 영역 */}
        {shouldShowName && (
          <div className="border-t border-gray-200 pt-3 pb-2 mt-3 text-center animate-fade-in">
            <p className="text-sm font-semibold text-primary tracking-wide">
              선택됨: {selectedCategoryInfo.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### Option 2: 별도 컴포넌트로 분리

**장점**:
- ✅ 관심사 분리 (SRP)
- ✅ 재사용 가능성

**단점**:
- ⚠️ props 전달 복잡도 증가
- ⚠️ 컴포넌트 개수 증가

**구현**:
```tsx
// src/components/menu/SelectedCategoryLabel.tsx
interface SelectedCategoryLabelProps {
  categoryName: string;
}

export function SelectedCategoryLabel({ categoryName }: SelectedCategoryLabelProps) {
  return (
    <div className="border-t border-gray-200 pt-3 pb-2 text-center animate-fade-in">
      <p className="text-sm font-semibold text-primary tracking-wide">
        선택됨: {categoryName}
      </p>
    </div>
  );
}

// src/app/page.tsx
const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name;

<CategoryTabs ... />
{selectedCategory !== 'all' && selectedCategoryName && (
  <SelectedCategoryLabel categoryName={selectedCategoryName} />
)}
```

---

### 권장 방안: Option 1 (컴포넌트 내부 추가)

**이유**:
1. **단순성**: 상태/데이터 관리가 한 곳에서 이루어짐
2. **응집도**: 카테고리 관련 UI가 하나의 컴포넌트에 집중
3. **성능**: 불필요한 props 전달 없음
4. **유지보수**: 카테고리 UI 변경 시 한 파일만 수정

---

## 📐 기술 스펙 (Technical Specifications)

### 파일 변경 사항

#### 1. src/components/menu/CategoryTabs.tsx

**추가할 코드** (Line 22 이후):

```tsx
export function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  // 선택된 카테고리 정보 찾기
  const selectedCategoryInfo = categories.find(cat => cat.id === selectedCategory);
  const shouldShowName = selectedCategory !== 'all' && selectedCategoryInfo;

  return (
    <div className="sticky top-16 z-40 w-full border-b bg-background backdrop-blur supports-[backdrop-filter]:bg-background">
      <div className="container px-6 py-4 sm:px-8">
        {/* 기존 카테고리 탭 버튼들 */}
        <div className="flex justify-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth">
          {categories.map(({ id, name, Icon }) => {
            const isActive = selectedCategory === id;
            return (
              <button
                key={id}
                onClick={() => onCategoryChange(id)}
                className={`
                  flex items-center justify-center gap-2 rounded-full
                  transition-all duration-300 ease-in-out
                  px-3 py-2 sm:px-4 sm:py-2.5
                  cursor-pointer flex-shrink-0
                  ${isActive
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50 scale-105'
                    : 'bg-white border border-gray-200 hover:border-orange-300 hover:shadow-md hover:scale-105 text-gray-700 hover:text-orange-600'
                  }
                `}
              >
                {Icon && <Icon className="h-3 w-3 sm:h-4 sm:w-4" />}
                <span className="font-medium hidden sm:inline whitespace-nowrap text-sm">{name}</span>
              </button>
            );
          })}
        </div>

        {/* 👇 새로운 카테고리명 표시 영역 */}
        {shouldShowName && (
          <div className="border-t border-gray-200 pt-3 pb-2 mt-3 text-center transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-2">
            <p className="text-sm font-semibold text-primary tracking-wide">
              선택됨: {selectedCategoryInfo.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

#### 2. src/app/globals.css (애니메이션 추가, 선택적)

Tailwind CSS v4는 기본 애니메이션을 지원하지만, 커스텀 애니메이션 추가 가능:

```css
@layer utilities {
  /* 페이드인 + 슬라이드 다운 애니메이션 */
  @keyframes fade-slide-in {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-slide-in {
    animation: fade-slide-in 300ms ease-in-out;
  }
}
```

---

## 🚀 구현 단계 (Implementation Steps)

### Step 1: CategoryTabs 컴포넌트 수정 (30분)

```tsx
// src/components/menu/CategoryTabs.tsx

export function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  // 1️⃣ 선택된 카테고리 정보 찾기
  const selectedCategoryInfo = categories.find(cat => cat.id === selectedCategory);
  const shouldShowName = selectedCategory !== 'all' && selectedCategoryInfo;

  return (
    <div className="sticky top-16 z-40 w-full border-b bg-background backdrop-blur supports-[backdrop-filter]:bg-background">
      <div className="container px-6 py-4 sm:px-8">
        {/* 기존 카테고리 탭 */}
        <div className="flex justify-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth">
          {/* ... 기존 버튼 코드 유지 ... */}
        </div>

        {/* 2️⃣ 새로운 카테고리명 표시 영역 */}
        {shouldShowName && (
          <div className="border-t border-gray-200 pt-3 pb-2 mt-3 text-center transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-2">
            <p className="text-sm font-semibold text-primary tracking-wide">
              선택됨: {selectedCategoryInfo.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

**검증**:
```bash
# TypeScript 컴파일 확인
pnpm tsc --noEmit

# ESLint 검사
pnpm lint
```

---

### Step 2: 로컬 테스트 (20분)

```bash
# 개발 서버 시작
pnpm dev
```

**브라우저 테스트**:

```
✅ TC-001: 전체 카테고리 선택
  Given: 메인 페이지 접속
  When: 초기 상태 (전체 선택)
  Then: 카테고리명 표시 영역 없음

✅ TC-002: COFFEE 카테고리 선택
  Given: 메인 페이지
  When: COFFEE 아이콘 클릭
  Then:
    - 카테고리 탭 아래 "선택됨: COFFEE" 표시
    - 페이드인 + 슬라이드 다운 애니메이션
    - 주황색 텍스트 (text-primary)

✅ TC-003: 카테고리 전환
  Given: COFFEE 선택됨
  When: SIGNATURE 클릭
  Then:
    - "선택됨: COFFEE" → "선택됨: SIGNATURE" 부드럽게 전환
    - 애니메이션 재생

✅ TC-004: 전체로 돌아가기
  Given: SIGNATURE 선택됨
  When: 전체 아이콘 클릭
  Then:
    - 카테고리명 표시 영역 사라짐
    - 페이드아웃 애니메이션

✅ TC-005: 모바일 반응형
  Given: 모바일 뷰포트 (375px)
  When: 카테고리 선택
  Then:
    - 카테고리명 명확히 표시
    - 레이아웃 깨짐 없음
    - 터치 가능 영역 충분
```

---

### Step 3: 반응형 디자인 검증 (15분)

**테스트 뷰포트**:
```
- Mobile S: 320px
- Mobile M: 375px
- Mobile L: 425px
- Tablet: 768px
- Desktop: 1024px
```

**검증 포인트**:
- [ ] 모든 뷰포트에서 텍스트 가독성
- [ ] 중앙 정렬 유지
- [ ] 간격 일관성
- [ ] 애니메이션 부드러움

---

### Step 4: 접근성 검증 (10분)

**ARIA 속성 추가 (선택적)**:
```tsx
{shouldShowName && (
  <div
    className="..."
    role="status"
    aria-live="polite"
    aria-label="선택된 카테고리"
  >
    <p className="...">
      선택됨: {selectedCategoryInfo.name}
    </p>
  </div>
)}
```

**접근성 체크리스트**:
- [ ] 스크린 리더로 카테고리명 읽힘
- [ ] 키보드 네비게이션 영향 없음
- [ ] 색상 대비 4.5:1 이상 (WCAG AA)

---

### Step 5: 성능 최적화 (10분)

**useMemo로 최적화** (선택적):
```tsx
const selectedCategoryInfo = useMemo(
  () => categories.find(cat => cat.id === selectedCategory),
  [selectedCategory]
);
```

**성능 검증**:
```bash
# React DevTools Profiler로 렌더링 시간 측정
# 카테고리 전환 시 불필요한 리렌더링 확인
```

---

### Step 6: 커밋 (5분)

```bash
git add src/components/menu/CategoryTabs.tsx
git commit -m "feat: Add selected category name display below category tabs

- Display selected category name below icon tabs
- Hide category name when 'All' is selected
- Add fade-in and slide-down animation
- Improve mobile UX with clear category indication
- Use text-primary color for visual consistency

Closes #ISSUE_NUMBER (if applicable)"
```

---

## ✅ 완료 기준 (Definition of Done)

### 필수 요구사항
- [ ] 카테고리 선택 시 카테고리명 표시
- [ ] "전체" 선택 시 카테고리명 미표시
- [ ] 카테고리 탭 바로 아래 위치
- [ ] 부드러운 애니메이션 효과
- [ ] 모바일/데스크톱 반응형

### 코드 품질
- [ ] TypeScript 타입 에러 없음
- [ ] ESLint 경고 없음
- [ ] 불필요한 리렌더링 없음

### UX 품질
- [ ] 카테고리 전환 시 자연스러운 애니메이션
- [ ] 텍스트 가독성 확보
- [ ] 디자인 시스템 일관성 유지

### 접근성
- [ ] 스크린 리더 호환
- [ ] 색상 대비 WCAG AA 준수
- [ ] 키보드 네비게이션 영향 없음

---

## 🎨 UI/UX 가이드라인

### 색상 팔레트

```css
/* 카테고리명 텍스트 */
color: hsl(var(--primary))  /* 주황색 (25 95% 53%) */

/* 구분선 */
border-color: hsl(var(--border))  /* 회색 (240 5.9% 90%) */

/* 배경 그라디언트 (선택적) */
background: linear-gradient(
  to bottom,
  hsl(var(--background)),
  hsl(var(--muted) / 0.2)
)
```

### 타이포그래피

```css
font-size: 0.875rem;      /* 14px */
font-weight: 600;         /* semibold */
letter-spacing: 0.025em;  /* tracking-wide */
line-height: 1.25rem;     /* 20px */
```

### 간격 시스템

```css
padding-top: 0.75rem;     /* pt-3, 12px */
padding-bottom: 0.5rem;   /* pb-2, 8px */
margin-top: 0.75rem;      /* mt-3, 12px */
```

### 애니메이션 타이밍

```css
duration: 300ms;
easing: cubic-bezier(0.4, 0, 0.2, 1);  /* ease-in-out */
```

---

## 🧪 테스트 계획 (Test Plan)

### 수동 테스트 시나리오

#### 시나리오 1: 기본 동작
```
Given: 메인 페이지 접속 (전체 선택 상태)
When: COFFEE 카테고리 클릭
Then:
  1. 카테고리 탭 아래 "선택됨: COFFEE" 표시
  2. 페이드인 애니메이션 (300ms)
  3. 텍스트 색상 주황색
  4. 중앙 정렬
```

#### 시나리오 2: 카테고리 전환
```
Given: COFFEE 선택됨
When: SIGNATURE 클릭
Then:
  1. "선택됨: COFFEE" 사라짐
  2. "선택됨: SIGNATURE" 나타남
  3. 부드러운 전환 효과
```

#### 시나리오 3: 전체 복귀
```
Given: SIGNATURE 선택됨
When: 전체 클릭
Then:
  1. "선택됨: SIGNATURE" 사라짐
  2. 페이드아웃 애니메이션
  3. 카테고리명 표시 영역 완전히 제거
```

#### 시나리오 4: 모바일 UX
```
Given: 모바일 뷰포트 (375px)
When: 카테고리 선택
Then:
  1. 아이콘만 보이는 탭에서도 카테고리명 명확히 표시
  2. 레이아웃 깨짐 없음
  3. 터치 가능 영역 충분 (최소 44px)
```

### E2E 테스트 (선택적)

```typescript
// __tests__/e2e/category-tabs.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Category Name Display', () => {
  test('should show category name when selected (except All)', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // 초기 상태: 전체 선택, 카테고리명 없음
    await expect(page.getByText(/선택됨:/)).not.toBeVisible();

    // COFFEE 클릭
    await page.getByRole('button', { name: /COFFEE/ }).click();

    // 카테고리명 표시 확인
    await expect(page.getByText('선택됨: COFFEE')).toBeVisible();

    // 색상 확인 (text-primary)
    const categoryLabel = page.getByText('선택됨: COFFEE');
    await expect(categoryLabel).toHaveCSS('color', 'rgb(251, 113, 68)'); // 주황색

    // 전체로 돌아가기
    await page.getByRole('button', { name: /전체/ }).click();

    // 카테고리명 사라짐
    await expect(page.getByText(/선택됨:/)).not.toBeVisible();
  });

  test('should animate smoothly on category change', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // COFFEE 선택
    await page.getByRole('button', { name: /COFFEE/ }).click();
    await page.waitForSelector('text=선택됨: COFFEE');

    // SIGNATURE로 전환
    await page.getByRole('button', { name: /SIGNATURE/ }).click();

    // 새 카테고리명 표시 확인
    await expect(page.getByText('선택됨: SIGNATURE')).toBeVisible();
    await expect(page.getByText('선택됨: COFFEE')).not.toBeVisible();
  });
});
```

---

## 📊 성공 지표 (Success Metrics)

### 정량적 지표

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|-----------|
| 모바일 카테고리 인지도 | 낮음 | 100% | 사용자 테스트 |
| 카테고리 전환 애니메이션 | 없음 | 부드러움 | 시각적 검증 |
| 렌더링 성능 | - | <16ms | React DevTools Profiler |
| 접근성 점수 | - | 100 | Lighthouse |

### 정성적 지표

- ✅ **명확성**: 사용자가 선택한 카테고리를 즉시 인지
- ✅ **일관성**: 디자인 시스템과 조화로운 UI
- ✅ **반응성**: 카테고리 전환 시 즉각적 피드백

---

## 🚨 위험 요소 및 대응 (Risks & Mitigation)

### 위험 요소 1: 레이아웃 높이 증가로 인한 스크롤 문제

**위험**:
- 카테고리명 영역 추가로 sticky header 높이 증가
- 초기 뷰포트에서 메뉴 그리드가 밀려남

**대응책**:
1. **최소 높이 유지**: padding을 `pt-3 pb-2`로 최소화
2. **조건부 렌더링**: 전체 선택 시 영역 완전 제거
3. **모니터링**: 사용자 피드백 수집 후 높이 조정

### 위험 요소 2: 카테고리명 텍스트 길이

**위험**:
- "SMOOTHIE & FRAPPE" 같은 긴 이름이 모바일에서 잘림
- 다국어 지원 시 텍스트 길이 변동

**대응책**:
1. **반응형 폰트 크기**: 모바일에서 `text-xs` 고려
2. **텍스트 줄임표**: `truncate` 또는 `line-clamp-1`
3. **번역 가이드**: 카테고리명은 15자 이내로 제한

### 위험 요소 3: 애니메이션 성능

**위험**:
- 카테고리 빠르게 전환 시 애니메이션 끊김
- 저사양 디바이스에서 프레임 드롭

**대응책**:
1. **CSS Transform 사용**: `translateY` 대신 `transform`
2. **GPU 가속**: `will-change: transform, opacity`
3. **애니메이션 간소화**: 저사양 디바이스에서 애니메이션 비활성화
4. **`prefers-reduced-motion` 존중**:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .animate-fade-slide-in {
       animation: none;
     }
   }
   ```

---

## 📚 참고 자료 (References)

### Tailwind CSS 공식 문서
- [Animation](https://tailwindcss.com/docs/animation)
- [Transition](https://tailwindcss.com/docs/transition-property)
- [Responsive Design](https://tailwindcss.com/docs/responsive-design)

### React 패턴
- [Conditional Rendering](https://react.dev/learn/conditional-rendering)
- [useMemo Hook](https://react.dev/reference/react/useMemo)

### 접근성
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)

### 내부 문서
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - 프로젝트 구현 가이드
- [REQUIREMENTS.md](REQUIREMENTS.md) - 요구사항 문서

---

## 🔄 변경 이력 (Changelog)

### 2025-10-31 - 초안 작성
- **작성자**: Claude Code
- **요구사항**: 카테고리 선택 시 카테고리명 표시 ("전체" 제외)
- **구현 방식**: CategoryTabs 컴포넌트 내부에 조건부 렌더링 추가
- **예상 소요**: 2-3시간

---

## 🎓 학습 내용 (Lessons Learned)

### UX 개선 원칙
1. **명시적 피드백**: 사용자 액션에 즉각적 시각적 피드백
2. **조건부 표시**: 불필요한 정보는 숨김 (전체 카테고리)
3. **애니메이션**: 상태 전환 시 부드러운 효과로 자연스러움

### React 컴포넌트 설계
1. **단일 책임**: 카테고리 관련 UI는 CategoryTabs에 집중
2. **조건부 렌더링**: `&&` 연산자로 간결하게 표현
3. **성능**: `useMemo`로 불필요한 재계산 방지

### Tailwind CSS 활용
1. **유틸리티 우선**: 커스텀 CSS 없이 Tailwind만으로 구현
2. **애니메이션**: `animate-in fade-in slide-in-from-top-2`로 선언적 표현
3. **반응형**: `sm:` prefix로 모바일/데스크톱 분기

---

## 🏁 최종 정리

### 핵심 요약
- **기능**: 카테고리 선택 시 카테고리명 표시 ("전체" 제외)
- **위치**: 카테고리 탭 바로 아래
- **스타일**: 주황색 텍스트 + 페이드인 애니메이션
- **구현**: CategoryTabs 컴포넌트 내부에 조건부 렌더링 추가
- **예상 소요**: 2-3시간
- **위험도**: 낮음 (UI 개선)

### 다음 단계
1. ✅ PRD 검토 및 승인
2. ⏳ CategoryTabs.tsx 수정
3. ⏳ 로컬 테스트 (브라우저 + 반응형)
4. ⏳ 접근성 검증
5. ⏳ 커밋 및 배포

**성공을 기원합니다! 🚀**

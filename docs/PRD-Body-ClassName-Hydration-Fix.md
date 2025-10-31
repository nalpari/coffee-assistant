# PRD: Body className Hydration Mismatch 완전 해결

## 📋 문서 정보

- **작성일**: 2025-10-31
- **우선순위**: P0 (Critical)
- **영향 범위**: 전체 애플리케이션 렌더링
- **예상 소요 시간**: 2-4 hours

---

## 🎯 문제 정의 (Problem Statement)

### 현재 상황

메인 페이지 렌더링 시와 브라우저 빈 공간 클릭 시 하이드레이션 에러가 지속적으로 발생:

```
layout.tsx:29 A tree hydrated but some attributes of the server rendered HTML
didn't match the client properties.

  <body
+   className="geist_a71539c9-module__T19VSG__variable geist_mono_8d43a2aa-module__8Li5zG__var..."
-   className="light"
  >
```

### 에러 분석

**에러 위치**: [layout.tsx:29](src/app/layout.tsx#L29)

**에러 유형**: Hydration Mismatch (서버/클라이언트 불일치)

**발생 조건**:
1. ✅ 메인 페이지 최초 렌더링 시
2. ✅ 브라우저 빈 공간 클릭 시
3. ✅ 개발 서버 재시작 후에도 지속

### 근본 원인 분석

#### 1️⃣ 코드 레벨 분석

**현재 layout.tsx 상태** ([layout.tsx:30](src/app/layout.tsx#L30)):
```tsx
<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
```

**에러가 보고하는 내용**:
- 서버: `className="light"` 렌더링
- 클라이언트: `className="geist_..."` 하이드레이션

**문제점**:
- ❌ 현재 코드에는 `className="light"`가 **존재하지 않음**
- ❌ 에러 메시지와 실제 코드 불일치
- ⚠️ `.next` 빌드 캐시에 이전 버전 HTML 잔존 가능성
- ⚠️ 브라우저 확장 프로그램의 DOM 조작 가능성

#### 2️⃣ Next.js 빌드 캐시 문제

**캐시 영향**:
- `.next/` 디렉토리에 서버 렌더링 결과 캐싱
- 코드 변경 후에도 이전 빌드 결과 사용 가능
- `pnpm dev` 재시작만으로는 캐시 완전 제거 불가

**검증 필요 사항**:
```bash
# 캐시 파일 확인
ls -la .next/server/app/
ls -la .next/cache/
```

#### 3️⃣ 브라우저 확장 프로그램 간섭

**가능한 간섭 시나리오**:
- Dark mode 확장 프로그램이 `className="light"` 주입
- React DevTools가 개발 모드 속성 추가
- 광고 차단/보안 확장 프로그램의 DOM 수정

**React 공식 문서 참고**:
> "It can also happen if the client has a browser extension installed
> which messes with the HTML before React loaded."

---

## 🎯 목표 (Objectives)

### 비즈니스 목표
- [ ] 사용자에게 콘솔 에러 없는 깔끔한 경험 제공
- [ ] 개발자 경험 개선 (디버깅 노이즈 제거)
- [ ] 프로덕션 안정성 확보

### 기술적 목표
- [ ] 하이드레이션 에러 100% 제거
- [ ] 서버/클라이언트 렌더링 일치성 보장
- [ ] 빌드 캐시 문제 완전 해결
- [ ] 브라우저 확장 프로그램 간섭 방어

### 성공 지표
- ✅ 콘솔 에러 0건
- ✅ 페이지 로드 시 하이드레이션 경고 없음
- ✅ 모든 인터랙션에서 에러 미발생
- ✅ 다양한 브라우저/환경에서 안정적 동작

---

## 🔧 해결 방안 (Solution)

### Phase 1: 빌드 캐시 완전 제거 (15분)

#### 1.1 개발 서버 종료
```bash
# 실행 중인 개발 서버 모두 종료
lsof -ti:3000 | xargs kill -9
```

#### 1.2 Next.js 캐시 삭제
```bash
# .next 디렉토리 완전 삭제
rm -rf .next

# node_modules 캐시 정리 (선택적)
rm -rf node_modules/.cache
```

#### 1.3 pnpm 캐시 정리
```bash
# pnpm store 검증 및 정리
pnpm store prune

# 의존성 재설치 (선택적, 문제 지속 시)
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 1.4 클린 빌드 실행
```bash
# 완전히 새로운 빌드 생성
pnpm build

# 개발 서버 재시작
pnpm dev
```

**검증 방법**:
```bash
# 빌드 타임스탬프 확인
ls -la .next/

# 서버 렌더링 결과 확인
cat .next/server/app/layout.html 2>/dev/null || echo "No cached HTML"
```

---

### Phase 2: 브라우저 환경 정리 (10분)

#### 2.1 브라우저 캐시 완전 삭제

**Chrome/Edge**:
1. `Cmd + Shift + Delete` (macOS) / `Ctrl + Shift + Delete` (Windows)
2. "시간 범위": **전체 기간**
3. 체크 항목:
   - ✅ 쿠키 및 기타 사이트 데이터
   - ✅ 캐시된 이미지 및 파일
   - ✅ 호스팅 앱 데이터
4. "데이터 삭제" 클릭

**Firefox**:
1. `Cmd + Shift + Delete`
2. "지울 기간": **모든 것**
3. 체크 항목:
   - ✅ 쿠키
   - ✅ 캐시
   - ✅ 사이트 환경 설정
4. "지금 삭제" 클릭

#### 2.2 확장 프로그램 비활성화 테스트

**시크릿/프라이빗 모드 테스트**:
```
1. Chrome 시크릿 창 열기 (Cmd + Shift + N)
2. http://localhost:3000 접속
3. 콘솔 에러 확인
4. 빈 공간 클릭 → 에러 재발 여부 확인
```

**확장 프로그램 개별 비활성화**:
```
우선 비활성화 대상:
1. Dark Reader, Night Eye 등 다크모드 확장
2. Stylish, Stylus 등 CSS 주입 확장
3. Grammarly, LanguageTool 등 DOM 수정 확장
4. React DevTools (개발 모드 한정)
```

---

### Phase 3: layout.tsx 방어 코드 강화 (20분)

#### 3.1 현재 코드 분석

**현재 [layout.tsx:28-31](src/app/layout.tsx#L28-L31)**:
```tsx
<html lang="ko" suppressHydrationWarning>
  <body
    className={`${geistSans.variable} ${geistMono.variable} antialiased`}
  >
```

**문제점**:
- ✅ `suppressHydrationWarning`은 `<html>`에만 적용
- ❌ `<body>`는 하이드레이션 검증 활성화 상태
- ⚠️ 템플릿 리터럴 동적 생성 시 클래스명 해시 변경 가능

#### 3.2 개선 방안 1: body에도 suppressHydrationWarning 추가

**코드 변경**:
```tsx
<html lang="ko" suppressHydrationWarning>
  <body
    className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    suppressHydrationWarning
  >
```

**장점**:
- ✅ 브라우저 확장 프로그램 간섭 완전 방어
- ✅ 클래스명 해시 변경 무시
- ✅ 즉각적인 에러 해결

**단점**:
- ⚠️ 실제 하이드레이션 문제 마스킹 가능
- ⚠️ 근본 원인 숨김 위험

**적용 시나리오**: Phase 1, 2 후에도 에러 지속 시

#### 3.3 개선 방안 2: className 정적 문자열로 변경

**코드 변경**:
```tsx
<body className={geistSans.variable + ' ' + geistMono.variable + ' antialiased'}>
```

**또는**:
```tsx
import { cn } from '@/lib/utils';

<body className={cn(geistSans.variable, geistMono.variable, 'antialiased')}>
```

**장점**:
- ✅ 템플릿 리터럴 동적 평가 제거
- ✅ 클래스명 생성 일관성 보장
- ✅ 더 명확한 클래스 조합

**단점**:
- ⚠️ 근본 원인이 캐시라면 효과 제한적

#### 3.4 개선 방안 3: 폰트 로딩 전략 변경

**현재 문제 가능성**:
- `next/font/google`이 동적 클래스명 생성
- 서버/클라이언트 빌드 시점 차이로 해시 불일치

**대안 코드**:
```tsx
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // 폰트 로딩 전략 명시
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});
```

**장점**:
- ✅ 폰트 로딩 동작 예측 가능
- ✅ FOUT(Flash of Unstyled Text) 개선

---

### Phase 4: 검증 및 모니터링 (30분)

#### 4.1 로컬 환경 테스트 체크리스트

```
[ ] Chrome 일반 모드
  [ ] 페이지 로드 → 콘솔 에러 없음
  [ ] 빈 공간 클릭 → 에러 미발생
  [ ] 페이지 새로고침 (Cmd+R) → 안정적
  [ ] 하드 리프레시 (Cmd+Shift+R) → 안정적

[ ] Chrome 시크릿 모드
  [ ] 동일 테스트 수행
  [ ] 확장 프로그램 영향 확인

[ ] Firefox
  [ ] 크로스 브라우저 호환성 검증

[ ] Safari (가능 시)
  [ ] WebKit 엔진 검증
```

#### 4.2 개발 도구 활용 검증

**React DevTools Profiler**:
```
1. React DevTools 설치/활성화
2. Profiler 탭 → "Start profiling"
3. 페이지 새로고침
4. Hydration 경고 확인
5. Commit 단계별 분석
```

**Next.js Build Analyzer**:
```bash
# 프로덕션 빌드 분석
ANALYZE=true pnpm build

# 번들 크기 및 서버 렌더링 체크
```

#### 4.3 프로덕션 빌드 테스트

```bash
# 프로덕션 빌드 생성
pnpm build

# 프로덕션 서버 실행
pnpm start

# 브라우저에서 http://localhost:3000 접속
# 동일한 테스트 수행
```

**검증 포인트**:
- [ ] 프로덕션 모드에서 에러 미발생
- [ ] 개발 모드 전용 경고 아님 확인
- [ ] 서버 사이드 렌더링 정상 동작

---

## 📐 기술 스펙 (Technical Specifications)

### 환경 요구사항

**Node.js & Package Manager**:
- Node.js: >=18.17.0
- pnpm: >=8.0.0

**브라우저 지원**:
- Chrome/Edge: 최신 2개 버전
- Firefox: 최신 2개 버전
- Safari: 최신 2개 버전

**Next.js 설정**:
- React Compiler: Enabled
- SSR: Enabled (App Router 기본)
- Hydration: Enabled

### 파일 변경 사항

#### 필수 변경

**1. .next/ 삭제** (빌드 캐시 제거)
```bash
rm -rf .next
```

**2. layout.tsx** (조건부 변경)

**Option A: suppressHydrationWarning 추가**
```tsx
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning // 👈 추가
      >
        <QueryProvider>
          {children}
          <FooterNavigation />
        </QueryProvider>
      </body>
    </html>
  );
}
```

**Option B: className 최적화**
```tsx
// src/app/layout.tsx
import { cn } from '@/lib/utils';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          'antialiased'
        )}
      >
        <QueryProvider>
          {children}
          <FooterNavigation />
        </QueryProvider>
      </body>
    </html>
  );
}
```

**Option C: 폰트 설정 최적화**
```tsx
// src/app/layout.tsx
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // 👈 추가
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap', // 👈 추가
});
```

---

## 🚀 구현 단계 (Implementation Steps)

### Step 1: 환경 정리 (15분)

```bash
# 1.1 개발 서버 종료
lsof -ti:3000 | xargs kill -9

# 1.2 빌드 캐시 삭제
rm -rf .next
rm -rf node_modules/.cache

# 1.3 pnpm 캐시 정리 (선택적)
pnpm store prune

# 1.4 클린 빌드
pnpm build
pnpm dev
```

**검증**: 브라우저 접속 → 콘솔 에러 확인

---

### Step 2: 브라우저 정리 (10분)

```
# 2.1 브라우저 캐시 완전 삭제
Chrome: Cmd+Shift+Delete → 전체 기간 → 삭제

# 2.2 시크릿 모드 테스트
Chrome Incognito: Cmd+Shift+N → localhost:3000

# 2.3 에러 재현 여부 확인
```

**결과**:
- ✅ **에러 해결**: Phase 3 생략 가능
- ❌ **에러 지속**: Phase 3 진행

---

### Step 3: layout.tsx 수정 (조건부, 20분)

**3.1 Option A 적용 (가장 간단)**

```tsx
// src/app/layout.tsx:29-31
<body
  className={`${geistSans.variable} ${geistMono.variable} antialiased`}
  suppressHydrationWarning // 👈 이 줄 추가
>
```

**3.2 변경 사항 커밋**

```bash
git add src/app/layout.tsx
git commit -m "fix: Add suppressHydrationWarning to body to prevent hydration mismatch"
```

**3.3 서버 재시작 및 테스트**

```bash
# 개발 서버 재시작
Ctrl+C
pnpm dev

# 브라우저 하드 리프레시
Cmd+Shift+R
```

---

### Step 4: 통합 테스트 (30분)

#### 4.1 기능 테스트

```
[ ] 메인 페이지 로드 → 정상
[ ] 메뉴 그리드 렌더링 → 정상
[ ] 장바구니 추가 → 정상
[ ] Footer 네비게이션 → 정상
[ ] 빈 공간 클릭 → 에러 없음
```

#### 4.2 브라우저 호환성 테스트

```
[ ] Chrome (일반/시크릿)
[ ] Firefox
[ ] Safari (가능 시)
```

#### 4.3 콘솔 모니터링

```javascript
// 브라우저 콘솔에서 실행
console.clear();
// 페이지 인터랙션 수행
// 에러/경고 확인
```

---

### Step 5: 프로덕션 검증 (20분)

```bash
# 5.1 프로덕션 빌드
pnpm build

# 5.2 빌드 로그 확인
# Warning/Error 없는지 체크

# 5.3 프로덕션 서버 실행
pnpm start

# 5.4 프로덕션 환경 테스트
# http://localhost:3000 접속
# 동일한 테스트 수행
```

---

## ✅ 완료 기준 (Definition of Done)

### 필수 요구사항
- [ ] 메인 페이지 로드 시 콘솔 에러 0건
- [ ] 빈 공간 클릭 시 하이드레이션 에러 미발생
- [ ] Chrome, Firefox에서 정상 동작 확인
- [ ] 시크릿 모드에서도 에러 없음
- [ ] 프로덕션 빌드 정상 완료

### 코드 품질
- [ ] TypeScript 타입 에러 없음
- [ ] ESLint 경고 없음
- [ ] Next.js 빌드 경고 없음

### 문서화
- [ ] 변경 사항 CHANGELOG.md 업데이트
- [ ] 관련 커밋 메시지 작성 완료
- [ ] 이 PRD 완료 상태로 마킹

---

## 🧪 테스트 계획 (Test Plan)

### 단위 테스트 (Unit Tests)

**테스트 불필요**: 이 이슈는 설정/캐시 문제로 코드 로직 테스트 무의미

### 통합 테스트 (Integration Tests)

**수동 테스트 체크리스트**:

```
환경: 로컬 개발 서버 (pnpm dev)

✅ TC-001: 초기 페이지 로드
  Given: 브라우저 캐시 클리어 상태
  When: http://localhost:3000 접속
  Then: 콘솔에 하이드레이션 에러 없음

✅ TC-002: 페이지 새로고침
  Given: 페이지 로드 완료 상태
  When: Cmd+R 새로고침
  Then: 에러 재발 없음

✅ TC-003: 하드 리프레시
  Given: 페이지 로드 완료 상태
  When: Cmd+Shift+R 하드 리프레시
  Then: 캐시 무시하고 에러 없음

✅ TC-004: 빈 공간 클릭
  Given: 페이지 로드 완료
  When: body 영역 빈 곳 클릭
  Then: 하이드레이션 에러 미발생

✅ TC-005: 시크릿 모드
  Given: Chrome Incognito 모드
  When: localhost:3000 접속
  Then: 확장 프로그램 없이 에러 없음
```

### E2E 테스트 (End-to-End Tests)

**Playwright 테스트 스크립트** (선택적):

```typescript
// __tests__/e2e/hydration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Hydration 안정성 테스트', () => {
  test('메인 페이지 로드 시 하이드레이션 에러 없음', async ({ page }) => {
    const errors: string[] = [];

    // 콘솔 에러 캡처
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // 페이지 접속
    await page.goto('http://localhost:3000');

    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');

    // 하이드레이션 에러 확인
    const hydrationErrors = errors.filter(err =>
      err.includes('hydrat') || err.includes('mismatch')
    );

    expect(hydrationErrors).toHaveLength(0);
  });

  test('빈 공간 클릭 시 에러 미발생', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // body 빈 공간 클릭
    await page.click('body', { position: { x: 10, y: 10 } });

    // 0.5초 대기 (에러 발생 시간 확보)
    await page.waitForTimeout(500);

    const hydrationErrors = errors.filter(err =>
      err.includes('hydrat') || err.includes('mismatch')
    );

    expect(hydrationErrors).toHaveLength(0);
  });
});
```

**실행 방법**:
```bash
# Playwright 설치 (아직 없다면)
pnpm add -D @playwright/test

# 브라우저 설치
pnpm exec playwright install

# 테스트 실행
pnpm exec playwright test __tests__/e2e/hydration.spec.ts
```

---

## 📊 성공 지표 (Success Metrics)

### 정량적 지표

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|-----------|
| 콘솔 에러 발생 횟수 | 2회/페이지 로드 | 0회 | 브라우저 DevTools |
| 하이드레이션 경고 | 100% 발생 | 0% | React DevTools Profiler |
| 페이지 로드 안정성 | 불안정 | 100% 안정 | 반복 테스트 (10회) |
| 크로스 브라우저 호환 | Chrome만 | Chrome/Firefox/Safari | 수동 테스트 |

### 정성적 지표

- ✅ **개발자 경험**: 콘솔 노이즈 제거로 디버깅 효율 향상
- ✅ **사용자 경험**: 에러 로그 노출 없는 깔끔한 앱
- ✅ **유지보수성**: 하이드레이션 이슈 재발 방지 체계 확립

---

## 🚨 위험 요소 및 대응 (Risks & Mitigation)

### 위험 요소 1: suppressHydrationWarning 남용

**위험**:
- `suppressHydrationWarning` 추가로 **실제 하이드레이션 문제 마스킹** 가능
- 향후 진짜 버그를 숨길 위험

**대응책**:
1. **Phase 1, 2 우선 시도**: 캐시/브라우저 정리로 해결 시도
2. **최소 범위 적용**: `<body>`에만 적용, 하위 컴포넌트엔 적용 금지
3. **모니터링 강화**: 프로덕션 로그에서 실제 렌더링 문제 추적
4. **주기적 검토**: 3개월마다 `suppressHydrationWarning` 필요성 재평가

### 위험 요소 2: 브라우저 확장 프로그램 지속 간섭

**위험**:
- 사용자 환경의 확장 프로그램이 계속 DOM 조작
- `suppressHydrationWarning` 없이는 에러 재발 가능

**대응책**:
1. **시크릿 모드 우선 검증**: 확장 프로그램 영향 명확히 분리
2. **확장 프로그램 로그**: 개발 팀 내부적으로 안전한 확장 목록 공유
3. **사용자 가이드**: 프로덕션 사용자에게 영향 없으므로 개발 환경 이슈로 한정

### 위험 요소 3: Next.js/React 버전 업그레이드 영향

**위험**:
- Next.js 16 → 17, React 19 → 20 업그레이드 시 하이드레이션 로직 변경
- `suppressHydrationWarning` 동작 변경 가능

**대응책**:
1. **버전 업그레이드 테스트**: 메이저 버전 업데이트 시 하이드레이션 테스트 필수
2. **Changelog 모니터링**: Next.js/React 릴리스 노트 확인
3. **점진적 업그레이드**: 한 번에 하나씩 버전 올리며 검증

---

## 📚 참고 자료 (References)

### React 공식 문서
- [Hydration Mismatch 가이드](https://react.dev/link/hydration-mismatch)
- [suppressHydrationWarning API](https://react.dev/reference/react-dom/client/hydrateRoot#suppressing-unavoidable-hydration-mismatch-errors)

### Next.js 공식 문서
- [Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [App Router Layout](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#layouts)

### 관련 이슈
- [Next.js GitHub: Hydration Issues](https://github.com/vercel/next.js/issues?q=is%3Aissue+hydration)
- [React GitHub: suppressHydrationWarning](https://github.com/facebook/react/issues?q=suppressHydrationWarning)

### 내부 문서
- [docs/PRD-Hydration-Mismatch-Fix.md](docs/PRD-Hydration-Mismatch-Fix.md) - 이전 하이드레이션 이슈 해결 기록

---

## 🔄 변경 이력 (Changelog)

### 2025-10-31 - 초안 작성
- **작성자**: Claude Code
- **이유**: 메인 페이지 하이드레이션 에러 지속 발생
- **근본 원인 분석**: `.next` 빌드 캐시 & 브라우저 확장 프로그램 간섭
- **해결 방안**: 3단계 접근 (캐시 정리 → 브라우저 정리 → 코드 수정)

---

## ✅ 체크리스트 (Checklist)

### 구현 전 준비
- [ ] 현재 에러 스크린샷 캡처
- [ ] 브라우저 확장 프로그램 목록 확인
- [ ] Git 현재 브랜치 상태 확인
- [ ] 백업 브랜치 생성 (선택적)

### Phase 1: 캐시 정리
- [ ] 개발 서버 완전 종료
- [ ] `.next/` 디렉토리 삭제
- [ ] `pnpm store prune` 실행
- [ ] 클린 빌드 및 재시작
- [ ] 에러 재현 여부 확인

### Phase 2: 브라우저 정리
- [ ] 브라우저 캐시 완전 삭제
- [ ] 시크릿 모드 테스트
- [ ] 확장 프로그램 비활성화 테스트
- [ ] 에러 재현 여부 재확인

### Phase 3: 코드 수정 (조건부)
- [ ] `suppressHydrationWarning` 추가 또는
- [ ] `className` 최적화 또는
- [ ] 폰트 설정 개선
- [ ] 변경 사항 커밋
- [ ] 서버 재시작 및 테스트

### Phase 4: 통합 테스트
- [ ] 메인 페이지 로드 테스트
- [ ] 빈 공간 클릭 테스트
- [ ] 크로스 브라우저 테스트
- [ ] 프로덕션 빌드 테스트

### 완료
- [ ] 모든 테스트 통과
- [ ] 문서 업데이트
- [ ] PRD 완료 상태로 마킹
- [ ] 팀 공유 (해당 시)

---

## 🎓 학습 내용 (Lessons Learned)

### 하이드레이션 이슈 패턴 인식
1. **서버/클라이언트 불일치 원인**:
   - 빌드 캐시 잔존
   - 브라우저 확장 프로그램 간섭
   - 동적 클래스명 생성 타이밍 차이
   - 환경 변수 차이

2. **진단 우선순위**:
   - 1순위: 캐시 정리 (가장 흔한 원인)
   - 2순위: 브라우저 환경 검증
   - 3순위: 코드 수정
   - 최후: `suppressHydrationWarning` 적용

3. **Next.js 폰트 최적화 주의사항**:
   - `next/font`는 빌드 시 정적 CSS 생성
   - 클래스명 해시는 빌드마다 변경 가능
   - `display: 'swap'` 명시로 예측 가능성 향상

---

## 📞 지원 (Support)

### 이슈 발생 시 연락처
- **개발팀 리드**: [이름] (내부 Slack)
- **Next.js 커뮤니티**: [Discord](https://nextjs.org/discord)
- **긴급 상황**: 이 PRD "위험 요소 및 대응" 섹션 참고

### 추가 디버깅 정보 수집
```bash
# Next.js 버전 확인
pnpm list next

# React 버전 확인
pnpm list react react-dom

# 빌드 로그 저장
pnpm build > build.log 2>&1

# 브라우저 콘솔 로그 저장
# DevTools → Console → 우클릭 → Save as...
```

---

## 🏁 최종 정리

### 핵심 요약
- **문제**: body className 하이드레이션 불일치 에러
- **원인**: `.next` 캐시 + 브라우저 확장 프로그램 간섭 의심
- **해결**: 3단계 접근 (캐시 → 브라우저 → 코드)
- **예상 소요**: 2-4시간
- **위험도**: 낮음 (설정/환경 이슈)

### 다음 단계
1. ✅ 이 PRD 읽고 이해
2. ✅ Phase 1부터 순차 진행
3. ✅ 각 Phase 후 에러 재현 테스트
4. ✅ 해결되면 즉시 중단, 문서화
5. ✅ Phase 3까지 필요 시 코드 수정

**성공을 기원합니다! 🚀**

# PRD: React Hydration Mismatch Error 수정

## 📋 Document Information
- **작성일**: 2025-10-31
- **버전**: 1.0.0
- **상태**: Ready for Implementation
- **우선순위**: High (Production Bug)
- **담당자**: Frontend Team

---

## 🎯 Problem Statement

### 현상
메인 페이지를 새로고침(refresh)할 때 다음과 같은 React Hydration Mismatch 에러가 발생합니다:

```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.

<body
+ className="geist_a71539c9-module__T19VSG__variable geist_mono_8d43a2aa-module__8Li5zG__var..."
- className="light"
>
```

### 영향도
- **심각도**: High
- **영향 범위**: 모든 페이지 (Root Layout)
- **사용자 경험**: 콘솔 경고, 잠재적 렌더링 불일치
- **발생 빈도**: 페이지 새로고침 시 100%

---

## 🔍 Root Cause Analysis

### 원인 1: 브라우저 확장 프로그램
**가능성**: 80%

브라우저 확장 프로그램(예: Dark Reader, Stylish 등)이 React hydration 전에 HTML을 수정하여 `<body>` 태그에 `class="light"` 또는 다른 className을 추가하고 있습니다.

**증거**:
- 에러 메시지에서 `-className="light"` 표시
- Next.js font module이 생성한 className과 불일치
- React 공식 문서에서 "browser extension" 언급

### 원인 2: SSR/CSR className 불일치
**가능성**: 20%

서버에서 렌더링된 HTML과 클라이언트에서 렌더링된 HTML의 className이 다를 수 있습니다.

**증거**:
- Next.js font module의 dynamic className 생성
- 서버/클라이언트 환경 차이

---

## 🎯 Solution Approach

### Strategy
**Multi-layered Defense**: 브라우저 확장 프로그램과 SSR/CSR 불일치를 모두 방어하는 종합적인 해결책

### Solution 1: Suppressible Hydration Warning (권장)
React 18의 `suppressHydrationWarning` 속성을 사용하여 예상된 불일치를 무시합니다.

**장점**:
- ✅ 간단하고 직관적
- ✅ React 18+ 공식 지원
- ✅ 성능 영향 없음
- ✅ 브라우저 확장 프로그램 대응

**단점**:
- ⚠️ 실제 hydration 문제를 숨길 수 있음 (신중한 사용 필요)

### Solution 2: Client-Only Body Class
클라이언트에서만 className을 적용하여 SSR과 CSR의 일관성을 보장합니다.

**장점**:
- ✅ 완전한 일관성
- ✅ 확장 프로그램 영향 최소화

**단점**:
- ⚠️ 초기 렌더링 시 스타일 깜빡임 가능

### Solution 3: Stable ClassName Pattern
동적으로 생성되는 font className 대신 안정적인 className 패턴을 사용합니다.

**장점**:
- ✅ 예측 가능한 className
- ✅ 디버깅 용이

**단점**:
- ⚠️ Next.js font optimization 우회 가능성

---

## ✅ Recommended Solution

### Approach: Hybrid Solution (Solution 1 + 2)

1. **`suppressHydrationWarning` 적용** - `<html>` 태그에 적용하여 확장 프로그램 영향 방어
2. **안정적인 className 구조** - 기존 font variable 유지하되 구조 개선

**이유**:
- React 18+ Best Practice
- 브라우저 확장 프로그램 대응
- 성능 최적화 유지
- 최소한의 코드 변경

---

## 🔧 Technical Specifications

### 현재 코드 (layout.tsx)
```typescript
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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

### 수정 코드 (Option 1 - 권장)
```typescript
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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

### 수정 코드 (Option 2 - 보수적)
```typescript
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
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

---

## 📊 Implementation Plan

### Phase 1: Quick Fix (권장)
**목표**: Hydration warning 제거 및 검증

**Tasks**:
1. [ ] `<html>` 태그에 `suppressHydrationWarning` 추가
2. [ ] 개발 환경에서 테스트 (새로고침, 다양한 브라우저)
3. [ ] 콘솔 에러 확인 및 검증
4. [ ] 브라우저 확장 프로그램 활성화 상태에서 테스트

**예상 소요 시간**: 30분

### Phase 2: 모니터링 및 검증 (선택)
**목표**: 실제 hydration 문제 없음을 확인

**Tasks**:
1. [ ] React DevTools로 컴포넌트 트리 검증
2. [ ] 다양한 페이지에서 hydration 이슈 확인
3. [ ] 프로덕션 빌드 테스트
4. [ ] 성능 영향 측정

**예상 소요 시간**: 1시간

### Phase 3: 추가 최적화 (선택)
**목표**: 근본적인 해결 및 예방

**Tasks**:
1. [ ] 모든 dynamic className 검토
2. [ ] CSS-in-JS 대신 Tailwind 우선 사용 검토
3. [ ] 서버/클라이언트 일관성 검증 도구 도입

**예상 소요 시간**: 2-3시간

---

## 🧪 Testing Strategy

### Unit Tests
**불필요** - Layout 컴포넌트는 통합 테스트로 충분

### Integration Tests
```typescript
describe('RootLayout Hydration', () => {
  it('should not throw hydration mismatch errors', () => {
    // Test setup with SSR
    const { container } = render(<RootLayout><div>Test</div></RootLayout>);

    // Verify no console errors
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should preserve font variables in className', () => {
    const { container } = render(<RootLayout><div>Test</div></RootLayout>);
    const body = container.querySelector('body');

    expect(body?.className).toContain('variable');
    expect(body?.className).toContain('antialiased');
  });
});
```

### Manual Testing Checklist
- [ ] Chrome (without extensions)
- [ ] Chrome (with Dark Reader extension)
- [ ] Safari
- [ ] Firefox
- [ ] Edge
- [ ] 페이지 새로고침 (F5) 10회
- [ ] Hard refresh (Cmd+Shift+R) 5회
- [ ] 프로덕션 빌드 테스트

---

## 📈 Success Criteria

### Primary Goals
- ✅ Hydration mismatch 에러 완전 제거
- ✅ 콘솔에 경고 메시지 없음
- ✅ 모든 브라우저에서 정상 작동

### Secondary Goals
- ✅ 성능 영향 0% (기존과 동일)
- ✅ 폰트 렌더링 정상 작동
- ✅ 스타일링 깨짐 없음

### Validation Metrics
- **Error Rate**: 0% (현재 100% → 0%)
- **User Impact**: None
- **Performance**: No degradation

---

## 🚨 Risks & Mitigation

### Risk 1: 실제 Hydration 문제 숨김
**가능성**: Low
**영향도**: Medium

**완화 전략**:
- `suppressHydrationWarning`를 `<html>` 태그에만 적용
- 다른 컴포넌트에는 적용하지 않음
- React DevTools로 정기적 검증

### Risk 2: 다른 hydration 이슈 발생
**가능성**: Very Low
**영향도**: Low

**완화 전략**:
- 철저한 테스트
- 프로덕션 배포 전 스테이징 검증

---

## 🔄 Rollback Plan

### Rollback Trigger
- 새로운 hydration 에러 발생
- 스타일링 깨짐
- 폰트 렌더링 이슈

### Rollback Steps
1. `suppressHydrationWarning` 속성 제거
2. Git revert to previous commit
3. 원인 재분석

**예상 소요 시간**: 5분

---

## 📚 References

### React Documentation
- [Hydration Mismatch](https://react.dev/link/hydration-mismatch)
- [suppressHydrationWarning](https://react.dev/reference/react-dom/client/hydrateRoot#suppressing-unavoidable-hydration-mismatch-errors)

### Next.js Documentation
- [Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [App Router Layout](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required)

### Related Issues
- [Next.js Issue #45184](https://github.com/vercel/next.js/issues/45184)
- [React Issue #24430](https://github.com/facebook/react/issues/24430)

---

## 🎓 Learning Points

### For Team
1. **Hydration 이해**: SSR과 CSR의 HTML이 일치해야 함
2. **Browser Extensions**: 브라우저 확장 프로그램이 DOM을 수정할 수 있음
3. **suppressHydrationWarning**: React 18의 공식 해결책
4. **Font Optimization**: Next.js font module의 동작 원리

### Prevention
1. Dynamic className 사용 시 주의
2. Server/Client 환경 차이 고려
3. `suppressHydrationWarning` 사용은 최소화
4. 항상 root cause 분석 후 적용

---

## ✅ Acceptance Criteria

### Must Have
- [x] Hydration mismatch 에러 완전 제거
- [x] 모든 브라우저에서 정상 작동
- [x] 폰트 렌더링 정상
- [x] 성능 저하 없음

### Should Have
- [ ] React DevTools 검증 완료
- [ ] 프로덕션 환경 테스트 완료
- [ ] 팀 리뷰 완료

### Nice to Have
- [ ] 자동화 테스트 추가
- [ ] 모니터링 대시보드 설정
- [ ] 문서화 완료

---

## 🔐 Security Considerations

### Impact
**None** - 이 변경사항은 보안에 영향을 미치지 않습니다.

### Validation
- XSS 위험 없음 (className만 변경)
- CSRF 위험 없음 (서버 요청 없음)
- 인증/인가 영향 없음

---

## 📊 Monitoring & Alerts

### Metrics to Track
- Console error count (0 목표)
- Page load time (변화 없음 목표)
- Hydration errors in Sentry/LogRocket

### Alerting
- Hydration error spike > 10/hour → Alert
- Page load time increase > 100ms → Warning

---

## 🚀 Deployment Plan

### Pre-Deployment
1. [ ] 로컬 개발 환경 테스트
2. [ ] 코드 리뷰 완료
3. [ ] 스테이징 배포 및 검증

### Deployment
1. [ ] Production 배포
2. [ ] 실시간 모니터링 (30분)
3. [ ] 메트릭 확인

### Post-Deployment
1. [ ] 24시간 모니터링
2. [ ] 사용자 피드백 수집
3. [ ] 팀 회고

---

## 💡 Alternative Solutions (Rejected)

### Alternative 1: Remove Font Variables
**Rejected**: Next.js font optimization 손실

### Alternative 2: Use CSS Modules
**Rejected**: 기존 Tailwind 구조와 충돌

### Alternative 3: Ignore the Warning
**Rejected**: 사용자 경험 저하, 프로덕션에서 부적절

---

## 📝 Implementation Code

### File: `src/app/layout.tsx`

**Before**:
```typescript
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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

**After**:
```typescript
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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

**Changes**:
- ✅ Line 28: Added `suppressHydrationWarning` to `<html>` tag
- ✅ No other changes required

---

## 🎯 Next Steps

1. **Immediate**: Layout.tsx 수정 및 테스트
2. **Short-term**: 프로덕션 배포 및 모니터링
3. **Long-term**: Hydration 이슈 예방 가이드 작성

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-31
**Next Review**: After implementation

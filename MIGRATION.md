# npm → pnpm 마이그레이션 완료

## 마이그레이션 일자
2025년 10월 27일

## 변경 사항

### 1. 패키지 관리자 변경
- **이전**: npm
- **이후**: pnpm 9

### 2. 생성된 파일

#### `.npmrc`
pnpm 프로젝트 설정 파일
```
- shamefully-hoist=true: 호이스팅 활성화 (Next.js 호환성)
- strict-peer-dependencies=false: peer 의존성 유연성
- auto-install-peers=true: peer 의존성 자동 설치
```

#### `.nvmrc`
Node.js 버전 고정 (v22.16.0)

#### `pnpm-workspace.yaml`
pnpm 워크스페이스 설정 (모노레포 준비)

#### `pnpm-lock.yaml`
pnpm 잠금 파일 (npm의 package-lock.json 대체)

### 3. 제거된 파일
- `node_modules/` - 재생성됨
- `package-lock.json` - pnpm-lock.yaml로 대체

### 4. 업데이트된 문서
- `README.md` - pnpm 명령어로 업데이트
- `CLAUDE.md` - pnpm 개발 명령어 및 설명 추가

## pnpm의 장점

### 성능 개선
- **빠른 설치 속도**: 콘텐츠 주소 지정 저장소를 사용하여 중복 제거
- **디스크 공간 절약**: 여러 프로젝트에서 패키지를 공유
- **효율적인 심볼릭 링크**: 하드 링크로 디스크 사용량 최소화

### 보안 강화
- **엄격한 의존성 관리**: 팬텀 의존성 방지
- **명시적 의존성**: package.json에 명시된 패키지만 접근 가능

### 개발 경험 개선
- **더 나은 모노레포 지원**: 워크스페이스 기능 강화
- **더 빠른 CI/CD**: 캐싱 전략 최적화

## 주요 명령어 변경

| npm | pnpm |
|-----|------|
| `npm install` | `pnpm install` |
| `npm install <pkg>` | `pnpm add <pkg>` |
| `npm install -D <pkg>` | `pnpm add -D <pkg>` |
| `npm uninstall <pkg>` | `pnpm remove <pkg>` |
| `npm run <script>` | `pnpm <script>` |
| `npm update` | `pnpm update` |

## 검증 결과

### 빌드 테스트
```bash
pnpm build
```
✅ **성공** - Next.js 프로덕션 빌드 완료 (1495.4ms)

### 린트 테스트
```bash
pnpm lint
```
✅ **성공** - ESLint 검사 통과

### 생성된 파일
- ✅ `.npmrc` - pnpm 설정
- ✅ `.nvmrc` - Node.js 버전
- ✅ `pnpm-workspace.yaml` - 워크스페이스 설정
- ✅ `pnpm-lock.yaml` - 의존성 잠금 파일

## 팀원 가이드

### 최초 설정 (한 번만 실행)
```bash
# pnpm 전역 설치
npm install -g pnpm

# 프로젝트 의존성 설치
pnpm install
```

### 일상적인 개발
```bash
# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 린트
pnpm lint

# 의존성 추가
pnpm add <package-name>

# 개발 의존성 추가
pnpm add -D <package-name>
```

## 문제 해결

### pnpm이 설치되지 않은 경우
```bash
npm install -g pnpm
```

### 의존성 문제가 발생한 경우
```bash
# node_modules 제거 후 재설치
rm -rf node_modules
pnpm install
```

### 캐시 문제가 발생한 경우
```bash
pnpm store prune
pnpm install
```

## 추가 정보

### pnpm 공식 문서
- [pnpm 공식 사이트](https://pnpm.io/)
- [pnpm vs npm](https://pnpm.io/feature-comparison)
- [pnpm CLI](https://pnpm.io/cli/add)

### 워크스페이스 지원
현재 프로젝트는 `pnpm-workspace.yaml` 파일이 설정되어 있어, 향후 모노레포 구조로 확장 가능합니다.

## 마이그레이션 체크리스트

- [x] pnpm 설치 확인
- [x] .npmrc 설정 파일 생성
- [x] .nvmrc 파일 생성
- [x] pnpm-workspace.yaml 생성
- [x] package-lock.json 제거
- [x] pnpm install 실행
- [x] pnpm-lock.yaml 생성 확인
- [x] 빌드 테스트 (pnpm build)
- [x] 린트 테스트 (pnpm lint)
- [x] README.md 업데이트
- [x] CLAUDE.md 업데이트
- [x] 마이그레이션 문서 작성

## 결론

npm에서 pnpm으로의 마이그레이션이 성공적으로 완료되었습니다. 모든 기능이 정상적으로 작동하며, 향후 더 빠른 설치 속도와 효율적인 디스크 사용을 경험할 수 있습니다.

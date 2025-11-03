#!/usr/bin/env node

/**
 * OAuth 설정 검증 스크립트
 *
 * 이 스크립트는 Google OAuth 로그인이 올바르게 설정되어 있는지 검증합니다.
 *
 * 실행 방법:
 * node scripts/validate-oauth-setup.js
 * 또는
 * node -r dotenv/config scripts/validate-oauth-setup.js dotenv_config_path=.env.local
 */

// Node.js의 기본 환경 변수를 사용합니다
// .env.local은 Next.js가 자동으로 로드하므로, 개발 서버 실행 시 자동으로 적용됩니다

const results = [];

/**
 * 환경 변수 검증
 */
function validateEnvironmentVariables() {
  console.log('🔍 환경 변수 검증 중...\n');

  // Supabase URL 검증
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    results.push({
      passed: false,
      message: 'NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.',
      severity: 'error',
    });
  } else if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('supabase.co')) {
    results.push({
      passed: false,
      message: `NEXT_PUBLIC_SUPABASE_URL이 올바르지 않습니다: ${supabaseUrl}`,
      severity: 'error',
    });
  } else {
    results.push({
      passed: true,
      message: `✓ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`,
      severity: 'info',
    });
  }

  // Supabase Anon Key 검증
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseAnonKey) {
    results.push({
      passed: false,
      message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.',
      severity: 'error',
    });
  } else if (supabaseAnonKey.length < 100) {
    results.push({
      passed: false,
      message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY가 올바르지 않습니다 (너무 짧음).',
      severity: 'error',
    });
  } else {
    results.push({
      passed: true,
      message: `✓ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 20)}...`,
      severity: 'info',
    });
  }

  // Site URL 검증
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    results.push({
      passed: false,
      message: 'NEXT_PUBLIC_SITE_URL이 설정되지 않았습니다. OAuth 리다이렉트가 실패할 수 있습니다.',
      severity: 'error',
    });
  } else if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
    results.push({
      passed: false,
      message: `NEXT_PUBLIC_SITE_URL이 올바른 형식이 아닙니다: ${siteUrl}`,
      severity: 'error',
    });
  } else {
    results.push({
      passed: true,
      message: `✓ NEXT_PUBLIC_SITE_URL: ${siteUrl}`,
      severity: 'info',
    });

    // 프로덕션 URL이 https인지 확인
    if (!siteUrl.startsWith('https://') && !siteUrl.includes('localhost')) {
      results.push({
        passed: false,
        message: '프로덕션 URL은 https를 사용해야 합니다.',
        severity: 'warning',
      });
    }
  }

  // Google OAuth 환경 변수 검증 (선택사항)
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (googleClientId && googleClientSecret) {
    results.push({
      passed: true,
      message: '✓ Google OAuth 클라이언트 설정 감지됨',
      severity: 'info',
    });
  } else {
    results.push({
      passed: true,
      message: 'ℹ️  Google OAuth 환경 변수가 설정되지 않았습니다 (Supabase 대시보드에서 직접 설정 가능).',
      severity: 'info',
    });
  }
}

/**
 * Supabase 대시보드 설정 가이드
 */
function printSupabaseDashboardGuide() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';

  if (!supabaseUrl) {
    return;
  }

  // Supabase 프로젝트 ID 추출
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  console.log('\n📝 Supabase 대시보드 설정 가이드:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('1. Supabase 대시보드 접속:');
  console.log(`   🔗 https://supabase.com/dashboard/project/${projectId}\n`);

  console.log('2. Authentication → URL Configuration 이동\n');

  console.log('3. "Redirect URLs" 섹션에 다음 URL 추가:');
  console.log(`   ✓ ${siteUrl}/auth/callback`);
  if (!siteUrl.includes('localhost')) {
    console.log(`   ✓ http://localhost:3000/auth/callback  (로컬 개발용)`);
  }
  console.log();

  console.log('4. "Site URL" 설정:');
  console.log(`   ✓ ${siteUrl}\n`);

  console.log('5. Google Cloud Console 설정 확인:');
  console.log('   🔗 https://console.cloud.google.com/apis/credentials');
  console.log('   → OAuth 2.0 클라이언트 → 승인된 리디렉션 URI에 다음 추가:');
  console.log(`   ✓ ${supabaseUrl}/auth/v1/callback\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * 결과 출력
 */
function printResults() {
  console.log('\n📊 검증 결과:\n');

  let hasErrors = false;
  let hasWarnings = false;

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    const prefix = result.severity === 'error' ? '❌' : result.severity === 'warning' ? '⚠️ ' : 'ℹ️ ';

    console.log(`${prefix} ${result.message}`);

    if (result.severity === 'error' && !result.passed) {
      hasErrors = true;
    }
    if (result.severity === 'warning') {
      hasWarnings = true;
    }
  });

  console.log();

  if (hasErrors) {
    console.log('❌ 검증 실패: 위의 오류를 수정해야 합니다.\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  검증 완료: 경고 사항을 확인하세요.\n');
  } else {
    console.log('✅ 모든 검증 통과! OAuth 설정이 올바르게 되어 있습니다.\n');
  }
}

/**
 * 메인 실행 함수
 */
function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║         Google OAuth 설정 검증 스크립트                  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  validateEnvironmentVariables();
  printResults();
  printSupabaseDashboardGuide();

  console.log('💡 추가 도움말:');
  console.log('   - 문서: https://supabase.com/docs/guides/auth/social-login/auth-google');
  console.log('   - 문제 발생 시: pnpm dev 실행 후 브라우저 개발자 도구의 네트워크 탭 확인\n');
}

main();

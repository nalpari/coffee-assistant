'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserProfile } from '@/components/auth/UserProfile';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 대시보드 페이지
 * 인증된 사용자만 접근 가능한 보호된 페이지입니다.
 */
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">대시보드</h1>
              <p className="text-muted-foreground mt-2">
                Coffee Assistant에 오신 것을 환영합니다!
              </p>
            </div>
            <UserProfile />
          </div>

          {/* 사용자 정보 카드 */}
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">사용자 정보</h2>
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">이름:</span>
                <span className="font-medium">
                  {user?.user_metadata?.full_name || '설정되지 않음'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">이메일:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">사용자 ID:</span>
                <span className="font-mono text-sm">{user?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">로그인 제공자:</span>
                <span className="font-medium capitalize">
                  {user?.app_metadata?.provider || 'google'}
                </span>
              </div>
            </div>
          </div>

          {/* 추가 기능 안내 */}
          <div className="bg-muted/50 border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">다음 단계</h2>
            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
              <li>커피 메뉴 탐색하기</li>
              <li>AI 커피 추천 받기</li>
              <li>주문 내역 확인하기</li>
              <li>즐겨찾기 관리하기</li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * React Query Provider
 *
 * 애플리케이션의 루트에서 React Query를 설정합니다.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 기본 옵션 설정
            staleTime: 60 * 1000, // 1분 동안 데이터를 fresh로 유지
            gcTime: 5 * 60 * 1000, // 5분 동안 캐시 유지 (이전 cacheTime)
            refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
            retry: 1, // 실패 시 1번만 재시도
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

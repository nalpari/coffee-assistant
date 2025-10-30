'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  rootMargin?: string;
  threshold?: number;
}

/**
 * 무한 스크롤 커스텀 훅
 *
 * @description Intersection Observer API를 사용한 무한 스크롤 구현
 * @param options - 무한 스크롤 옵션
 * @param options.onLoadMore - 더 많은 데이터를 로드하는 콜백 함수
 * @param options.hasMore - 로드할 데이터가 더 있는지 여부
 * @param options.isLoading - 현재 로딩 중인지 여부
 * @param options.rootMargin - Intersection Observer의 rootMargin (기본: '100px')
 * @param options.threshold - Intersection Observer의 threshold (기본: 0.1)
 * @returns observerRef - 감지할 요소에 연결할 ref
 *
 * @example
 * ```tsx
 * const { observerRef } = useInfiniteScroll({
 *   onLoadMore: loadNextPage,
 *   hasMore: hasNextPage,
 *   isLoading: isLoadingMore,
 * });
 *
 * return (
 *   <>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={observerRef} />
 *   </>
 * );
 * ```
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  rootMargin = '100px',
  threshold = 0.1,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;

      // 요소가 뷰포트에 진입하고, 로딩 중이 아니고, 더 로드할 데이터가 있을 때
      if (target.isIntersecting && !isLoading && hasMore) {
        onLoadMore();
      }
    },
    [isLoading, hasMore, onLoadMore]
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    // Intersection Observer 생성
    const observer = new IntersectionObserver(handleObserver, {
      root: null, // 뷰포트를 루트로 사용
      rootMargin,
      threshold,
    });

    // 요소 관찰 시작
    observer.observe(element);

    // 클린업: 컴포넌트 언마운트 시 관찰 중단
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver, rootMargin, threshold]);

  return { observerRef };
}

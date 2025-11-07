'use client';

import { useState } from 'react';
import { useOrdersQuery } from '@/hooks/use-orders-query';
import { LoadingSpinner } from '@/components/menu/LoadingSpinner';
import { OrderCard } from './OrderCard';
import type { OrderStatus } from '@/types/order';
import { ORDER_STATUS_LABELS } from '@/types/order';

export function OrderList() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, isFetching } = useOrdersQuery({
    filters: { status: selectedStatus },
    page,
    pageSize: 10,
    refetchInterval: 5000, // 5초마다 자동 갱신
  });

  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 py-8 text-center">
        주문 목록을 불러오는 중 오류가 발생했습니다: {error.message}
      </div>
    );
  }

  const statusOptions: (OrderStatus | undefined)[] = [
    undefined,
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'completed',
    'cancelled',
  ];

  return (
    <div className="space-y-6">
      {/* 상태 필터 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700">상태 필터:</span>
        {statusOptions.map((status) => (
          <button
            key={status || 'all'}
            onClick={() => {
              setSelectedStatus(status);
              setPage(1); // 필터 변경 시 첫 페이지로
            }}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status ? ORDER_STATUS_LABELS[status] : '전체'}
          </button>
        ))}
      </div>

      {/* 실시간 페칭 인디케이터 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          총 {data?.total || 0}건의 주문
        </p>
        {isFetching && !isLoading && (
          <div className="text-sm text-blue-600 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            실시간 갱신 중...
          </div>
        )}
      </div>

      {/* 주문 목록 */}
      <div className="space-y-4">
        {data?.orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {/* 빈 목록 메시지 */}
      {data?.orders.length === 0 && (
        <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
          <p className="text-lg">주문 내역이 없습니다.</p>
          {selectedStatus && (
            <p className="text-sm mt-2">
              &apos;{ORDER_STATUS_LABELS[selectedStatus]}&apos; 상태의 주문이 없습니다.
            </p>
          )}
        </div>
      )}

      {/* 페이지네이션 */}
      {data && data.total > data.pageSize && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
          >
            이전
          </button>

          <span className="px-4 py-2 text-sm text-gray-600">
            {page} / {Math.ceil(data.total / data.pageSize)}
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(data.total / data.pageSize)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

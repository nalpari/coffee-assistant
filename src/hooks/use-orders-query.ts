import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Order,
  OrdersResponse,
  OrderFilters,
  UpdateOrderStatusRequest,
  CreateOrderRequest,
} from '@/types/order';

interface UseOrdersQueryOptions {
  filters?: OrderFilters;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
  refetchInterval?: number; // 밀리초 (기본값: 5000ms = 5초)
}

/**
 * 주문 목록 조회 (주기적 페칭 포함)
 *
 * @example
 * const { data, isLoading, isFetching } = useOrdersQuery({
 *   refetchInterval: 5000, // 5초마다 자동 갱신
 * });
 */
export function useOrdersQuery(options: UseOrdersQueryOptions = {}) {
  const {
    filters,
    page = 1,
    pageSize = 10,
    enabled = true,
    refetchInterval = 5000, // 기본값: 5초마다 자동 refetch
  } = options;

  return useQuery<OrdersResponse>({
    queryKey: ['orders', filters, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (filters?.status) params.append('status', filters.status);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
      if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString());

      const response = await fetch(`/api/orders?${params}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch orders');
      }
      return response.json();
    },
    enabled,
    refetchInterval, // 주기적 페칭 (5초마다)
    refetchIntervalInBackground: true, // 백그라운드에서도 계속 페칭
    refetchOnWindowFocus: true, // 윈도우 포커스 시 refetch
    staleTime: 3000, // 3초 후 stale 처리
  });
}

/**
 * 특정 주문 상세 조회 (주기적 페칭 포함)
 *
 * @example
 * const { data: order } = useOrderQuery('123', true);
 */
export function useOrderQuery(orderId: string, enabled: boolean = true) {
  return useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch order');
      }
      return response.json();
    },
    enabled: enabled && !!orderId,
    refetchInterval: 5000, // 5초마다 자동 갱신
    refetchIntervalInBackground: true,
  });
}

/**
 * 주문 생성 Mutation
 *
 * @example
 * const createOrder = useCreateOrder();
 * createOrder.mutate({
 *   items: [...],
 *   totalAmount: 10000,
 *   finalAmount: 10000,
 * });
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderRequest) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      return response.json();
    },
    onSuccess: () => {
      // 주문 목록 캐시 무효화 (자동 refetch)
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

/**
 * 주문 상태 업데이트 Mutation (낙관적 업데이트)
 *
 * @example
 * const updateStatus = useUpdateOrderStatus();
 * updateStatus.mutate({
 *   orderId: '123',
 *   status: 'confirmed',
 * });
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: UpdateOrderStatusRequest['status'];
    }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update order status');
      }

      return response.json();
    },
    // 낙관적 업데이트: UI 즉시 반영
    onMutate: async ({ orderId, status }) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      await queryClient.cancelQueries({ queryKey: ['order', orderId] });

      // 이전 데이터 백업
      const previousOrders = queryClient.getQueryData(['orders']);
      const previousOrder = queryClient.getQueryData(['order', orderId]);

      // 낙관적 업데이트: 캐시 즉시 갱신
      queryClient.setQueryData(['order', orderId], (old: Order | undefined) => {
        if (!old) return old;
        return { ...old, status, updatedAt: new Date().toISOString() };
      });

      return { previousOrders, previousOrder };
    },
    // 에러 시 롤백
    onError: (err, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders'], context.previousOrders);
      }
      if (context?.previousOrder) {
        queryClient.setQueryData(['order', variables.orderId], context.previousOrder);
      }
    },
    // 성공 시 캐시 무효화 (서버 데이터로 동기화)
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

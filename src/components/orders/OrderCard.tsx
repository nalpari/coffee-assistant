'use client';

import { useState } from 'react';
import { useUpdateOrderStatus } from '@/hooks/use-orders-query';
import type { Order, OrderStatus } from '@/types/order';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/order';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateStatus.mutate({
      orderId: order.id.toString(),
      status: newStatus,
    });
  };

  // 다음 상태로 이동할 수 있는 버튼 표시
  const getNextStatusButton = () => {
    const { status } = order;

    if (status === 'pending') {
      return (
        <button
          onClick={() => handleStatusChange('confirmed')}
          disabled={updateStatus.isPending}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          주문 확인
        </button>
      );
    }

    if (status === 'confirmed') {
      return (
        <button
          onClick={() => handleStatusChange('preparing')}
          disabled={updateStatus.isPending}
          className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50"
        >
          준비 시작
        </button>
      );
    }

    if (status === 'preparing') {
      return (
        <button
          onClick={() => handleStatusChange('ready')}
          disabled={updateStatus.isPending}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
        >
          준비 완료
        </button>
      );
    }

    if (status === 'ready') {
      return (
        <button
          onClick={() => handleStatusChange('completed')}
          disabled={updateStatus.isPending}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50"
        >
          픽업 완료
        </button>
      );
    }

    return null;
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{order.orderNumber}</h3>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          {order.customerName && (
            <p className="text-sm text-gray-600 mt-1">고객: {order.customerName}</p>
          )}
        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            ORDER_STATUS_COLORS[order.status]
          }`}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            총 {order.items?.length || 0}개 아이템
          </p>
          <p className="text-lg font-bold">
            {order.finalAmount.toLocaleString()}원
          </p>
        </div>

        {isExpanded && order.items && order.items.length > 0 && (
          <div className="mt-4 space-y-2 border-t pt-4">
            <p className="text-sm font-semibold text-gray-700">주문 아이템:</p>
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span className="text-gray-600">
                  {(item.price * item.quantity).toLocaleString()}원
                </span>
              </div>
            ))}
          </div>
        )}

        {order.orderNotes && isExpanded && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
            <p className="text-gray-500 text-xs mb-1">주문 메모:</p>
            <p className="text-gray-700">{order.orderNotes}</p>
          </div>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 mt-2 hover:underline"
        >
          {isExpanded ? '접기' : '상세보기'}
        </button>
      </div>

      {/* 상태 변경 버튼 */}
      {order.status !== 'completed' && order.status !== 'cancelled' && (
        <div className="mt-4 flex gap-2 border-t pt-4">
          {getNextStatusButton()}

          {order.status === 'pending' && (
            <button
              onClick={() => handleStatusChange('cancelled')}
              disabled={updateStatus.isPending}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
            >
              주문 취소
            </button>
          )}

          {updateStatus.isPending && (
            <span className="text-sm text-gray-500 self-center">
              처리 중...
            </span>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { OrderList } from '@/components/orders/OrderList';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function OrdersManagePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header
          cartItemCount={0}
          onCartClick={() => {}}
        />

        <main className="container mx-auto py-8 px-4">
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <Link
              href="/orders"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              주문 내역으로 돌아가기
            </Link>

            <h1 className="text-3xl font-bold mb-2">실시간 주문 관리</h1>
            <p className="text-gray-600">
              실시간으로 주문 현황을 확인하고 관리할 수 있습니다.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="inline-flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                5초마다 자동 갱신
              </div>
            </div>
          </div>

          {/* 주문 목록 (실시간 업데이트) */}
          <OrderList />
        </main>
      </div>
    </ProtectedRoute>
  );
}

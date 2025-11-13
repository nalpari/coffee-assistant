'use client';

/**
 * DuplicateOrderDialog
 * 중복 주문 확인 Dialog 컴포넌트
 *
 * 사용자가 최근 주문한 메뉴를 다시 주문하려고 할 때
 * 2가지 선택지를 제공하는 UI
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Store, Package } from 'lucide-react';
import type { DuplicateOrderInfo } from '@/types/shopping-agent';

interface DuplicateOrderDialogProps {
  open: boolean;
  duplicateInfo: DuplicateOrderInfo | null;
  onSelectReorder: (orderId: number) => void;
  onSelectNearbyStore: (storeId: number) => void;
  onCancel: () => void;
}

export function DuplicateOrderDialog({
  open,
  duplicateInfo,
  onSelectReorder,
  onSelectNearbyStore,
  onCancel,
}: DuplicateOrderDialogProps) {
  if (!duplicateInfo || !duplicateInfo.isDuplicate) {
    return null;
  }

  const { recentOrder, nearbyStores, menuName } = duplicateInfo;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">같은 메뉴의 최근 주문이 있습니다</DialogTitle>
          <p className="text-muted-foreground">
            <strong>{menuName}</strong> 메뉴를 어떻게 주문하시겠습니까?
          </p>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2 mt-4">
          {/* 옵션 1: 재주문 */}
          {recentOrder && (
            <Card
              className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200"
              onClick={() => onSelectReorder(recentOrder.orderId)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  기존 주문에서 재주문
                </CardTitle>
                <CardDescription>이전에 주문했던 매장에서 다시 주문합니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Store className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{recentOrder.storeName}</p>
                    <Badge variant="secondary" className="mt-1">
                      주문번호: {recentOrder.orderNumber}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">주문 날짜</p>
                    <p className="text-sm font-medium">
                      {new Date(recentOrder.orderDate).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground mb-2">주문 내역</p>
                  <div className="space-y-1">
                    {recentOrder.menuItems.slice(0, 3).map((item, index) => (
                      <p key={index} className="text-sm">
                        {item.name} x {item.quantity}
                      </p>
                    ))}
                    {recentOrder.menuItems.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        외 {recentOrder.menuItems.length - 3}개 메뉴
                      </p>
                    )}
                  </div>
                  <p className="text-lg font-bold mt-3">
                    총 {recentOrder.totalAmount.toLocaleString()}원
                  </p>
                </div>

                <Button className="w-full mt-4" size="lg">
                  이 매장에서 재주문
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 옵션 2: 가까운 매장 */}
          <Card
            className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200"
            onClick={() => {
              if (nearbyStores && nearbyStores.length > 0) {
                onSelectNearbyStore(nearbyStores[0].storeId);
              }
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                가까운 매장에서 주문
              </CardTitle>
              <CardDescription>해당 메뉴를 판매하는 가까운 매장을 선택합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {nearbyStores && nearbyStores.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {nearbyStores.length}개의 매장에서 판매 중
                  </p>
                  <div className="space-y-3">
                    {nearbyStores.slice(0, 3).map((store) => (
                      <div
                        key={store.storeId}
                        className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{store.storeName}</p>
                            {store.address && (
                              <p className="text-xs text-muted-foreground mt-1">{store.address}</p>
                            )}
                          </div>
                          <Badge variant="outline">{store.distance || '위치 정보 없음'}</Badge>
                        </div>
                        {store.estimatedTime && (
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {store.estimatedTime}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button className="w-full mt-4" size="lg" variant="outline">
                    가까운 매장 선택하기
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">판매 중인 매장을 찾을 수 없습니다</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="ghost" onClick={onCancel}>
            취소
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

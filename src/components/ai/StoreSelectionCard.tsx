'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StoreSelectionOption } from '@/types/shopping-agent';
import { MapPin, Clock, Check } from 'lucide-react';

interface StoreSelectionCardProps {
  menuName: string;
  storeSelection: StoreSelectionOption;
  onSelect: (storeId: number, menuId: number) => void;
}

export function StoreSelectionCard({
  menuName,
  storeSelection,
  onSelect,
}: StoreSelectionCardProps) {
  const [selectedOption, setSelectedOption] = useState<'option1' | 'option2' | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  const handleOption1Select = () => {
    if (storeSelection.option1) {
      setSelectedOption('option1');
      setSelectedStoreId(storeSelection.option1.storeId);
      onSelect(storeSelection.option1.storeId, storeSelection.option1.menuId);
    }
  };

  const handleOption2Select = (storeId: number, menuId: number) => {
    setSelectedOption('option2');
    setSelectedStoreId(storeId);
    onSelect(storeId, menuId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          {menuName} 주문을 위해 매장을 선택해주세요
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 옵션 1: 최근 주문과 같게 주문 */}
        {storeSelection.option1 && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base">
                {storeSelection.option2.stores.length === 0 ? '최근 주문과 같게 주문' : '옵션 1: 최근 주문과 같게 주문'}
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{storeSelection.option1.storeName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  주문번호: {storeSelection.option1.orderNumber}
                </span>
              </div>
              <div className="text-muted-foreground">
                주문일: {formatDate(storeSelection.option1.orderDate)}
              </div>
            </div>
            <Button
              onClick={handleOption1Select}
              className="w-full"
              variant={selectedOption === 'option1' ? 'default' : 'outline'}
            >
              {selectedOption === 'option1' ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  선택됨
                </>
              ) : (
                '이 매장에서 주문하기'
              )}
            </Button>
          </div>
        )}

        {/* 옵션 2: 가까운 매장에서 주문 */}
        {storeSelection.option2.stores.length > 0 && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base">
                {!storeSelection.option1 ? '가까운 매장에서 주문' : '옵션 2: 가까운 매장에서 주문'}
              </h3>
            </div>
            <div className="space-y-2">
              {storeSelection.option2.stores.map((store) => (
                <div
                  key={store.storeId}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{store.storeName}</span>
                    </div>
                    {store.address && (
                      <div className="text-sm text-muted-foreground ml-6">
                        {store.address}
                      </div>
                    )}
                    {store.distanceFormatted && (
                      <div className="text-sm text-muted-foreground ml-6">
                        거리: {store.distanceFormatted}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => handleOption2Select(store.storeId, store.menuId)}
                    variant={
                      selectedOption === 'option2' && selectedStoreId === store.storeId
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                  >
                    {selectedOption === 'option2' && selectedStoreId === store.storeId ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        선택됨
                      </>
                    ) : (
                      '선택'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 매장이 없는 경우 */}
        {storeSelection.option2.stores.length === 0 && !storeSelection.option1 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>해당 메뉴를 판매하는 매장을 찾을 수 없습니다.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


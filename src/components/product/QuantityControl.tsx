'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuantityControlProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function QuantityControl({
  value,
  min = 1,
  max = 99,
  onChange,
}: QuantityControlProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label="수량 감소"
        className="h-10 w-10"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <div className="flex items-center justify-center w-16">
        <span className="text-xl font-semibold" data-testid="quantity-value">
          {value}
        </span>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label="수량 증가"
        className="h-10 w-10"
        data-testid="quantity-increment"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

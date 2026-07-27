import React from 'react';
import { CreditCard } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/formatCurrency';

export interface RevenueMethodChartProps {
  byPaymentMethod?: { method: string; total: number }[];
}

export const RevenueMethodChart: React.FC<RevenueMethodChartProps> = ({
  byPaymentMethod = [],
}) => {
  const totalAmount = byPaymentMethod.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">Revenue by Payment Channel</h3>
        </div>
        <span className="text-xs font-mono font-semibold text-muted-foreground">
          Total: {formatCurrency(totalAmount)}
        </span>
      </div>

      {byPaymentMethod.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-4 text-center">
          No payment breakdown data available for the selected period.
        </p>
      ) : (
        <div className="space-y-4 pt-2">
          {byPaymentMethod.map((item) => {
            const percentage = totalAmount > 0 ? Math.round((item.total / totalAmount) * 100) : 0;

            return (
              <div key={item.method} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground uppercase">{item.method.replace('_', ' ')}</span>
                  <span className="font-mono text-muted-foreground">
                    {formatCurrency(item.total)} ({percentage}%)
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

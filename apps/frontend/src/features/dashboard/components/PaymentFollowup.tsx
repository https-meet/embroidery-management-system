import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, ArrowRight, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import type { PaymentFollowUpItemDto } from '../types/dashboard.types';

export interface PaymentFollowupProps {
  items: PaymentFollowUpItemDto[];
}

export const PaymentFollowup: React.FC<PaymentFollowupProps> = ({ items }) => {
  return (
    <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Awaiting Collections & Payment Follow-up
          </h2>
          <p className="text-xs text-muted-foreground">
            Outstanding customer balances sorted by due date
          </p>
        </div>
        <Link
          to={ROUTES.INVOICES.LIST}
          className="inline-flex items-center text-xs font-medium text-primary hover:underline"
        >
          <span>View all</span>
          <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="p-6 my-auto">
          <EmptyState
            title="No pending customer payments"
            description="All issued invoices are fully settled. Zero outstanding balance."
            icon={CreditCard}
          />
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="h-10 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5">Invoice ID</th>
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5 text-right">Balance Due</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-muted/40 transition-colors duration-150">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                    <Link
                      to={ROUTES.INVOICES.DETAIL(invoice.id)}
                      className="hover:text-primary hover:underline"
                    >
                      {invoice.invoiceNo}
                    </Link>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      Due: {formatDate(invoice.dueDate, 'No due date')}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground text-xs">
                    {invoice.customerName}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-foreground tabular-nums">
                    {formatCurrency(invoice.outstandingBalance)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={ROUTES.PAYMENTS.CREATE}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs flex items-center space-x-1"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>Collect</span>
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

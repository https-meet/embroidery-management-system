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
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Payment Follow-up & Collections
          </h2>
          <p className="text-xs text-muted-foreground">
            Outstanding customer balances sorted by payment due date
          </p>
        </div>
        <Link
          to={ROUTES.INVOICES.LIST}
          className="inline-flex items-center text-xs font-medium text-primary hover:underline"
        >
          <span>View all invoices</span>
          <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="p-4">
          <EmptyState
            title="No pending payments"
            description="All issued invoices are currently settled."
            icon={CreditCard}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-muted/40 font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Invoice Number</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 text-right">Balance Due</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-medium text-foreground">
                    <Link
                      to={ROUTES.INVOICES.DETAIL(invoice.id)}
                      className="hover:text-primary hover:underline"
                    >
                      {invoice.invoiceNo}
                    </Link>
                    <div className="text-[10px] text-muted-foreground">
                      Due: {formatDate(invoice.dueDate, 'No due date')}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-foreground">
                    {invoice.customerName}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(invoice.outstandingBalance)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link to={ROUTES.PAYMENTS.CREATE}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs flex items-center space-x-1 text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
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

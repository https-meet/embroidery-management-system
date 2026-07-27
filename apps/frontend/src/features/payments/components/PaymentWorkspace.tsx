import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, CreditCard } from 'lucide-react';
import { formatDate } from '@/shared/utils/formatDate';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import type { PaymentDto } from '../types/payment.types';

export interface PaymentWorkspaceProps {
  payment: PaymentDto;
}

export const PaymentWorkspace: React.FC<PaymentWorkspaceProps> = ({ payment }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col space-y-4 rounded-lg border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:space-y-0 print:hidden">
        <div className="flex items-center space-x-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CreditCard className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold font-mono tracking-tight text-foreground">
                {payment.paymentNo}
              </h2>
              <StatusBadge status={payment.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Received from: <strong className="font-semibold text-foreground">{payment.customer?.name || '—'}</strong> ({payment.customer?.customerCode})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            className="flex items-center space-x-1.5"
          >
            <Printer className="h-4 w-4" />
            <span>Print Receipt</span>
          </Button>
        </div>
      </div>

      {/* Printable Receipt Sheet */}
      <div className="rounded-lg border bg-card p-8 shadow-sm space-y-6">
        {/* Receipt Header */}
        <div className="flex items-start justify-between border-b pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">EMBROIDERY BUSINESS</h1>
            <p className="text-xs text-muted-foreground">Official Payment Voucher / Receipt</p>
            <p className="text-xs text-muted-foreground mt-1">Surat, Gujarat, India</p>
          </div>

          <div className="text-right space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              PAYMENT RECEIPT
            </span>
            <span className="text-lg font-bold font-mono text-foreground block">
              {payment.paymentNo}
            </span>
            <p className="text-xs text-muted-foreground">
              Date: {formatDate(payment.paymentDate)}
            </p>
          </div>
        </div>

        {/* Payment Summary Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 text-xs">
          <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
            <h3 className="font-semibold text-muted-foreground uppercase text-[10px] border-b pb-1">
              Payer Information
            </h3>
            {payment.customer ? (
              <div className="space-y-1">
                <p className="font-bold text-sm text-foreground">{payment.customer.name}</p>
                <p className="text-muted-foreground">Customer Code: {payment.customer.customerCode}</p>
                {payment.customer.mobile && <p className="text-muted-foreground">Mobile: {payment.customer.mobile}</p>}
                {payment.customer.email && <p className="text-muted-foreground">Email: {payment.customer.email}</p>}
              </div>
            ) : (
              <p className="text-muted-foreground">Unspecified Customer</p>
            )}
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
            <h3 className="font-semibold text-muted-foreground uppercase text-[10px] border-b pb-1">
              Payment Transaction Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-bold text-foreground uppercase">{payment.paymentMethod.replace('_', ' ')}</span>
              </div>
              {payment.referenceNo && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference / Txn ID:</span>
                  <span className="font-mono font-medium text-foreground">{payment.referenceNo}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-sm font-bold">
                <span className="text-muted-foreground">Total Amount Received:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Allocation Table */}
        {payment.allocations && payment.allocations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-tight text-foreground border-b pb-1">
              Invoice Allocation Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/40 text-muted-foreground font-medium">
                  <tr>
                    <th className="py-2 px-3">Invoice ID</th>
                    <th className="py-2 px-3 text-right">Allocated Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payment.allocations.map((alloc) => (
                    <tr key={alloc.id}>
                      <td className="py-2.5 px-3">
                        <Link
                          to={ROUTES.INVOICES.DETAIL(alloc.invoiceId)}
                          className="font-mono font-medium text-primary hover:underline"
                        >
                          Invoice #{alloc.invoiceId.substring(0, 8)}...
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                        {formatCurrency(alloc.allocatedAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Remarks & Notes */}
        {payment.notes && (
          <div className="border-t pt-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Remarks & Notes:</p>
            <p className="text-xs text-foreground whitespace-pre-line">{payment.notes}</p>
          </div>
        )}

        {/* Receipt Footer */}
        <div className="border-t pt-8 flex items-end justify-between text-xs text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">Thank you for your business!</p>
            <p className="text-[10px]">Computer Generated Payment Voucher</p>
          </div>
          <div className="text-right border-t border-dashed pt-4 w-40">
            <p className="text-[10px] uppercase font-semibold">Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

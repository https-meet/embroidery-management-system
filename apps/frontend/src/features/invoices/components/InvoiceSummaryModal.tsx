import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { CreateInvoiceFormValues } from '../schemas/invoice.schema';

export interface InvoiceSummaryModalProps {
  isOpen: boolean;
  values: CreateInvoiceFormValues | null;
  customerName?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const InvoiceSummaryModal: React.FC<InvoiceSummaryModalProps> = ({
  isOpen,
  values,
  customerName,
  isLoading,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !values) return null;

  const items = values.items || [];
  const subtotal = items.reduce((acc, i) => acc + (i.quantity || 0) * (i.rate || 0), 0);

  let discountAmount = 0;
  if (values.discountType === 'PERCENTAGE') {
    discountAmount = (subtotal * (values.discountValue || 0)) / 100;
  } else if (values.discountType === 'FIXED' || values.discountType === 'FIXED_AMOUNT') {
    discountAmount = values.discountValue || 0;
  }
  discountAmount = Math.min(discountAmount, subtotal);
  const grandTotal = subtotal - discountAmount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 border-b pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Confirm Invoice Generation</h3>
            <p className="text-xs text-muted-foreground">
              Please review the billing summary before finalizing this tax invoice.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Customer:</span>
            <span className="font-semibold text-foreground">{customerName || 'Selected Customer'}</span>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-foreground">Line Items ({items.length}):</span>
            <div className="max-h-36 overflow-y-auto space-y-1.5 border rounded p-2 bg-muted/20">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span className="truncate pr-2 font-medium">{item.description}</span>
                  <span className="font-mono whitespace-nowrap">
                    {item.quantity} x {formatCurrency(item.rate)} = {formatCurrency((item.quantity || 0) * (item.rate || 0))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-2 space-y-1.5">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-mono text-foreground font-medium">{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <span>Discount Applied:</span>
                <span className="font-mono">- {formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-foreground border-t pt-2">
              <span>Final Invoice Amount:</span>
              <span className="font-mono text-primary text-base">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 border-t pt-4">
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
            Modify Details
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Generate Invoice Now</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

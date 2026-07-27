import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Printer, Edit2, Archive, DollarSign } from 'lucide-react';
import { formatDate } from '@/shared/utils/formatDate';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import type { InvoiceDto } from '../types/invoice.types';

export interface InvoiceWorkspaceProps {
  invoice: InvoiceDto;
  onCancelClick: () => void;
}

export const InvoiceWorkspace: React.FC<InvoiceWorkspaceProps> = ({
  invoice,
  onCancelClick,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col space-y-4 rounded-lg border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:space-y-0 print:hidden">
        <div className="flex items-center space-x-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileText className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold font-mono tracking-tight text-foreground">
                {invoice.invoiceNo}
              </h2>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Billed to: <strong className="font-semibold text-foreground">{invoice.customer?.name || '—'}</strong> ({invoice.customer?.customerCode})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            className="flex items-center space-x-1.5"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Download PDF</span>
          </Button>

          {invoice.outstandingBalance > 0 && invoice.status !== 'CANCELLED' && (
            <Link to={ROUTES.PAYMENTS.CREATE}>
              <Button size="sm" className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                <DollarSign className="h-4 w-4" />
                <span>Record Payment</span>
              </Button>
            </Link>
          )}

          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <Link to={`${ROUTES.INVOICES.DETAIL(invoice.id)}/edit`}>
              <Button variant="outline" size="sm" className="flex items-center space-x-1.5">
                <Edit2 className="h-4 w-4" />
                <span>Edit Invoice</span>
              </Button>
            </Link>
          )}

          {invoice.status !== 'CANCELLED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancelClick}
              className="flex items-center space-x-1.5 text-destructive border-destructive/20 hover:bg-destructive/10"
            >
              <Archive className="h-4 w-4" />
              <span>Cancel Invoice</span>
            </Button>
          )}
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 print:hidden">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <span className="text-xs font-medium text-muted-foreground">Invoice Grand Total</span>
          <p className="mt-1 text-lg font-bold font-mono text-foreground">
            {formatCurrency(invoice.grandTotal)}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <span className="text-xs font-medium text-muted-foreground">Total Payments Received</span>
          <p className="mt-1 text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatCurrency(invoice.totalPaid)}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <span className="text-xs font-medium text-muted-foreground">Outstanding Balance Due</span>
          <p
            className={`mt-1 text-lg font-bold font-mono ${
              invoice.outstandingBalance > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-muted-foreground'
            }`}
          >
            {formatCurrency(invoice.outstandingBalance)}
          </p>
        </div>
      </div>

      {/* Main Printable Invoice Sheet */}
      <div className="rounded-lg border bg-card p-8 shadow-sm space-y-6">
        {/* Invoice Header */}
        <div className="flex items-start justify-between border-b pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">EMBROIDERY BUSINESS</h1>
            <p className="text-xs text-muted-foreground">Professional Computerized Embroidery Services</p>
            <p className="text-xs text-muted-foreground mt-1">Surat, Gujarat, India</p>
          </div>

          <div className="text-right space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              TAX INVOICE
            </span>
            <span className="text-lg font-bold font-mono text-foreground block">
              {invoice.invoiceNo}
            </span>
            <p className="text-xs text-muted-foreground">Issue Date: {formatDate(invoice.invoiceDate)}</p>
            <p className="text-xs text-muted-foreground">
              Due Date: {formatDate(invoice.dueDate || invoice.invoiceDate)}
            </p>
          </div>
        </div>

        {/* Customer Billing Details */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-muted-foreground uppercase text-[10px]">Billed To:</span>
            {invoice.customer ? (
              <div>
                <p className="font-bold text-sm text-foreground">{invoice.customer.name}</p>
                <p className="text-muted-foreground">Code: {invoice.customer.customerCode}</p>
                {invoice.customer.mobile && <p className="text-muted-foreground">Mobile: {invoice.customer.mobile}</p>}
                {invoice.customer.email && <p className="text-muted-foreground">Email: {invoice.customer.email}</p>}
                {invoice.customer.address && (
                  <p className="text-muted-foreground whitespace-pre-line mt-1">{invoice.customer.address}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Unspecified Customer</p>
            )}
          </div>

          <div className="space-y-1 sm:text-right">
            <span className="font-semibold text-muted-foreground uppercase text-[10px]">Invoice Summary:</span>
            <p className="text-muted-foreground">Status: <strong className="font-bold text-foreground">{invoice.status}</strong></p>
            <p className="text-muted-foreground">Balance Due: <strong className="font-bold text-foreground font-mono">{formatCurrency(invoice.outstandingBalance)}</strong></p>
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-muted/40 text-muted-foreground font-medium">
              <tr>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 px-3 font-semibold text-foreground">{item.description}</td>
                  <td className="py-3 px-3 text-right font-mono">{item.quantity}</td>
                  <td className="py-3 px-3 text-right font-mono">{formatCurrency(item.rate)}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Totals */}
        <div className="flex justify-end border-t pt-4">
          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-mono text-foreground">{formatCurrency(invoice.subtotal)}</span>
            </div>

            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400">
                  - {formatCurrency(invoice.discountAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between font-bold text-sm text-foreground border-t pt-2">
              <span>Grand Total:</span>
              <span className="font-mono">{formatCurrency(invoice.grandTotal)}</span>
            </div>

            <div className="flex justify-between text-muted-foreground border-t pt-2">
              <span>Total Paid:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(invoice.totalPaid)}
              </span>
            </div>

            <div className="flex justify-between font-bold text-xs text-foreground border-t pt-2">
              <span>Balance Due:</span>
              <span className="font-mono">{formatCurrency(invoice.outstandingBalance)}</span>
            </div>
          </div>
        </div>

        {/* Terms & Notes */}
        {invoice.notes && (
          <div className="border-t pt-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Payment Terms & Notes:</p>
            <p className="text-xs text-foreground whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

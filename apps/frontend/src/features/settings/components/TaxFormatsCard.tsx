import React, { useState, useEffect } from 'react';
import { Sliders, Eye } from 'lucide-react';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import type { BusinessConfig } from '../hooks/useBusinessSettings';

export interface TaxFormatsCardProps {
  config?: BusinessConfig;
  onSave: (dto: Partial<BusinessConfig>) => Promise<void>;
  isLoading?: boolean;
}

export const TaxFormatsCard: React.FC<TaxFormatsCardProps> = ({
  config,
  onSave,
  isLoading,
}) => {
  const [form, setForm] = useState<Partial<BusinessConfig>>({});

  useEffect(() => {
    if (config) {
      setForm(config);
    }
  }, [config]);

  const handleReset = () => {
    if (config) setForm(config);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  const jobPrefix = form.jobPrefix || 'JOB-';
  const invoicePrefix = form.invoicePrefix || 'INV-';
  const paymentPrefix = form.paymentPrefix || 'PAY-';
  const currentYear = new Date().getFullYear();

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16 relative">
      <div className="flex items-center space-x-3 border-b border-border pb-3">
        <Sliders className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-base font-bold text-foreground">Tax Rules & Document Numbering Formats</h3>
          <p className="text-xs text-muted-foreground">
            Configure default GST tax rate percentage and custom prefix sequences for Jobs, Invoices, and Payments.
          </p>
        </div>
      </div>

      {/* Live Document Sequence Preview Box */}
      <div className="rounded-md border border-border bg-muted/30 p-4 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-primary">
          <Eye className="h-4 w-4" />
          <span>Live Document Number Sequence Previews</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded border border-border bg-card p-2.5 shadow-xs">
            <p className="text-[11px] text-muted-foreground font-medium">Next Job Order Number</p>
            <p className="font-mono font-bold text-foreground mt-0.5">{jobPrefix}{currentYear}-000042</p>
          </div>
          <div className="rounded border border-border bg-card p-2.5 shadow-xs">
            <p className="text-[11px] text-muted-foreground font-medium">Next Invoice Number</p>
            <p className="font-mono font-bold text-foreground mt-0.5">{invoicePrefix}{currentYear}-000108</p>
          </div>
          <div className="rounded border border-border bg-card p-2.5 shadow-xs">
            <p className="text-[11px] text-muted-foreground font-medium">Next Payment Receipt Number</p>
            <p className="font-mono font-bold text-foreground mt-0.5">{paymentPrefix}{currentYear}-000085</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Default Tax Rate (%)">
          <Input
            type="number"
            step="0.1"
            value={form.defaultTaxRatePercentage ?? 18}
            onChange={(e) => setForm({ ...form, defaultTaxRatePercentage: Number(e.target.value) })}
            placeholder="18.0"
          />
        </FormField>

        <FormField label="Job Number Prefix">
          <Input
            value={form.jobPrefix || ''}
            onChange={(e) => setForm({ ...form, jobPrefix: e.target.value })}
            placeholder="e.g. JOB-"
          />
        </FormField>

        <FormField label="Invoice Number Prefix">
          <Input
            value={form.invoicePrefix || ''}
            onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })}
            placeholder="e.g. INV-"
          />
        </FormField>

        <FormField label="Payment Receipt Prefix">
          <Input
            value={form.paymentPrefix || ''}
            onChange={(e) => setForm({ ...form, paymentPrefix: e.target.value })}
            placeholder="e.g. PAY-"
          />
        </FormField>
      </div>

      {/* Sticky Bottom Action Bar (Task 2) */}
      <div className="sticky bottom-0 -mx-5 -mb-5 z-20 bg-card/95 backdrop-blur-xs border-t border-border p-4 rounded-b-lg flex justify-end items-center space-x-3 shadow-md">
        <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" size="sm" isLoading={isLoading}>
          Save Formats & Tax Rules
        </Button>
      </div>
    </form>
  );
};

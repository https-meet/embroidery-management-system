import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import type { BusinessConfig } from '../hooks/useBusinessSettings';

export interface BillingSettingsCardProps {
  config?: BusinessConfig;
  onSave: (dto: Partial<BusinessConfig>) => Promise<void>;
  isLoading?: boolean;
}

export const BillingSettingsCard: React.FC<BillingSettingsCardProps> = ({
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16 relative">
      <div className="flex items-center space-x-3 border-b border-border pb-3">
        <CreditCard className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-base font-bold text-foreground">Billing, Banking & Terms</h3>
          <p className="text-xs text-muted-foreground">
            Configure bank account information, UPI payment QR IDs, and invoice footer terms.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Bank & Branch Name">
          <Input
            value={form.bankName || ''}
            onChange={(e) => setForm({ ...form, bankName: e.target.value })}
            placeholder="e.g. HDFC Bank, Surat Branch"
          />
        </FormField>

        <FormField label="Bank Account Number">
          <Input
            value={form.accountNo || ''}
            onChange={(e) => setForm({ ...form, accountNo: e.target.value })}
            placeholder="e.g. 50200012345678"
          />
        </FormField>

        <FormField label="IFSC Code">
          <Input
            value={form.ifscCode || ''}
            onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
            placeholder="e.g. HDFC0000123"
          />
        </FormField>

        <FormField label="UPI VPA Address">
          <Input
            value={form.upiId || ''}
            onChange={(e) => setForm({ ...form, upiId: e.target.value })}
            placeholder="e.g. business@upi"
          />
        </FormField>

        <FormField label="Default Payment Terms (Days)">
          <Input
            type="number"
            value={form.defaultPaymentTermsDays || 15}
            onChange={(e) => setForm({ ...form, defaultPaymentTermsDays: Number(e.target.value) })}
            placeholder="15"
          />
        </FormField>

        <div className="sm:col-span-2">
          <FormField label="Default Invoice Footer / Payment Terms Note">
            <textarea
              rows={3}
              value={form.invoiceFooter || ''}
              onChange={(e) => setForm({ ...form, invoiceFooter: e.target.value })}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Notice printed at the bottom of customer invoices"
            />
          </FormField>
        </div>
      </div>

      {/* Sticky Bottom Action Bar (Task 2) */}
      <div className="sticky bottom-0 -mx-5 -mb-5 z-20 bg-card/95 backdrop-blur-xs border-t border-border p-4 rounded-b-lg flex justify-end items-center space-x-3 shadow-md">
        <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" size="sm" isLoading={isLoading}>
          Save Settings
        </Button>
      </div>
    </form>
  );
};

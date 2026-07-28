import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import type { BusinessConfig } from '../hooks/useBusinessSettings';

export interface CompanySettingsCardProps {
  config?: BusinessConfig;
  onSave: (dto: Partial<BusinessConfig>) => Promise<void>;
  isLoading?: boolean;
}

export const CompanySettingsCard: React.FC<CompanySettingsCardProps> = ({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-3 border-b pb-3">
        <Building2 className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-base font-bold text-foreground">Company & Brand Profile</h3>
          <p className="text-xs text-muted-foreground">
            Configure firm details, GSTIN, PAN, and contact info displayed on official invoices.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Firm / Business Name" required>
          <Input
            value={form.companyName || ''}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            placeholder="e.g. Royal Embroidery Works"
          />
        </FormField>

        <FormField label="GSTIN Number">
          <Input
            value={form.gstin || ''}
            onChange={(e) => setForm({ ...form, gstin: e.target.value })}
            placeholder="e.g. 24AAAAA0000A1Z5"
          />
        </FormField>

        <FormField label="PAN Number">
          <Input
            value={form.pan || ''}
            onChange={(e) => setForm({ ...form, pan: e.target.value })}
            placeholder="e.g. ABCDE1234F"
          />
        </FormField>

        <FormField label="Contact Mobile Number">
          <Input
            value={form.mobile || ''}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            placeholder="e.g. +91 98765 43210"
          />
        </FormField>

        <FormField label="Business Email Address">
          <Input
            type="email"
            value={form.email || ''}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="e.g. contact@embroidery.com"
          />
        </FormField>

        <FormField label="Business Website">
          <Input
            value={form.website || ''}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="e.g. https://royalembroidery.com"
          />
        </FormField>

        <div className="sm:col-span-2">
          <FormField label="Physical Workshop / Billing Address">
            <textarea
              rows={3}
              value={form.address || ''}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Full workshop location and state"
            />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end border-t pt-4">
        <Button type="submit" size="sm" isLoading={isLoading}>
          Save Company Details
        </Button>
      </div>
    </form>
  );
};

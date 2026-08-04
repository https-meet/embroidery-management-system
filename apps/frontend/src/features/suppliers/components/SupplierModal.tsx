import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { suppliersApi } from '../api/suppliersApi';
import type { CreateSupplierInput, Supplier } from '../types/suppliers.types';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplierToEdit?: Supplier | null;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  supplierToEdit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateSupplierInput>({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    gstNumber: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    notes: '',
  });

  useEffect(() => {
    if (supplierToEdit) {
      setFormData({
        name: supplierToEdit.name,
        contactPerson: supplierToEdit.contactPerson || '',
        phone: supplierToEdit.phone || '',
        email: supplierToEdit.email || '',
        gstNumber: supplierToEdit.gstNumber || '',
        address: supplierToEdit.address || '',
        city: supplierToEdit.city || '',
        state: supplierToEdit.state || '',
        country: supplierToEdit.country || 'India',
        postalCode: supplierToEdit.postalCode || '',
        notes: supplierToEdit.notes || '',
      });
    } else {
      setFormData({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        gstNumber: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        postalCode: '',
        notes: '',
      });
    }
  }, [supplierToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Supplier name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateSupplierInput = {
        name: formData.name.trim(),
        contactPerson: formData.contactPerson?.trim() || null,
        phone: formData.phone?.trim() || null,
        email: formData.email?.trim() || null,
        gstNumber: formData.gstNumber?.trim() || null,
        address: formData.address?.trim() || null,
        city: formData.city?.trim() || null,
        state: formData.state?.trim() || null,
        country: formData.country?.trim() || 'India',
        postalCode: formData.postalCode?.trim() || null,
        notes: formData.notes?.trim() || null,
      };

      if (supplierToEdit) {
        const updated = await suppliersApi.update(supplierToEdit.id, payload);
        toast.success(`Supplier '${updated.name}' updated successfully.`);
      } else {
        const created = await suppliersApi.create(payload);
        toast.success(`Supplier '${created.name}' registered successfully.`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const errMsg = err?.response?.data?.error?.message || 'Failed to save supplier.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-base font-bold text-foreground">
          {supplierToEdit ? 'Edit Supplier Directory Record' : 'Register New Material Supplier'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">
                Supplier Name / Company <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Madeira Thread Distributors India"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Contact Person</label>
              <input
                type="text"
                placeholder="e.g. Rajesh Shah"
                value={formData.contactPerson || ''}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Phone / Mobile</label>
              <input
                type="text"
                placeholder="e.g. +91 98250 12345"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Email Address</label>
              <input
                type="email"
                placeholder="e.g. sales@madeira-threads.com"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">GST Number (GSTIN)</label>
              <input
                type="text"
                placeholder="e.g. 24AAAAA0000A1Z5"
                value={formData.gstNumber || ''}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground uppercase font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">City</label>
              <input
                type="text"
                placeholder="e.g. Surat, Ludhiana, Mumbai"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">State</label>
              <input
                type="text"
                placeholder="e.g. Gujarat, Punjab, Maharashtra"
                value={formData.state || ''}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">Office / Warehouse Address</label>
              <input
                type="text"
                placeholder="e.g. Ring Road, Textile Market"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">Notes / Terms</label>
              <textarea
                rows={2}
                placeholder="Supplier payment terms, credit limits, or delivery notes..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {supplierToEdit ? 'Save Changes' : 'Register Supplier'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

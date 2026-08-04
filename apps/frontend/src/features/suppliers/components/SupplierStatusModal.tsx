import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { suppliersApi } from '../api/suppliersApi';
import type { Supplier } from '../types/suppliers.types';

interface SupplierStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplier: Supplier | null;
}

export const SupplierStatusModal: React.FC<SupplierStatusModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  supplier,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !supplier) return null;

  const handleToggle = async () => {
    try {
      setIsSubmitting(true);
      const newStatus = !supplier.isActive;
      const updated = await suppliersApi.updateStatus(supplier.id, newStatus);
      toast.success(`Supplier '${updated.name}' has been ${updated.isActive ? 'activated' : 'deactivated'}.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const errMsg = err?.response?.data?.error?.message || 'Failed to update supplier status.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {supplier.isActive ? 'Deactivate Supplier' : 'Activate Supplier'}
        </h3>
        <p className="text-xs text-muted-foreground">
          Are you sure you want to {supplier.isActive ? 'deactivate' : 'activate'}{' '}
          <strong className="text-foreground">{supplier.name}</strong>?
        </p>
        {supplier.isActive && (
          <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded border border-amber-200 dark:border-amber-900">
            Note: Deactivating this supplier prevents selecting them for new material purchases, but preserves historical purchase records. No data will be deleted.
          </p>
        )}
        <div className="flex justify-end space-x-3 pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={supplier.isActive ? 'destructive' : 'default'}
            size="sm"
            onClick={handleToggle}
            isLoading={isSubmitting}
          >
            {supplier.isActive ? 'Deactivate Supplier' : 'Activate Supplier'}
          </Button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { materialsApi } from '../api/materialsApi';
import type { Material } from '../types/materials.types';

interface MaterialStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  material: Material | null;
}

export const MaterialStatusModal: React.FC<MaterialStatusModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  material,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !material) return null;

  const handleToggle = async () => {
    try {
      setIsSubmitting(true);
      const newStatus = !material.isActive;
      const updated = await materialsApi.updateStatus(material.id, newStatus);
      toast.success(`Material '${updated.name}' has been ${updated.isActive ? 'activated' : 'deactivated'}.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const errMsg = err?.response?.data?.error?.message || 'Failed to update material status.';
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
          {material.isActive ? 'Deactivate Material' : 'Activate Material'}
        </h3>
        <p className="text-xs text-muted-foreground">
          Are you sure you want to {material.isActive ? 'deactivate' : 'activate'}{' '}
          <strong className="text-foreground">{material.name}</strong>?
        </p>
        {material.isActive && (
          <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded border border-amber-200 dark:border-amber-900">
            Note: Deactivating this material prevents selection in new purchases or job costings, but preserves past business history. No data will be deleted.
          </p>
        )}
        <div className="flex justify-end space-x-3 pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={material.isActive ? 'destructive' : 'default'}
            size="sm"
            onClick={handleToggle}
            isLoading={isSubmitting}
          >
            {material.isActive ? 'Deactivate Material' : 'Activate Material'}
          </Button>
        </div>
      </div>
    </div>
  );
};

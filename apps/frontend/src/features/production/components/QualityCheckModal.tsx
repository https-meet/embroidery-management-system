import React, { useEffect, useState } from 'react';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import type { QualityCheckFormValues } from '../schemas/production.schema';

export interface QualityCheckModalProps {
  isOpen: boolean;
  jobId: string;
  jobNo?: string;
  isLoading?: boolean;
  onConfirm: (values: QualityCheckFormValues) => Promise<void>;
  onCancel: () => void;
}

export const QualityCheckModal: React.FC<QualityCheckModalProps> = ({
  isOpen,
  jobId,
  jobNo,
  isLoading,
  onConfirm,
  onCancel,
}) => {
  const [passed, setPassed] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setPassed(true);
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm({
      jobId,
      passed,
      notes,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qc-modal-title"
    >
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg space-y-4">
        <h3 id="qc-modal-title" className="text-base font-bold text-foreground">
          Record Quality Check — {jobNo}
        </h3>
        <p className="text-xs text-muted-foreground">
          Inspect stitch quality, thread tension, and trim finishing for this embroidery job.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Quality Check Result" htmlFor="passed" required>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-xs font-medium text-foreground cursor-pointer">
                <input
                  type="radio"
                  name="qc_passed"
                  checked={passed === true}
                  onChange={() => setPassed(true)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  PASSED — Meets Quality Standard
                </span>
              </label>
              <label className="flex items-center space-x-2 text-xs font-medium text-foreground cursor-pointer">
                <input
                  type="radio"
                  name="qc_passed"
                  checked={passed === false}
                  onChange={() => setPassed(false)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  FAILED — Defect Detected
                </span>
              </label>
            </div>
          </FormField>

          <FormField label="Inspector Notes (optional)" htmlFor="notes">
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record any thread tension issues, placement remarks, or re-work details..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </FormField>

          <div className="flex justify-end space-x-2 border-t pt-4">
            <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isLoading}>
              Save Quality Record
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

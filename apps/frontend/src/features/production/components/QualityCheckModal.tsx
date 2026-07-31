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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPassed(true)}
                className={`flex items-center space-x-3 rounded-lg border p-3 text-left transition-all cursor-pointer ${
                  passed === true
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-input bg-card hover:bg-muted text-muted-foreground'
                }`}
              >
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${passed === true ? 'border-emerald-600 bg-emerald-600' : 'border-input'}`}>
                  {passed === true && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400">PASSED</span>
                  <span className="block text-[11px] text-muted-foreground">Meets Quality Standard</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPassed(false)}
                className={`flex items-center space-x-3 rounded-lg border p-3 text-left transition-all cursor-pointer ${
                  passed === false
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                    : 'border-input bg-card hover:bg-muted text-muted-foreground'
                }`}
              >
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${passed === false ? 'border-rose-600 bg-rose-600' : 'border-input'}`}>
                  {passed === false && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <span className="block text-xs font-bold text-rose-600 dark:text-rose-400">FAILED</span>
                  <span className="block text-[11px] text-muted-foreground">Defect Detected (Re-work)</span>
                </div>
              </button>
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

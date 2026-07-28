import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import { qualityCheckSchema, type QualityCheckFormValues } from '../schemas/production.schema';

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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QualityCheckFormValues>({
    resolver: zodResolver(qualityCheckSchema),
    defaultValues: {
      jobId,
      passed: true,
      notes: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        jobId,
        passed: true,
        notes: '',
      });
    }
  }, [isOpen, jobId, reset]);

  if (!isOpen) return null;

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

        <form onSubmit={handleSubmit(onConfirm)} className="space-y-4">
          <input type="hidden" value={jobId} {...register('jobId')} />

          <FormField label="Quality Check Result" htmlFor="passed" required>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-xs font-medium text-foreground cursor-pointer">
                <input
                  type="radio"
                  value="true"
                  defaultChecked
                  {...register('passed', {
                    setValueAs: (v) => v === 'true' || v === true,
                  })}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  PASSED — Meets Quality Standard
                </span>
              </label>
              <label className="flex items-center space-x-2 text-xs font-medium text-foreground cursor-pointer">
                <input
                  type="radio"
                  value="false"
                  {...register('passed', {
                    setValueAs: (v) => v === 'true' || v === true,
                  })}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  FAILED — Defect Detected
                </span>
              </label>
            </div>
          </FormField>

          <FormField
            label="Inspector Notes (optional)"
            htmlFor="notes"
            error={errors.notes?.message}
          >
            <textarea
              id="notes"
              rows={3}
              placeholder="Record any thread tension issues, placement remarks, or re-work details..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register('notes')}
            />
          </FormField>

          <div className="flex justify-end space-x-2 border-t pt-4">
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
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

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { assignOperatorSchema, type AssignOperatorFormValues } from '../schemas/production.schema';

export interface AssignOperatorModalProps {
  isOpen: boolean;
  jobId: string;
  jobNo?: string;
  currentOperator?: string | null;
  isLoading?: boolean;
  onConfirm: (values: AssignOperatorFormValues) => Promise<void>;
  onCancel: () => void;
}

export const AssignOperatorModal: React.FC<AssignOperatorModalProps> = ({
  isOpen,
  jobId,
  jobNo,
  currentOperator,
  isLoading,
  onConfirm,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignOperatorFormValues>({
    resolver: zodResolver(assignOperatorSchema),
    defaultValues: {
      jobId,
      assignedOperator: currentOperator || '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        jobId,
        assignedOperator: currentOperator || '',
      });
    }
  }, [isOpen, jobId, currentOperator, reset]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-modal-title"
    >
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg space-y-4">
        <h3 id="assign-modal-title" className="text-base font-bold text-foreground">
          Assign Operator — {jobNo}
        </h3>
        <p className="text-xs text-muted-foreground">
          Select or specify the embroidery machine operator responsible for this order.
        </p>

        <form onSubmit={handleSubmit(onConfirm)} className="space-y-4">
          <FormField
            label="Operator Name"
            htmlFor="assignedOperator"
            required
            error={errors.assignedOperator?.message}
          >
            <Input
              id="assignedOperator"
              placeholder="e.g. Ramesh Singh / Machine Line 1"
              error={Boolean(errors.assignedOperator)}
              {...register('assignedOperator')}
            />
          </FormField>

          <div className="flex justify-end space-x-2 border-t pt-4">
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isLoading}>
              Assign Operator
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

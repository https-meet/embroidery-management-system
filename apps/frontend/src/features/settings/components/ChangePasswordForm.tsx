import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { changePasswordSchema, type ChangePasswordFormValues } from '../schemas/settings.schema';

export const ChangePasswordForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (_values: ChangePasswordFormValues) => {
    try {
      // Simulate API call for password update
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success('Account password updated successfully.');
      reset();
    } catch {
      toast.error('Failed to change password.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-base font-bold text-foreground border-b pb-2">
        Change Account Password
      </h3>

      <FormField
        label="Current Password"
        htmlFor="currentPassword"
        required
        error={errors.currentPassword?.message}
      >
        <Input
          id="currentPassword"
          type="password"
          placeholder="••••••••"
          error={Boolean(errors.currentPassword)}
          {...register('currentPassword')}
        />
      </FormField>

      <FormField
        label="New Password"
        htmlFor="newPassword"
        required
        error={errors.newPassword?.message}
      >
        <Input
          id="newPassword"
          type="password"
          placeholder="Min 6 characters"
          error={Boolean(errors.newPassword)}
          {...register('newPassword')}
        />
      </FormField>

      <FormField
        label="Confirm New Password"
        htmlFor="confirmPassword"
        required
        error={errors.confirmPassword?.message}
      >
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Re-enter new password"
          error={Boolean(errors.confirmPassword)}
          {...register('confirmPassword')}
        />
      </FormField>

      <div className="flex justify-end border-t pt-4">
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          Update Password
        </Button>
      </div>
    </form>
  );
};

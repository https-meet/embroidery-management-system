import { z } from 'zod';

export const businessSettingsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(100),
  gstin: z.string().max(20).optional().or(z.literal('')),
  mobile: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  bankDetails: z.string().max(500).optional().or(z.literal('')),
  defaultNotes: z.string().max(500).optional().or(z.literal('')),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

export type BusinessSettingsFormValues = z.infer<typeof businessSettingsSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

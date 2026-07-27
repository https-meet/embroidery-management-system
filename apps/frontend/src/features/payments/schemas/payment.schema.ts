import { z } from 'zod';

export const createPaymentSchema = z.object({
  customerId: z.string().min(1, 'Customer selection is required'),
  invoiceId: z.string().optional().or(z.literal('')),
  paymentDate: z.string().optional().or(z.literal('')),
  paymentMethod: z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'OTHER']),
  amount: z.number().positive('Payment amount must be greater than 0'),
  referenceNo: z.string().max(100).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export type CreatePaymentFormValues = z.infer<typeof createPaymentSchema>;

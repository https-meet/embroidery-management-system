import { z } from 'zod';

export const invoiceItemSchema = z.object({
  sourceJobId: z.string().optional().or(z.literal('')),
  sourceJobItemRef: z.string().optional().or(z.literal('')),
  description: z.string().min(1, 'Description is required').max(200),
  quantity: z.number().int('Quantity must be an integer').min(1, 'Quantity must be at least 1'),
  rate: z.number().min(0, 'Rate must be non-negative'),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer selection is required'),
  invoiceDate: z.string().optional().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
  discountType: z.enum(['PERCENTAGE', 'FIXED', 'FIXED_AMOUNT']).optional(),
  discountValue: z.number().min(0, 'Discount value must be non-negative').optional(),
  notes: z.string().max(500).optional().or(z.literal('')),
  items: z.array(invoiceItemSchema).optional(),
  jobIds: z.array(z.string()).optional(),
});

export const updateInvoiceSchema = z.object({
  dueDate: z.string().optional().or(z.literal('')),
  discountType: z.enum(['PERCENTAGE', 'FIXED', 'FIXED_AMOUNT']).optional(),
  discountValue: z.number().min(0, 'Discount value must be non-negative').optional(),
  status: z.enum(['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'VOID', 'OVERDUE']).optional(),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export type CreateInvoiceFormValues = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceFormValues = z.infer<typeof updateInvoiceSchema>;

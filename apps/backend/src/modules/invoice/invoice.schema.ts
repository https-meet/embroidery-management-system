import { DiscountType, InvoiceStatus } from '@prisma/client';
import { z } from 'zod';

export const createInvoiceItemSchema = z.object({
  sourceJobId: z.string().uuid().optional(),
  sourceJobItemRef: z.string().uuid().optional(),
  description: z.string().min(1, 'Item description is required.').max(200),
  quantity: z
    .number()
    .int('Quantity must be an integer.')
    .positive('Quantity must be greater than 0.'),
  rate: z.number().nonnegative('Rate cannot be negative.'),
});

export const createInvoiceSchema = z
  .object({
    customerId: z.string().uuid('Invalid customer ID format.'),
    invoiceDate: z.string().datetime({ offset: true }).optional(),
    dueDate: z.string().datetime({ offset: true }).optional(),
    discountType: z.nativeEnum(DiscountType).optional(),
    discountValue: z.number().nonnegative().optional(),
    notes: z.string().max(1000).optional(),
    items: z.array(createInvoiceItemSchema).optional(),
    jobIds: z.array(z.string().uuid()).optional(),
  })
  .refine(
    (data) => (data.items && data.items.length > 0) || (data.jobIds && data.jobIds.length > 0),
    {
      message: 'Either invoice items or jobIds must be provided to create an invoice.',
      path: ['items'],
    },
  );

export const updateInvoiceSchema = z.object({
  dueDate: z.string().datetime({ offset: true }).optional(),
  discountType: z.nativeEnum(DiscountType).optional(),
  discountValue: z.number().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
});

export const invoiceQuerySchema = z.object({
  search: z.string().optional(),
  customerId: z.string().uuid().optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  page: z
    .string()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
  limit: z
    .string()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive().max(100)),
  sortBy: z
    .enum(['invoiceNo', 'invoiceDate', 'createdAt', 'grandTotal', 'status'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

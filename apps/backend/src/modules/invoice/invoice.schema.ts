import { DiscountType, InvoiceStatus } from '@prisma/client';
import { z } from 'zod';

const optionalUuid = z
  .string()
  .uuid('Invalid UUID format.')
  .optional()
  .or(z.literal(''))
  .nullable()
  .transform((val) => (val && val.trim() !== '' ? val : undefined));

const optionalDateString = z
  .string()
  .optional()
  .or(z.literal(''))
  .nullable()
  .transform((val) => {
    if (!val || val.trim() === '') return undefined;
    const date = new Date(val);
    return isNaN(date.getTime()) ? undefined : date.toISOString();
  });

const DiscountTypeSchema = z
  .union([
    z.nativeEnum(DiscountType),
    z.literal('FIXED').transform(() => DiscountType.FIXED_AMOUNT),
    z.literal('FIXED_AMOUNT').transform(() => DiscountType.FIXED_AMOUNT),
    z.literal('').transform(() => undefined),
  ])
  .optional()
  .nullable();

export const createInvoiceItemSchema = z.object({
  sourceJobId: optionalUuid,
  sourceJobItemRef: optionalUuid,
  description: z.string().min(1, 'Item description is required.').max(200),
  quantity: z.coerce
    .number()
    .int('Quantity must be an integer.')
    .positive('Quantity must be greater than 0.'),
  rate: z.coerce.number().nonnegative('Rate cannot be negative.'),
});

export const createInvoiceSchema = z
  .object({
    customerId: z.string().uuid('Invalid customer ID format.'),
    invoiceDate: optionalDateString,
    dueDate: optionalDateString,
    discountType: DiscountTypeSchema,
    discountValue: z.coerce.number().nonnegative().optional().nullable(),
    notes: z.string().max(1000).optional().or(z.literal('')).nullable(),
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
  dueDate: optionalDateString,
  discountType: DiscountTypeSchema,
  discountValue: z.coerce.number().nonnegative().optional().nullable(),
  notes: z.string().max(1000).optional().or(z.literal('')).nullable(),
  status: z.nativeEnum(InvoiceStatus).optional(),
});

export const invoiceQuerySchema = z.object({
  search: z.string().optional(),
  customerId: optionalUuid,
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

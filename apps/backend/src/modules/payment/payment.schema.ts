import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { z } from 'zod';

const optionalUuid = z
  .string()
  .uuid('Invalid UUID format.')
  .optional()
  .or(z.literal(''))
  .nullable()
  .transform((val) => (val && val.trim() !== '' ? val : undefined));

const optionalString = z
  .string()
  .optional()
  .or(z.literal(''))
  .nullable()
  .transform((val) => (val && val.trim() !== '' ? val.trim() : undefined));

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

const PaymentStatusSchema = z
  .union([
    z.nativeEnum(PaymentStatus),
    z.literal('').transform(() => undefined),
  ])
  .optional()
  .nullable();

const PaymentMethodSchema = z
  .union([
    z.nativeEnum(PaymentMethod),
    z.literal('').transform(() => undefined),
  ])
  .optional()
  .nullable();

export const createPaymentAllocationSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID format.'),
  allocatedAmount: z.number().positive('Allocated amount must be greater than zero.'),
});

export const createPaymentSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID format.'),
  paymentDate: optionalDateString,
  paymentMethod: z.nativeEnum(PaymentMethod),
  referenceNo: z.string().max(100).optional().or(z.literal('')).nullable(),
  amount: z.number().positive('Payment amount must be greater than zero.'),
  notes: z.string().max(1000).optional().or(z.literal('')).nullable(),
  allocations: z.array(createPaymentAllocationSchema).optional(),
});

export const paymentQuerySchema = z.object({
  search: optionalString,
  customerId: optionalUuid,
  status: PaymentStatusSchema,
  paymentMethod: PaymentMethodSchema,
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
    .enum(['paymentNo', 'paymentDate', 'createdAt', 'amount'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { z } from 'zod';

export const createPaymentAllocationSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID format.'),
  allocatedAmount: z.number().positive('Allocated amount must be greater than zero.'),
});

export const createPaymentSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID format.'),
  paymentDate: z.string().datetime({ offset: true }).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  referenceNo: z.string().max(100).optional(),
  amount: z.number().positive('Payment amount must be greater than zero.'),
  notes: z.string().max(1000).optional(),
  allocations: z.array(createPaymentAllocationSchema).optional(),
});

export const paymentQuerySchema = z.object({
  search: z.string().optional(),
  customerId: z.string().uuid().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
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

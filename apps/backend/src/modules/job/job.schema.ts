import { JobStatus, Priority } from '@prisma/client';
import { z } from 'zod';

export const createJobItemSchema = z.object({
  designId: z.string().uuid('Invalid design ID format.').optional(),
  position: z.string().min(1, 'Embroidery position is required.').max(100),
  quantity: z
    .number()
    .int('Quantity must be an integer.')
    .positive('Quantity must be greater than 0.'),
  rate: z.number().nonnegative('Rate cannot be negative.'),
  threadColor: z.string().max(100).optional(),
  dimensions: z.string().max(100).optional(),
  remarks: z.string().max(500).optional(),
});

export const createJobSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID format.'),
  jobDate: z.string().datetime({ offset: true }).optional(),
  expectedDeliveryDate: z.string().datetime({ offset: true }).optional(),
  priority: z.nativeEnum(Priority).optional().default(Priority.NORMAL),
  notes: z.string().max(1000).optional(),
  items: z.array(createJobItemSchema).min(1, 'A Job must contain at least one Job Item.'),
});

export const updateJobSchema = z.object({
  jobDate: z.string().datetime({ offset: true }).optional(),
  expectedDeliveryDate: z.string().datetime({ offset: true }).optional(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(JobStatus).optional(),
  notes: z.string().max(1000).optional(),
});

export const jobQuerySchema = z.object({
  search: z.string().optional(),
  customerId: z.string().uuid().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
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
    .enum(['jobNo', 'jobDate', 'createdAt', 'priority', 'status'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

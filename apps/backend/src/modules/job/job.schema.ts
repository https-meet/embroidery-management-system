import { JobStatus, Priority } from '@prisma/client';
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

export const createJobItemSchema = z.object({
  designId: optionalUuid,
  position: z.string().min(1, 'Embroidery position is required.').max(100),
  quantity: z
    .number()
    .int('Quantity must be an integer.')
    .positive('Quantity must be greater than 0.'),
  rate: z.number().nonnegative('Rate cannot be negative.'),
  threadColor: z.string().max(100).optional().or(z.literal('')).nullable(),
  dimensions: z.string().max(100).optional().or(z.literal('')).nullable(),
  remarks: z.string().max(500).optional().or(z.literal('')).nullable(),
});

export const createJobSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID format.'),
  jobDate: optionalDateString,
  expectedDeliveryDate: optionalDateString,
  priority: z.nativeEnum(Priority).optional().default(Priority.NORMAL),
  notes: z.string().max(1000).optional().or(z.literal('')).nullable(),
  items: z.array(createJobItemSchema).min(1, 'A Job must contain at least one Job Item.'),
});

export const updateJobSchema = z.object({
  customerId: optionalUuid,
  assignedOperator: z.string().max(100).optional().or(z.literal('')).nullable(),
  jobDate: optionalDateString,
  expectedDeliveryDate: optionalDateString,
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(JobStatus).optional(),
  notes: z.string().max(1000).optional().or(z.literal('')).nullable(),
  items: z.array(createJobItemSchema).optional(),
});

export const jobQuerySchema = z.object({
  search: z.string().optional(),
  customerId: optionalUuid,
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

import { JobItemProductionStatus, JobStatus } from '@prisma/client';
import { z } from 'zod';

const JobStatusQuerySchema = z.union([
  z.nativeEnum(JobStatus),
  z.literal('PENDING_PRODUCTION').transform(() => JobStatus.IN_PROGRESS),
  z.literal('IN_PRODUCTION').transform(() => JobStatus.IN_PROGRESS),
  z.literal('').transform(() => undefined),
]);

export const assignProductionSchema = z.object({
  jobId: z.string().uuid('Invalid job ID format.'),
  assignedOperator: z.string().min(1, 'Assigned operator is required.').max(100),
});

export const startProductionSchema = z.object({
  jobId: z.string().uuid('Invalid job ID format.'),
});

export const completeProductionSchema = z.object({
  jobId: z.string().uuid('Invalid job ID format.'),
  notes: z.string().max(1000).optional().or(z.literal('')).nullable(),
});

export const qualityCheckSchema = z.object({
  jobId: z.string().uuid('Invalid job ID format.'),
  passed: z.union([z.boolean(), z.string().transform((val) => val === 'true')]),
  notes: z.string().max(1000).optional().or(z.literal('')).nullable(),
});

export const deliveryReadinessSchema = z.object({
  jobId: z.string().uuid('Invalid job ID format.'),
});

export const productionQuerySchema = z.object({
  search: z.string().optional(),
  assignedOperator: z.string().optional(),
  status: JobStatusQuerySchema.optional(),
  productionStatus: z.nativeEnum(JobItemProductionStatus).optional(),
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
  sortBy: z.enum(['jobNo', 'createdAt', 'priority']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

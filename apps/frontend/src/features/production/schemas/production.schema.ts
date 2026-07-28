import { z } from 'zod';

export const assignOperatorSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  assignedOperator: z
    .string()
    .min(1, 'Operator name is required')
    .max(100, 'Operator name is too long'),
});

export const qualityCheckSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  passed: z.union([
    z.boolean(),
    z.string().transform((val) => val === 'true'),
  ]),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export const completeProductionSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export type AssignOperatorFormValues = z.infer<typeof assignOperatorSchema>;
export type QualityCheckFormValues = z.infer<typeof qualityCheckSchema>;
export type CompleteProductionFormValues = z.infer<typeof completeProductionSchema>;

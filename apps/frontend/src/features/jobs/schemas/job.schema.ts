import { z } from 'zod';

export const jobItemSchema = z.object({
  designId: z.string().optional().or(z.literal('')),
  position: z.string().min(1, 'Position is required').max(100),
  quantity: z.number().int('Quantity must be an integer').min(1, 'Quantity must be at least 1'),
  rate: z.number().min(0, 'Rate must be non-negative'),
  threadColor: z.string().max(100).optional().or(z.literal('')),
  dimensions: z.string().max(100).optional().or(z.literal('')),
  remarks: z.string().max(300).optional().or(z.literal('')),
});

export const createJobSchema = z.object({
  customerId: z.string().min(1, 'Customer selection is required'),
  jobDate: z.string().optional().or(z.literal('')),
  expectedDeliveryDate: z.string().optional().or(z.literal('')),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  notes: z.string().max(500).optional().or(z.literal('')),
  items: z.array(jobItemSchema).min(1, 'At least one job item is required'),
});

export const updateJobSchema = z.object({
  customerId: z.string().min(1, 'Customer selection is required').optional(),
  jobDate: z.string().optional().or(z.literal('')),
  expectedDeliveryDate: z.string().optional().or(z.literal('')),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'CANCELLED']).optional(),
  notes: z.string().max(500).optional().or(z.literal('')),
  items: z.array(jobItemSchema).min(1, 'At least one job item is required').optional(),
});

export type CreateJobFormValues = z.infer<typeof createJobSchema>;
export type UpdateJobFormValues = z.infer<typeof updateJobSchema>;

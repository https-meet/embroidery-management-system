import { z } from 'zod';

export const designSchema = z.object({
  name: z.string().min(1, 'Design name is required').max(100, 'Name is too long'),
  category: z.string().max(50, 'Category is too long').optional().or(z.literal('')),
  description: z.string().max(300).optional().or(z.literal('')),
  previewUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
  primaryFileUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
  primaryFileType: z.string().max(20).optional().or(z.literal('')),
  stitchCount: z
    .number()
    .int('Stitch count must be an integer')
    .nonnegative('Stitch count must be non-negative')
    .optional(),
  widthMm: z
    .number()
    .nonnegative('Width must be non-negative')
    .optional(),
  heightMm: z
    .number()
    .nonnegative('Height must be non-negative')
    .optional(),
  colorCount: z
    .number()
    .int('Color count must be an integer')
    .nonnegative('Color count must be non-negative')
    .optional(),
  notes: z.string().max(500).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export type DesignFormValues = z.infer<typeof designSchema>;

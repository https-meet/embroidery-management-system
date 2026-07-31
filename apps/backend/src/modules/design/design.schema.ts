import { z } from 'zod';

const optionalNum = z.preprocess(
  (val) => (val === '' || val === null || (typeof val === 'number' && Number.isNaN(val)) ? undefined : Number(val)),
  z.number().nonnegative().optional()
);

const optionalIntNum = z.preprocess(
  (val) => (val === '' || val === null || (typeof val === 'number' && Number.isNaN(val)) ? undefined : Number(val)),
  z.number().int().nonnegative().optional()
);

export const createDesignSchema = z.object({
  name: z.string().min(1, 'Design name is required.').max(100),
  description: z.string().max(1000).optional().or(z.literal('')),
  category: z.string().max(50).optional().or(z.literal('')),
  previewUrl: z.string().url('Invalid preview URL format.').optional().or(z.literal('')),
  primaryFileUrl: z.string().url('Invalid file URL format.').optional().or(z.literal('')),
  primaryFileType: z.enum(['DST', 'EMB', 'PES', 'PNG', 'JPG', 'JPEG', 'PDF']).optional().or(z.literal('')),
  stitchCount: optionalIntNum,
  widthMm: optionalNum,
  heightMm: optionalNum,
  colorCount: optionalIntNum,
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export const updateDesignSchema = z.object({
  name: z.string().min(1, 'Design name cannot be empty.').max(100).optional(),
  description: z.string().max(1000).optional().or(z.literal('')),
  category: z.string().max(50).optional().or(z.literal('')),
  previewUrl: z.string().url('Invalid preview URL format.').optional().or(z.literal('')),
  primaryFileUrl: z.string().url('Invalid file URL format.').optional().or(z.literal('')),
  primaryFileType: z.enum(['DST', 'EMB', 'PES', 'PNG', 'JPG', 'JPEG', 'PDF']).optional().or(z.literal('')),
  stitchCount: optionalIntNum,
  widthMm: optionalNum,
  heightMm: optionalNum,
  colorCount: optionalIntNum,
  notes: z.string().max(1000).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export const designQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
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
  sortBy: z.enum(['name', 'designCode', 'createdAt', 'category']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

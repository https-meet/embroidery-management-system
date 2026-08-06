import { z } from 'zod';
import { MaterialCategory, MaterialUnit } from '@prisma/client';

export const materialCategoryEnum = z.nativeEnum(MaterialCategory);
export const materialUnitEnum = z.nativeEnum(MaterialUnit);

export const createMaterialSchema = z.object({
  name: z
    .string()
    .min(2, 'Material name must be at least 2 characters long.')
    .max(100, 'Material name must not exceed 100 characters.')
    .transform((val) => val.trim()),
  sku: z.string().max(50, 'SKU must not exceed 50 characters.').nullish(),
  brand: z.string().max(50, 'Brand must not exceed 50 characters.').nullish(),
  colorName: z.string().max(50, 'Color name must not exceed 50 characters.').nullish(),
  colorCode: z.string().max(50, 'Color code must not exceed 50 characters.').nullish(),
  category: materialCategoryEnum.optional().default(MaterialCategory.OTHER),
  unit: materialUnitEnum.optional().default(MaterialUnit.PCS),
  purchasePrice: z.number().min(0, 'Purchase price must be greater than or equal to 0.').optional().default(0),
  sellingPrice: z.number().min(0, 'Selling price must be greater than or equal to 0.').nullish(),
  minimumStock: z.number().min(0, 'Minimum stock must be greater than or equal to 0.').optional().default(0),
  currentStock: z.number().min(0, 'Current stock must be greater than or equal to 0.').optional().default(0),
  description: z.string().max(500, 'Description must not exceed 500 characters.').nullish(),
});

export const updateMaterialSchema = createMaterialSchema.partial();

export const updateMaterialStatusSchema = z.object({
  isActive: z.boolean({ message: 'isActive boolean status is required.' }),
});

export const materialQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  category: materialCategoryEnum.optional(),
  brand: z.string().optional(),
  active: z.string().optional(),
  sortBy: z.enum(['name', 'brand', 'currentStock', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

import { z } from 'zod';

export const createPurchaseItemSchema = z.object({
  materialId: z.string().uuid('Invalid Material UUID format.'),
  quantity: z.number().gt(0, 'Item quantity must be greater than 0.'),
  unitPrice: z.number().min(0, 'Unit price must be greater than or equal to 0.'),
});

export const createPurchaseSchema = z.object({
  supplierId: z.string().uuid('Invalid Supplier UUID format.'),
  purchaseDate: z.string().or(z.date()).optional(),
  invoiceNumber: z.string().max(100, 'Invoice number must not exceed 100 characters.').nullish(),
  invoiceDate: z.string().or(z.date()).nullish(),
  discount: z.number().min(0, 'Discount must be greater than or equal to 0.').optional().default(0),
  tax: z.number().min(0, 'Tax must be greater than or equal to 0.').optional().default(0),
  notes: z.string().max(500, 'Notes must not exceed 500 characters.').nullish(),
  updateInventory: z.boolean().optional().default(false),
  items: z.array(createPurchaseItemSchema).min(1, 'Purchase must contain at least one purchase item.'),
});

export const updatePurchaseSchema = createPurchaseSchema.partial();

export const purchaseQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  supplierId: z.string().optional(),
  inventoryUpdated: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['purchaseNumber', 'purchaseDate', 'total', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

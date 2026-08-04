import { z } from 'zod';

const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;

export const createSupplierSchema = z.object({
  name: z
    .string()
    .min(2, 'Supplier name must be at least 2 characters long.')
    .max(100, 'Supplier name must not exceed 100 characters.')
    .transform((val) => val.trim()),
  contactPerson: z.string().max(100, 'Contact person name must not exceed 100 characters.').nullish(),
  phone: z
    .string()
    .max(20, 'Phone number must not exceed 20 characters.')
    .nullish(),
  email: z
    .string()
    .email('Invalid email address format.')
    .max(100, 'Email address must not exceed 100 characters.')
    .nullish()
    .or(z.literal('')),
  gstNumber: z
    .string()
    .max(15, 'GST number must not exceed 15 characters.')
    .refine((val) => !val || gstRegex.test(val), {
      message: 'Invalid GSTIN format (e.g. 24AAAAA0000A1Z5).',
    })
    .nullish()
    .or(z.literal('')),
  address: z.string().max(255, 'Address must not exceed 255 characters.').nullish(),
  city: z.string().max(50, 'City must not exceed 50 characters.').nullish(),
  state: z.string().max(50, 'State must not exceed 50 characters.').nullish(),
  country: z.string().max(50, 'Country must not exceed 50 characters.').nullish().default('India'),
  postalCode: z.string().max(10, 'Postal code must not exceed 10 characters.').nullish(),
  notes: z.string().max(500, 'Notes must not exceed 500 characters.').nullish(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const updateSupplierStatusSchema = z.object({
  isActive: z.boolean(),
});

export const supplierQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  active: z.string().optional(),
  sortBy: z.enum(['name', 'city', 'state', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

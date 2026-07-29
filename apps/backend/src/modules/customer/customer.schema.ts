import { CustomerType } from '@prisma/client';
import { z } from 'zod';

const optionalString = z
  .string()
  .optional()
  .or(z.literal(''))
  .nullable()
  .transform((val) => (val && val.trim() !== '' ? val.trim() : undefined));

const CustomerTypeSchema = z
  .union([
    z.nativeEnum(CustomerType),
    z.literal('').transform(() => undefined),
  ])
  .optional()
  .nullable();

export const createCustomerSchema = z.object({
  customerType: z.nativeEnum(CustomerType).optional().default(CustomerType.INDIVIDUAL),
  name: z.string().min(1, 'Customer name is required.').max(100),
  contactPerson: z.string().max(100).optional(),
  mobile: z
    .string()
    .regex(/^[0-9+\-\s()]{7,20}$/, 'Invalid mobile number format.')
    .optional()
    .or(z.literal('')),
  alternateMobile: z
    .string()
    .regex(/^[0-9+\-\s()]{7,20}$/, 'Invalid mobile number format.')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateCustomerSchema = z.object({
  customerType: CustomerTypeSchema,
  name: z.string().min(1, 'Customer name cannot be empty.').max(100).optional(),
  contactPerson: z.string().max(100).optional(),
  mobile: z
    .string()
    .regex(/^[0-9+\-\s()]{7,20}$/, 'Invalid mobile number format.')
    .optional()
    .or(z.literal('')),
  alternateMobile: z
    .string()
    .regex(/^[0-9+\-\s()]{7,20}$/, 'Invalid mobile number format.')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
});

export const customerQuerySchema = z.object({
  search: optionalString,
  customerType: CustomerTypeSchema,
  isActive: z
    .union([
      z.string().transform((val) => (val === '' ? undefined : val === 'true')),
      z.boolean(),
    ])
    .optional()
    .nullable(),
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
  sortBy: z.enum(['name', 'customerCode', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

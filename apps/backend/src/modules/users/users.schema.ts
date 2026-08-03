import { Role } from '@prisma/client';
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long.').max(100),
  email: z.string().email('Invalid email address format.'),
  role: z.nativeEnum(Role, {
    message: 'Invalid user role specified.',
  }),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long.').max(100).optional(),
  email: z.string().email('Invalid email address format.').optional(),
  role: z.nativeEnum(Role, {
    message: 'Invalid user role specified.',
  }).optional(),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean({
    message: 'isActive boolean flag is required.',
  }),
});

export const userQuerySchema = z.object({
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
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
  sortBy: z.enum(['name', 'email', 'role', 'createdAt', 'lastLoginAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

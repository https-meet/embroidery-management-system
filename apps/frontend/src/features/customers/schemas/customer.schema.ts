import { z } from 'zod';

const mobileRegex = /^(\+91[\-\s]?)?[0-9]{10}$/;

export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required').max(100, 'Name is too long'),
  customerType: z.enum(['INDIVIDUAL', 'COMPANY']),
  contactPerson: z.string().max(100).optional().or(z.literal('')),
  mobile: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || mobileRegex.test(val.replace(/\s+/g, '')), {
      message: 'Please enter a valid 10-digit mobile number',
    }),
  alternateMobile: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || mobileRegex.test(val.replace(/\s+/g, '')), {
      message: 'Please enter a valid 10-digit alternate mobile number',
    }),
  email: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Please enter a valid email address',
    }),
  address: z.string().max(300).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

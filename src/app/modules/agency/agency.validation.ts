import { z } from 'zod';

export const agencySchema = z.object({
  body: z.object({
    // Agency fields (matching frontend form)
    name: z.string({ required_error: 'Agency name is required' }),
    contact_email: z
      .string({ required_error: 'Contact email is required' })
      .email('Must be a valid email'),
    contact_phone: z.string().optional(),
    website: z
      .string()
      .url('Website must be a valid URL')
      .optional()
      .or(z.literal('')),
    director_name: z.string().optional(),
    established_year: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : undefined)),
    description: z.string().optional(),
    address: z.string().optional(),
    facebook_url: z
      .string()
      .url('Facebook URL must be valid')
      .optional()
      .or(z.literal('')),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    is_approved: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    is_deleted: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
  }),
});

export const agencyUpdateSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    contact_email: z.string().email('Must be a valid email').optional(),
    contact_phone: z.string().optional(),
    website: z
      .string()
      .url('Website must be a valid URL')
      .optional()
      .or(z.literal('')),
    director_name: z.string().optional(),
    established_year: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : undefined)),
    description: z.string().optional(),
    address: z.string().optional(),
    facebook_url: z
      .string()
      .url('Facebook URL must be valid')
      .optional()
      .or(z.literal('')),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    is_approved: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    is_deleted: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
  }),
});

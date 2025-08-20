import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    agency_id: z.string({ required_error: 'Agency ID is required' }),
    payment_month: z
      .string({ required_error: 'Payment month is required' })
      .regex(/^\d{4}-\d{2}$/, 'Payment month must be in YYYY-MM format'),
    amount: z
      .number({ required_error: 'Amount is required' })
      .positive('Amount must be positive'),
    payment_method: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updatePaymentSchema = z.object({
  body: z.object({
    agency_id: z.string().optional(),
    payment_month: z
      .string()
      .regex(/^\d{4}-\d{2}$/, 'Payment month must be in YYYY-MM format')
      .optional(),
    amount: z.number().positive('Amount must be positive').optional(),
    payment_status: z
      .enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'OVERDUE'])
      .optional(),
    payment_method: z.string().optional(),
    transaction_id: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const approvePaymentSchema = z.object({
  body: z.object({
    payment_status: z.enum(['PAID', 'REJECTED'], {
      required_error: 'Payment status is required for approval',
    }),
    notes: z.string().optional(),
  }),
});

export const bulkCreatePaymentSchema = z.object({
  body: z.object({
    payment_month: z
      .string({ required_error: 'Payment month is required' })
      .regex(/^\d{4}-\d{2}$/, 'Payment month must be in YYYY-MM format'),
    amount: z
      .number({ required_error: 'Amount is required' })
      .positive('Amount must be positive'),
    agency_ids: z
      .array(z.string())
      .min(1, 'At least one agency ID is required')
      .optional(),
    include_all_active_agencies: z.boolean().optional(),
  }),
});

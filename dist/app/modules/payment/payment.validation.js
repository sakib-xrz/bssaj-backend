"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreatePaymentSchema = exports.approvePaymentSchema = exports.updatePaymentSchema = exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
exports.createPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        agency_id: zod_1.z.string({ required_error: 'Agency ID is required' }),
        payment_month: zod_1.z
            .string({ required_error: 'Payment month is required' })
            .regex(/^\d{4}-\d{2}$/, 'Payment month must be in YYYY-MM format'),
        amount: zod_1.z
            .number({ required_error: 'Amount is required' })
            .positive('Amount must be positive'),
        payment_method: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
    }),
});
exports.updatePaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        agency_id: zod_1.z.string().optional(),
        payment_month: zod_1.z
            .string()
            .regex(/^\d{4}-\d{2}$/, 'Payment month must be in YYYY-MM format')
            .optional(),
        amount: zod_1.z.number().positive('Amount must be positive').optional(),
        payment_status: zod_1.z
            .enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'OVERDUE'])
            .optional(),
        payment_method: zod_1.z.string().optional(),
        transaction_id: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
    }),
});
exports.approvePaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        payment_status: zod_1.z.enum(['PAID', 'FAILED'], {
            required_error: 'Payment status is required for approval',
        }),
        notes: zod_1.z.string().optional(),
    }),
});
exports.bulkCreatePaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        payment_month: zod_1.z
            .string({ required_error: 'Payment month is required' })
            .regex(/^\d{4}-\d{2}$/, 'Payment month must be in YYYY-MM format'),
        amount: zod_1.z
            .number({ required_error: 'Amount is required' })
            .positive('Amount must be positive'),
        agency_ids: zod_1.z
            .array(zod_1.z.string())
            .min(1, 'At least one agency ID is required')
            .optional(),
        include_all_active_agencies: zod_1.z.boolean().optional(),
    }),
});

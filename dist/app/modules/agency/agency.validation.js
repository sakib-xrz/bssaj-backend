"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agencyUpdateSchema = exports.agencySchema = void 0;
const zod_1 = require("zod");
exports.agencySchema = zod_1.z.object({
    body: zod_1.z.object({
        // Agency fields (matching frontend form)
        name: zod_1.z.string({ required_error: 'Agency name is required' }),
        contact_email: zod_1.z
            .string({ required_error: 'Contact email is required' })
            .email('Must be a valid email'),
        contact_phone: zod_1.z.string().optional(),
        website: zod_1.z
            .string()
            .url('Website must be a valid URL')
            .optional()
            .or(zod_1.z.literal('')),
        director_name: zod_1.z.string().optional(),
        established_year: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? Number(val) : undefined)),
        description: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        facebook_url: zod_1.z
            .string()
            .url('Facebook URL must be valid')
            .optional()
            .or(zod_1.z.literal('')),
        status: zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
        is_approved: zod_1.z
            .string()
            .transform((val) => val === 'true')
            .optional(),
        is_deleted: zod_1.z
            .string()
            .transform((val) => val === 'true')
            .optional(),
    }),
});
exports.agencyUpdateSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        contact_email: zod_1.z.string().email('Must be a valid email').optional(),
        contact_phone: zod_1.z.string().optional(),
        website: zod_1.z
            .string()
            .url('Website must be a valid URL')
            .optional()
            .or(zod_1.z.literal('')),
        director_name: zod_1.z.string().optional(),
        established_year: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? Number(val) : undefined)),
        description: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        facebook_url: zod_1.z
            .string()
            .url('Facebook URL must be valid')
            .optional()
            .or(zod_1.z.literal('')),
        status: zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
        is_approved: zod_1.z
            .string()
            .transform((val) => val === 'true')
            .optional(),
        is_deleted: zod_1.z
            .string()
            .transform((val) => val === 'true')
            .optional(),
    }),
});

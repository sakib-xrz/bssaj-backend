"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const CreateConsultationSchema = zod_1.z.object({
    body: zod_1.z.object({
        kind: zod_1.z.enum([
            'ACADEMIC_CONSULTATION',
            'CAREER_CONSULTATION',
            'VISA_AND_IMMIGRATION_CONSULTATION',
            'PERSONAL_CONSULTATION',
        ], {
            required_error: 'Consultation kind is required',
        }),
        name: zod_1.z.string({ required_error: 'Name is required' }),
        email: zod_1.z
            .string({ required_error: 'Email is required' })
            .email('Must be a valid email'),
        phone: zod_1.z.string({ required_error: 'Phone is required' }),
        message: zod_1.z.string({ required_error: 'Message is required' }),
    }),
});
const UpdateConsultationStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['PENDING', 'RESOLVED', 'CANCELLED'], {
            required_error: 'Status is required',
        }),
    }),
});
const ConsultationValidation = {
    CreateConsultationSchema,
    UpdateConsultationStatusSchema,
};
exports.default = ConsultationValidation;

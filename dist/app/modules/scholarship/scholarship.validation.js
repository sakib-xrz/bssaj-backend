"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScholarshipValidation = void 0;
const zod_1 = require("zod");
const CreateScholarshipSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ required_error: 'Title is required' }),
        description: zod_1.z.string({ required_error: 'Description is required' }),
        eligibility: zod_1.z.string().optional(),
        provider: zod_1.z.string().optional(),
        amount: zod_1.z.number().optional(),
        deadline: zod_1.z.string({ required_error: 'Deadline is required' }),
        application_url: zod_1.z
            .string({ required_error: 'Application URL is required' })
            .url('Must be a valid URL'),
    }),
});
const UpdateScholarshipSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        eligibility: zod_1.z.string().optional(),
        provider: zod_1.z.string().optional(),
        amount: zod_1.z.number().optional(),
        deadline: zod_1.z.string().optional(),
        application_url: zod_1.z.string().url('Must be a valid URL').optional(),
    }),
});
exports.ScholarshipValidation = {
    CreateScholarshipSchema,
    UpdateScholarshipSchema,
};

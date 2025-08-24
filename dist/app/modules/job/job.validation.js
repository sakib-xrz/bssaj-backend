"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const CreateJobSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ required_error: 'Title is required' }),
        description: zod_1.z.string({ required_error: 'Description is required' }),
        kind: zod_1.z.nativeEnum(client_1.JobKind, { required_error: 'Job kind is required' }),
        type: zod_1.z.nativeEnum(client_1.JobType, { required_error: 'Job type is required' }),
        company_name: zod_1.z.string({ required_error: 'Company name is required' }),
        company_website: zod_1.z.string().url().optional(),
        company_email: zod_1.z.string().email().optional(),
        company_phone: zod_1.z.string().optional(),
        company_address: zod_1.z.string().optional(),
        experience_min: zod_1.z
            .string()
            .optional()
            .transform((str) => (str ? parseInt(str, 10) : undefined))
            .refine((val) => val === undefined || (Number.isInteger(val) && val >= 0), {
            message: 'Experience min must be a non-negative integer',
        }),
        salary_min: zod_1.z
            .string()
            .optional()
            .transform((str) => (str ? parseInt(str, 10) : undefined))
            .refine((val) => val === undefined || (Number.isInteger(val) && val >= 0), {
            message: 'Salary min must be a non-negative integer',
        }),
        salary_max: zod_1.z
            .string()
            .optional()
            .transform((str) => (str ? parseInt(str, 10) : undefined))
            .refine((val) => val === undefined || (Number.isInteger(val) && val >= 0), {
            message: 'Salary max must be a non-negative integer',
        }),
        deadline: zod_1.z.string().transform((str) => new Date(str)),
        apply_link: zod_1.z.string({ required_error: 'Apply link is required' }).url(),
        number_of_vacancies: zod_1.z
            .string()
            .optional()
            .transform((str) => (str ? parseInt(str, 10) : undefined))
            .refine((val) => val === undefined || (Number.isInteger(val) && val >= 1), {
            message: 'Number of vacancies must be at least 1',
        }),
    }),
});
const UpdateJobSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        kind: zod_1.z.nativeEnum(client_1.JobKind).optional(),
        type: zod_1.z.nativeEnum(client_1.JobType).optional(),
        company_name: zod_1.z.string().optional(),
        company_website: zod_1.z.string().url().optional(),
        company_email: zod_1.z.string().email().optional(),
        company_phone: zod_1.z.string().optional(),
        company_address: zod_1.z.string().optional(),
        experience_min: zod_1.z
            .string()
            .optional()
            .transform((str) => (str ? parseInt(str, 10) : undefined))
            .refine((val) => val === undefined || (Number.isInteger(val) && val >= 0), {
            message: 'Experience min must be a non-negative integer',
        }),
        salary_min: zod_1.z
            .string()
            .optional()
            .transform((str) => (str ? parseInt(str, 10) : undefined))
            .refine((val) => val === undefined || (Number.isInteger(val) && val >= 0), {
            message: 'Salary min must be a non-negative integer',
        }),
        salary_max: zod_1.z
            .string()
            .optional()
            .transform((str) => (str ? parseInt(str, 10) : undefined))
            .refine((val) => val === undefined || (Number.isInteger(val) && val >= 0), {
            message: 'Salary max must be a non-negative integer',
        }),
        deadline: zod_1.z
            .string()
            .transform((str) => new Date(str))
            .optional(),
        apply_link: zod_1.z.string().url().optional(),
        number_of_vacancies: zod_1.z
            .string()
            .optional()
            .transform((str) => (str ? parseInt(str, 10) : undefined))
            .refine((val) => val === undefined || (Number.isInteger(val) && val >= 1), {
            message: 'Number of vacancies must be at least 1',
        }),
    }),
});
const JobValidation = {
    CreateJobSchema,
    UpdateJobSchema,
};
exports.default = JobValidation;

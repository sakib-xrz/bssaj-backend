import { z } from 'zod';
import { JobKind, JobType } from '@prisma/client';

const CreateJobSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    description: z.string({ required_error: 'Description is required' }),
    kind: z.nativeEnum(JobKind, { required_error: 'Job kind is required' }),
    type: z.nativeEnum(JobType, { required_error: 'Job type is required' }),
    company_name: z.string({ required_error: 'Company name is required' }),
    company_website: z.string().url().optional(),
    company_email: z.string().email().optional(),
    company_phone: z.string().optional(),
    company_address: z.string().optional(),
    experience_min: z
      .string()
      .optional()
      .transform((str) => (str ? parseInt(str, 10) : undefined))
      .refine(
        (val) => val === undefined || (Number.isInteger(val) && val >= 0),
        {
          message: 'Experience min must be a non-negative integer',
        },
      ),
    salary_min: z
      .string()
      .optional()
      .transform((str) => (str ? parseInt(str, 10) : undefined))
      .refine(
        (val) => val === undefined || (Number.isInteger(val) && val >= 0),
        {
          message: 'Salary min must be a non-negative integer',
        },
      ),
    salary_max: z
      .string()
      .optional()
      .transform((str) => (str ? parseInt(str, 10) : undefined))
      .refine(
        (val) => val === undefined || (Number.isInteger(val) && val >= 0),
        {
          message: 'Salary max must be a non-negative integer',
        },
      ),
    deadline: z.string().transform((str) => new Date(str)),
    apply_link: z.string({ required_error: 'Apply link is required' }).url(),
    number_of_vacancies: z
      .string()
      .optional()
      .transform((str) => (str ? parseInt(str, 10) : undefined))
      .refine(
        (val) => val === undefined || (Number.isInteger(val) && val >= 1),
        {
          message: 'Number of vacancies must be at least 1',
        },
      ),
  }),
});

const UpdateJobSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    kind: z.nativeEnum(JobKind).optional(),
    type: z.nativeEnum(JobType).optional(),
    company_name: z.string().optional(),
    company_website: z.string().url().optional(),
    company_email: z.string().email().optional(),
    company_phone: z.string().optional(),
    company_address: z.string().optional(),
    experience_min: z
      .string()
      .optional()
      .transform((str) => (str ? parseInt(str, 10) : undefined))
      .refine(
        (val) => val === undefined || (Number.isInteger(val) && val >= 0),
        {
          message: 'Experience min must be a non-negative integer',
        },
      ),
    salary_min: z
      .string()
      .optional()
      .transform((str) => (str ? parseInt(str, 10) : undefined))
      .refine(
        (val) => val === undefined || (Number.isInteger(val) && val >= 0),
        {
          message: 'Salary min must be a non-negative integer',
        },
      ),
    salary_max: z
      .string()
      .optional()
      .transform((str) => (str ? parseInt(str, 10) : undefined))
      .refine(
        (val) => val === undefined || (Number.isInteger(val) && val >= 0),
        {
          message: 'Salary max must be a non-negative integer',
        },
      ),
    deadline: z
      .string()
      .transform((str) => new Date(str))
      .optional(),
    apply_link: z.string().url().optional(),
    number_of_vacancies: z
      .string()
      .optional()
      .transform((str) => (str ? parseInt(str, 10) : undefined))
      .refine(
        (val) => val === undefined || (Number.isInteger(val) && val >= 1),
        {
          message: 'Number of vacancies must be at least 1',
        },
      ),
  }),
});

const JobValidation = {
  CreateJobSchema,
  UpdateJobSchema,
};

export default JobValidation;

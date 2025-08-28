import { z } from 'zod';

const CreateScholarshipSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    description: z.string({ required_error: 'Description is required' }),
    eligibility: z.string().optional(),
    provider: z.string().optional(),
    amount: z.number().optional(),
    deadline: z.string({ required_error: 'Deadline is required' }),
    application_url: z
      .string({ required_error: 'Application URL is required' })
      .url('Must be a valid URL'),
  }),
});

const UpdateScholarshipSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    eligibility: z.string().optional(),
    provider: z.string().optional(),
    amount: z.number().optional(),
    deadline: z.string().optional(),
    application_url: z.string().url('Must be a valid URL').optional(),
  }),
});

export const ScholarshipValidation = {
  CreateScholarshipSchema,
  UpdateScholarshipSchema,
};

import { z } from 'zod';

export const CreateCommitteeSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    designation: z.string({ required_error: 'Designation is required' }),
    term_start_year: z.string({
      required_error: 'Term start year is required',
    }),
    term_end_year: z.string({ required_error: 'Term end year is required' }),
  }),
});

export const UpdateCommitteeSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    designation: z.string().optional(),
    term_start_year: z.string().optional(),
    term_end_year: z.string().optional(),
  }),
});

const CommitteeValidation = {
  CreateCommitteeSchema,
  UpdateCommitteeSchema,
};

export default CommitteeValidation;

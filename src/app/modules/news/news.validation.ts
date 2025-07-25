import { z } from 'zod';

const CreateNewsSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    content: z.string({ required_error: 'Content is required' }),
  }),
});

const UpdateNewsSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
  }),
});

const NewsValidation = {
  CreateNewsSchema,
  UpdateNewsSchema,
};

export default NewsValidation;

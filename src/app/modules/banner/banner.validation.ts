import { z } from 'zod';

const CreateBannerSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    description: z.string({ required_error: 'Description is required' }),
    link: z
      .string({ required_error: 'Link is required' })
      .url('Invalid URL format'),
  }),
});

const UpdateBannerSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    link: z.string().url('Invalid URL format').optional(),
  }),
});

const BannerValidation = {
  CreateBannerSchema,
  UpdateBannerSchema,
};

export default BannerValidation;

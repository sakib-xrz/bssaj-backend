import { z } from 'zod';

const CreateGallerySchema = z.object({
  body: z.object({
    title: z.string().optional(),
    link: z.string().url('Invalid URL format').optional(),
  }),
});

const UpdateGallerySchema = z.object({
  body: z.object({
    title: z.string().optional(),
    link: z.string().url('Invalid URL format').optional(),
  }),
});

const GalleryValidation = {
  CreateGallerySchema,
  UpdateGallerySchema,
};

export default GalleryValidation;

import { z } from 'zod';

const CreateBlogSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    content: z.string({ required_error: 'Content is required' }),
    author_id: z.string({ required_error: 'Author ID is required' }),
  }),
});

const UpdateBlogSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    author_id: z.string().optional(),
    is_published: z.boolean().optional(),
  }),
});

const BlogValidation = {
  CreateBlogSchema,
  UpdateBlogSchema,
};

export default BlogValidation;

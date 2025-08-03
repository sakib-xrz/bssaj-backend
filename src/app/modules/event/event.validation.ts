import { z } from 'zod';

const CreateEventSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    description: z.string({ required_error: 'Description is required' }),
    location: z.string({ required_error: 'Location is required' }),
    event_date: z.string({ required_error: 'Event date is required' }),
  }),
});

const UpdateEventSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    event_date: z.string().optional(),
  }),
});

export const EventValidation = {
  CreateEventSchema,
  UpdateEventSchema,
};

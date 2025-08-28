import { z } from 'zod';

const CreateConsultationSchema = z.object({
  body: z.object({
    kind: z.enum(
      [
        'ACADEMIC_CONSULTATION',
        'CAREER_CONSULTATION',
        'VISA_AND_IMMIGRATION_CONSULTATION',
        'PERSONAL_CONSULTATION',
      ],
      {
        required_error: 'Consultation kind is required',
      },
    ),
    name: z.string({ required_error: 'Name is required' }),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Must be a valid email'),
    phone: z.string({ required_error: 'Phone is required' }),
    message: z.string({ required_error: 'Message is required' }),
  }),
});

const UpdateConsultationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'RESOLVED', 'CANCELLED'], {
      required_error: 'Status is required',
    }),
  }),
});

const ConsultationValidation = {
  CreateConsultationSchema,
  UpdateConsultationStatusSchema,
};

export default ConsultationValidation;

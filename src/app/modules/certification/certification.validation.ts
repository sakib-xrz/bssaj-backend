import { z } from 'zod';

const CreateCertificationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    date_of_birth: z.string({ required_error: 'Date of birth is required' }),
    gender: z.string({ required_error: 'Gender is required' }),
    father_name: z.string({ required_error: 'Father name is required' }),
    mother_name: z.string({ required_error: 'Mother name is required' }),
    student_id: z.string({ required_error: 'Student ID is required' }),
    completed_hours: z.string({
      required_error: 'Completed hours is required',
    }),
    grade: z.string({ required_error: 'Grade is required' }),
    course_duration: z.string({
      required_error: 'Course duration is required',
    }),
    issued_at: z.string({ required_error: 'Issued date is required' }),
    institute_name: z.string({ required_error: 'Institute name is required' }),
    agency_id: z.string({ required_error: 'Agency ID is required' }),
  }),
});

const UpdateCertificationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    date_of_birth: z.string().optional(),
    gender: z.string().optional(),
    father_name: z.string().optional(),
    mother_name: z.string().optional(),
    student_id: z.string().optional(),
    completed_hours: z.string().optional(),
    grade: z.string().optional(),
    course_duration: z.string().optional(),
    issued_at: z.string().optional(),
    institute_name: z.string().optional(),
    agency_id: z.string().optional(),
  }),
});

const CertificationValidation = {
  CreateCertificationSchema,
  UpdateCertificationSchema,
};

export default CertificationValidation;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const CreateCertificationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'Name is required' }),
        date_of_birth: zod_1.z.string({ required_error: 'Date of birth is required' }),
        gender: zod_1.z.string({ required_error: 'Gender is required' }),
        father_name: zod_1.z.string({ required_error: 'Father name is required' }),
        mother_name: zod_1.z.string({ required_error: 'Mother name is required' }),
        student_id: zod_1.z.string({ required_error: 'Student ID is required' }),
        completed_hours: zod_1.z.string({
            required_error: 'Completed hours is required',
        }),
        grade: zod_1.z.string({ required_error: 'Grade is required' }),
        course_duration: zod_1.z.string({
            required_error: 'Course duration is required',
        }),
        issued_at: zod_1.z.string({ required_error: 'Issued date is required' }),
        institute_name: zod_1.z.string({ required_error: 'Institute name is required' }),
        agency_id: zod_1.z.string({ required_error: 'Agency ID is required' }),
    }),
});
const UpdateCertificationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        date_of_birth: zod_1.z.string().optional(),
        gender: zod_1.z.string().optional(),
        father_name: zod_1.z.string().optional(),
        mother_name: zod_1.z.string().optional(),
        student_id: zod_1.z.string().optional(),
        completed_hours: zod_1.z.string().optional(),
        grade: zod_1.z.string().optional(),
        course_duration: zod_1.z.string().optional(),
        issued_at: zod_1.z.string().optional(),
        institute_name: zod_1.z.string().optional(),
        agency_id: zod_1.z.string().optional(),
    }),
});
const CertificationValidation = {
    CreateCertificationSchema,
    UpdateCertificationSchema,
};
exports.default = CertificationValidation;

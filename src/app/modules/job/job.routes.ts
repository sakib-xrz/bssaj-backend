import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { JobController } from './job.controller';
import JobValidation from './job.validation';
import { upload } from '../../utils/handelFile';

const router = Router();

router
  .route('/')
  .post(
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY),
    upload.single('company_logo'),
    validateRequest(JobValidation.CreateJobSchema),
    JobController.CreateJob,
  )
  .get(JobController.GetAllJobs);

router.get(
  '/my-jobs',
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY),
  JobController.GetMyJobs,
);

router
  .route('/:id')
  .get(JobController.GetSingleJob)
  .patch(
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY),
    upload.single('company_logo'),
    validateRequest(JobValidation.UpdateJobSchema),
    JobController.UpdateJob,
  )
  .delete(
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY),
    JobController.DeleteJob,
  );

export const JobRouter = router;

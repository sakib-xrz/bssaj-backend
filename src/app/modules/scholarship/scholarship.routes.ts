import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ScholarshipController } from './scholarship.controller';
import { ScholarshipValidation } from './scholarship.validation';

const router = Router();

router
  .route('/')
  .post(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    validateRequest(ScholarshipValidation.CreateScholarshipSchema),
    ScholarshipController.CreateScholarship,
  )
  .get(ScholarshipController.GetAllScholarships);

router
  .route('/:id')
  .get(ScholarshipController.GetScholarshipById)
  .patch(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    validateRequest(ScholarshipValidation.UpdateScholarshipSchema),
    ScholarshipController.UpdateScholarship,
  )
  .delete(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    ScholarshipController.DeleteScholarship,
  );

export const ScholarshipRouter = router;

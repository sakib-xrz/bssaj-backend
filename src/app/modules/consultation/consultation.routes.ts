import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ConsultationController } from './consultation.controller';
import ConsultationValidation from './consultation.validation';

const router = Router();

router
  .route('/')
  .post(
    validateRequest(ConsultationValidation.CreateConsultationSchema),
    ConsultationController.CreateConsultation,
  )
  .get(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    ConsultationController.GetAllConsultation,
  );

router
  .route('/:id/status')
  .patch(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    validateRequest(ConsultationValidation.UpdateConsultationStatusSchema),
    ConsultationController.UpdateConsultationStatus,
  );

router
  .route('/:id')
  .get(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    ConsultationController.GetConsultationById,
  )
  .delete(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    ConsultationController.DeleteConsultation,
  );

export const ConsultationRouter = router;

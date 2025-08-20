import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AgencyController } from './agency.controller';
import {
  agencySchema,
  agencyUpdateSchema,
  successStoryCreateSchema,
} from './agency.validation';
import { upload } from '../../utils/handelFile';

const router = Router();

router
  .route('/')
  .post(
    upload.any(),
    validateRequest(agencySchema),
    AgencyController.CreateAgency,
  )
  .get(AgencyController.GetAllAgency);

router.route('/stats').get(AgencyController.GetAgencyStats);

router.patch(
  '/check-expired-subscriptions',
  auth(Role.SUPER_ADMIN, Role.ADMIN),
  AgencyController.CheckExpiredSubscriptions,
);

router.route('/my-agency').get(auth(Role.AGENCY), AgencyController.GetMyAgency);

// Success Stories routes
router
  .route('/success-stories')
  .post(
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY),
    upload.array('images'),
    validateRequest(successStoryCreateSchema),
    AgencyController.UploadSuccessStory,
  );

router
  .route('/success-stories/:id')
  .patch(
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY),
    upload.single('image'),
    AgencyController.ReplaceSuccessStory,
  )
  .delete(
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY),
    AgencyController.DeleteSuccessStory,
  );

router
  .route('/:id')
  .get(AgencyController.GetSingleAgency)
  .patch(
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY),
    upload.any(),
    validateRequest(agencyUpdateSchema),
    AgencyController.UpdateAgency,
  )
  .delete(auth(Role.SUPER_ADMIN, Role.ADMIN), AgencyController.DeleteAgency);

export const AgencyRouter = router;

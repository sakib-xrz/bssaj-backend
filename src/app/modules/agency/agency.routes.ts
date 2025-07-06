import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AgencyController } from './agency.controller';
import { agencySchema, agencyUpdateSchema } from './agency.validation';
import { upload } from '../../utils/handelFile';

const router = Router();

router
  .route('/')
  .post(
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.USER),
    upload.any(),
    validateRequest(agencySchema),
    AgencyController.CreateAgency,
  )
  .get(AgencyController.GetAllAgency);

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

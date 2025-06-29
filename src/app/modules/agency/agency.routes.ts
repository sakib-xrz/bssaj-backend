import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AgencyController } from './agency.controller';
import { agencySchema } from './agency.validation';

const router = Router();

router
  .route('/')
  .post(
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.USER),
    validateRequest(agencySchema),
    AgencyController.CreateAgency,
  )
  .get(AgencyController.GetAllAgency);

router
  .route('/:id')
  .get(AgencyController.GetSingleAgency)
  .patch(
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY),
    AgencyController.UpdateAgency,
  )
  .delete(auth(Role.SUPER_ADMIN, Role.ADMIN), AgencyController.DeleteAgency);

export const AgencyRouter = router;

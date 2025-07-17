import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import CommitteeValidation from './committee.validation';
import CommitteeController from './committee.controller';
import { upload } from '../../utils/handelFile';

const router = Router();

router
  .route('/')
  .post(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    upload.single('profile_picture'),
    validateRequest(CommitteeValidation.CreateCommitteeSchema),
    CommitteeController.CreateCommittee,
  )
  .get(CommitteeController.GetAllCommittee);

router.get('/years', CommitteeController.GetUniqueTermPairs);

router
  .route('/:id')
  .get(CommitteeController.SingleCommittee)
  .patch(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    upload.single('profile_picture'),
    validateRequest(CommitteeValidation.UpdateCommitteeSchema),
    CommitteeController.UpdateCommittee,
  )
  .delete(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    CommitteeController.DeleteCommittee,
  );

export const CommitteeRouter = router;

import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { MembersController } from './member.controller';
import memberSchema from './member.validation';

const router = Router();

router
  .route('/')
  .post(
    auth(Role.USER),
    validateRequest(memberSchema),
    MembersController.CreateMember,
  )
  .get(MembersController.GetAllMember);

router
  .route('/:id')
  .get(MembersController.SingleMember)
  .patch(auth(Role.ADMIN, Role.AGENCY), MembersController.UpdateMember)
  .delete(auth(Role.ADMIN), MembersController.DeleteMember);

export const MemberRouter = router;

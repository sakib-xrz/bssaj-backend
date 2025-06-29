import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { MembersController } from './member.controller';
import { memberSchema, memberUpdateSchema } from './member.validation';

const router = Router();

router
  .route('/')
  .post(
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.USER),
    validateRequest(memberSchema),
    MembersController.CreateMember,
  )
  .get(MembersController.GetAllMember);

router
  .route('/:id')
  .get(MembersController.SingleMember)
  .patch(
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY),
    validateRequest(memberUpdateSchema),
    MembersController.UpdateMember,
  )
  .put(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    MembersController.ApprovedOrRejectMember,
  )
  .delete(auth(Role.SUPER_ADMIN, Role.ADMIN), MembersController.DeleteMember);

export const MemberRouter = router;

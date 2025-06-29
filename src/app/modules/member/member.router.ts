import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { MembersController } from './member.controller';
import { MemberValidation } from './member.validation';


const router = Router();

router
  .route('/')
  .post(
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.USER),
    validateRequest(MemberValidation.memberValidation),
    MembersController.CreateMember,
  )
  .get(MembersController.GetAllMember);

router
  .route('/:id')
  .get(MembersController.SingleMember)
  .patch(
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY),
    validateRequest(MemberValidation.updateMemberValidation),
    MembersController.UpdateMember,
  )
  .delete(auth(Role.SUPER_ADMIN, Role.ADMIN), MembersController.DeleteMember);

export const MemberRouter = router;

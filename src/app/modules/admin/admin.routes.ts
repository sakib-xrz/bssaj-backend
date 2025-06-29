import { Role } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth';
import { AdminController } from './admin.controller';

const router = express.Router();

router.put('/approve-reject-member', auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY), AdminController.ApprovedOrRejectMember);
router.put('/approve-reject-agency', auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY), AdminController.ApprovedOrRejectAgency);
router.put('/approve-reject-blog', auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY), AdminController.ApprovedOrRejectBlog);

export const AdminRoute = router;
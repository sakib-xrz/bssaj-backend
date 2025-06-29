import express from 'express';
import { AdminController } from './admin.controller';

const router = express.Router();

router.put('/approve-reject-member', AdminController.ApprovedOrRejectMember);
router.put('/approve-reject-agency', AdminController.ApprovedOrRejectAgency);
router.put('/approve-reject-blog', AdminController.ApprovedOrRejectAgency);

export const AdminRoute = router;
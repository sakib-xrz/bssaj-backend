import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentController } from './payment.controller';
import {
  createPaymentSchema,
  updatePaymentSchema,
  approvePaymentSchema,
  bulkCreatePaymentSchema,
} from './payment.validation';

const router = Router();

// Payment statistics (admin only)
router
  .route('/stats')
  .get(auth(Role.SUPER_ADMIN, Role.ADMIN), PaymentController.GetPaymentStats);

// Bulk operations (admin only)
router
  .route('/bulk-create')
  .post(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    validateRequest(bulkCreatePaymentSchema),
    PaymentController.BulkCreatePayments,
  );

// Mark overdue payments (admin only)
router
  .route('/mark-overdue')
  .patch(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    PaymentController.MarkOverduePayments,
  );

// Agency-specific payments
router
  .route('/agency/:agencyId')
  .get(
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY),
    PaymentController.GetAgencyPayments,
  );

// Agency payment summary
router
  .route('/agency/:agencyId/summary')
  .get(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    PaymentController.GetAgencyPaymentSummary,
  );

// Payment approval
router
  .route('/:id/approve')
  .patch(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    validateRequest(approvePaymentSchema),
    PaymentController.ApprovePayment,
  );

// Main payment routes
router
  .route('/')
  .post(
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY),
    validateRequest(createPaymentSchema),
    PaymentController.CreatePayment,
  )
  .get(auth(Role.SUPER_ADMIN, Role.ADMIN), PaymentController.GetAllPayments);

router
  .route('/:id')
  .get(
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENCY),
    PaymentController.GetSinglePayment,
  )
  .patch(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    validateRequest(updatePaymentSchema),
    PaymentController.UpdatePayment,
  )
  .delete(auth(Role.SUPER_ADMIN, Role.ADMIN), PaymentController.DeletePayment);

export const PaymentRouter = router;

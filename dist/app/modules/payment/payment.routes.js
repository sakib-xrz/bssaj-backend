"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const payment_controller_1 = require("./payment.controller");
const payment_validation_1 = require("./payment.validation");
const router = (0, express_1.Router)();
// Payment statistics (admin only)
router
    .route('/stats')
    .get((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), payment_controller_1.PaymentController.GetPaymentStats);
// Bulk operations (admin only)
router
    .route('/bulk-create')
    .post((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), (0, validateRequest_1.default)(payment_validation_1.bulkCreatePaymentSchema), payment_controller_1.PaymentController.BulkCreatePayments);
// Mark overdue payments (admin only)
router
    .route('/mark-overdue')
    .patch((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), payment_controller_1.PaymentController.MarkOverduePayments);
// Agency-specific payments
router
    .route('/agency/:agencyId')
    .get((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY), payment_controller_1.PaymentController.GetAgencyPayments);
// Agency payment summary
router
    .route('/agency/:agencyId/summary')
    .get((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), payment_controller_1.PaymentController.GetAgencyPaymentSummary);
// Payment approval
router
    .route('/:id/approve')
    .patch((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), (0, validateRequest_1.default)(payment_validation_1.approvePaymentSchema), payment_controller_1.PaymentController.ApprovePayment);
// Main payment routes
router
    .route('/')
    .post((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY), (0, validateRequest_1.default)(payment_validation_1.createPaymentSchema), payment_controller_1.PaymentController.CreatePayment)
    .get((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), payment_controller_1.PaymentController.GetAllPayments);
router
    .route('/:id')
    .get((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY), payment_controller_1.PaymentController.GetSinglePayment)
    .patch((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), (0, validateRequest_1.default)(payment_validation_1.updatePaymentSchema), payment_controller_1.PaymentController.UpdatePayment)
    .delete((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), payment_controller_1.PaymentController.DeletePayment);
exports.PaymentRouter = router;

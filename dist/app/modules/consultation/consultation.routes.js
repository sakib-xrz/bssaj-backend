"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultationRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const consultation_controller_1 = require("./consultation.controller");
const consultation_validation_1 = __importDefault(require("./consultation.validation"));
const router = (0, express_1.Router)();
router
    .route('/')
    .post((0, validateRequest_1.default)(consultation_validation_1.default.CreateConsultationSchema), consultation_controller_1.ConsultationController.CreateConsultation)
    .get((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), consultation_controller_1.ConsultationController.GetAllConsultation);
router
    .route('/:id/status')
    .patch((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), (0, validateRequest_1.default)(consultation_validation_1.default.UpdateConsultationStatusSchema), consultation_controller_1.ConsultationController.UpdateConsultationStatus);
router
    .route('/:id')
    .get((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), consultation_controller_1.ConsultationController.GetConsultationById)
    .delete((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), consultation_controller_1.ConsultationController.DeleteConsultation);
exports.ConsultationRouter = router;

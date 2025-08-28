"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScholarshipRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const scholarship_controller_1 = require("./scholarship.controller");
const scholarship_validation_1 = require("./scholarship.validation");
const router = (0, express_1.Router)();
router
    .route('/')
    .post((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), (0, validateRequest_1.default)(scholarship_validation_1.ScholarshipValidation.CreateScholarshipSchema), scholarship_controller_1.ScholarshipController.CreateScholarship)
    .get(scholarship_controller_1.ScholarshipController.GetAllScholarships);
router
    .route('/:id')
    .get(scholarship_controller_1.ScholarshipController.GetScholarshipById)
    .patch((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), (0, validateRequest_1.default)(scholarship_validation_1.ScholarshipValidation.UpdateScholarshipSchema), scholarship_controller_1.ScholarshipController.UpdateScholarship)
    .delete((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), scholarship_controller_1.ScholarshipController.DeleteScholarship);
exports.ScholarshipRouter = router;

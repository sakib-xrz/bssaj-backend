"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificationRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const certification_controller_1 = require("./certification.controller");
const certification_validation_1 = __importDefault(require("./certification.validation"));
const handelFile_1 = require("../../utils/handelFile");
const router = (0, express_1.Router)();
// Verify certificate endpoint (public)
router.get('/verify/:sl_no', certification_controller_1.CertificationController.VerifyCertification);
// Get certifications by agency
router.get('/agency/:agency_id', (0, auth_1.default)(client_1.Role.AGENCY), certification_controller_1.CertificationController.GetCertificationsByAgency);
// Get my all agencies certifications list
router.get('/my-agencies', (0, auth_1.default)(client_1.Role.AGENCY), certification_controller_1.CertificationController.GetMyAgenciesCertifications);
router
    .route('/')
    .post((0, auth_1.default)(client_1.Role.AGENCY), handelFile_1.upload.single('certificate_file'), (0, validateRequest_1.default)(certification_validation_1.default.CreateCertificationSchema), certification_controller_1.CertificationController.CreateCertification)
    .get(certification_controller_1.CertificationController.GetAllCertification);
router
    .route('/:id')
    .get(certification_controller_1.CertificationController.GetSingleCertification)
    .patch((0, auth_1.default)(client_1.Role.AGENCY), handelFile_1.upload.single('certificate_file'), (0, validateRequest_1.default)(certification_validation_1.default.UpdateCertificationSchema), certification_controller_1.CertificationController.UpdateCertification)
    .delete((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), certification_controller_1.CertificationController.DeleteCertification);
exports.CertificationRouter = router;

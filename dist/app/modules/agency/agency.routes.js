"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgencyRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const agency_controller_1 = require("./agency.controller");
const agency_validation_1 = require("./agency.validation");
const handelFile_1 = require("../../utils/handelFile");
const router = (0, express_1.Router)();
router
    .route('/')
    .post((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.USER), handelFile_1.upload.any(), (0, validateRequest_1.default)(agency_validation_1.agencySchema), agency_controller_1.AgencyController.CreateAgency)
    .get(agency_controller_1.AgencyController.GetAllAgency);
router.route('/stats').get(agency_controller_1.AgencyController.GetAgencyStats);
router
    .route('/:id')
    .get(agency_controller_1.AgencyController.GetSingleAgency)
    .patch((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY), handelFile_1.upload.any(), (0, validateRequest_1.default)(agency_validation_1.agencyUpdateSchema), agency_controller_1.AgencyController.UpdateAgency)
    .delete((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), agency_controller_1.AgencyController.DeleteAgency);
exports.AgencyRouter = router;

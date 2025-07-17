"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommitteeRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const committee_validation_1 = __importDefault(require("./committee.validation"));
const committee_controller_1 = __importDefault(require("./committee.controller"));
const handelFile_1 = require("../../utils/handelFile");
const router = (0, express_1.Router)();
router
    .route('/')
    .post((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), handelFile_1.upload.single('profile_picture'), (0, validateRequest_1.default)(committee_validation_1.default.CreateCommitteeSchema), committee_controller_1.default.CreateCommittee)
    .get(committee_controller_1.default.GetAllCommittee);
router.get('/years', committee_controller_1.default.GetUniqueTermPairs);
router
    .route('/:id')
    .get(committee_controller_1.default.SingleCommittee)
    .patch((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), handelFile_1.upload.single('profile_picture'), (0, validateRequest_1.default)(committee_validation_1.default.UpdateCommitteeSchema), committee_controller_1.default.UpdateCommittee)
    .delete((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), committee_controller_1.default.DeleteCommittee);
exports.CommitteeRouter = router;

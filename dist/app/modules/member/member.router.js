"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const member_controller_1 = require("./member.controller");
const member_validation_1 = require("./member.validation");
const router = (0, express_1.Router)();
router
    .route('/')
    .post((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.STUDENT), (0, validateRequest_1.default)(member_validation_1.MemberValidation.memberValidation), member_controller_1.MembersController.CreateMember)
    .get(member_controller_1.MembersController.GetAllMember);
router.get('/stats', (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), member_controller_1.MembersController.GetMemberStats);
router.get('/me', (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY, client_1.Role.STUDENT), member_controller_1.MembersController.GetMyMember);
router.get('/member-id/:member_id', member_controller_1.MembersController.SingleMemberByMemberId);
router
    .route('/:id')
    .get(member_controller_1.MembersController.SingleMember)
    .patch((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY), (0, validateRequest_1.default)(member_validation_1.MemberValidation.updateMemberValidation), member_controller_1.MembersController.UpdateMember)
    .delete((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), member_controller_1.MembersController.DeleteMember);
exports.MemberRouter = router;

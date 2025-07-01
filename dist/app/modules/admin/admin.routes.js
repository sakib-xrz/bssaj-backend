"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoute = void 0;
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const admin_controller_1 = require("./admin.controller");
const router = express_1.default.Router();
router.put('/approve-reject-member/:id', (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY), admin_controller_1.AdminController.ApprovedOrRejectMember);
router.put('/approve-reject-agency/:id', (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY), admin_controller_1.AdminController.ApprovedOrRejectAgency);
router.put('/approve-reject-blog/:id', (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY), admin_controller_1.AdminController.ApprovedOrRejectBlog);
exports.AdminRoute = router;

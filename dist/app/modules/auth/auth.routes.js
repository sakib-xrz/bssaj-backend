"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_controller_1 = __importDefault(require("./auth.controller"));
const auth_validation_1 = __importDefault(require("./auth.validation"));
const router = express_1.default.Router();
router.post('/register', auth_controller_1.default.Register);
router.post('/login', (0, validateRequest_1.default)(auth_validation_1.default.LoginSchema), auth_controller_1.default.Login);
router.patch('/change-password', (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY, client_1.Role.STUDENT, client_1.Role.USER), (0, validateRequest_1.default)(auth_validation_1.default.ChangePasswordSchema), auth_controller_1.default.ChangePassword);
router.get('/me', (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY, client_1.Role.STUDENT, client_1.Role.USER), auth_controller_1.default.GetMyProfile);
exports.AuthRoutes = router;

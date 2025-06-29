"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoute = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.get('/', (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), user_controller_1.UserController.GetAllUser);
router.get('/search', (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), user_controller_1.UserController.SearchUser);
router.post('/', (0, auth_1.default)(client_1.Role.SUPER_ADMIN), user_controller_1.UserController.CreateUser);
router.patch('/:id', (0, auth_1.default)(client_1.Role.SUPER_ADMIN), user_controller_1.UserController.UpdateUser);
router.delete('/:id', (0, auth_1.default)(client_1.Role.SUPER_ADMIN), user_controller_1.UserController.DeleteUser);
exports.UserRoute = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = require("../modules/auth/auth.routes");
const router = express_1.default.Router();
const routes = [{ path: '/auth', route: auth_routes_1.AuthRoutes }];
routes.forEach((route) => {
    router.use(route.path, route.route);
});
exports.default = router;

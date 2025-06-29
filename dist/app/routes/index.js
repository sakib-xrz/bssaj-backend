"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const agency_routes_1 = require("../modules/agency/agency.routes");
const auth_routes_1 = require("../modules/auth/auth.routes");
const member_router_1 = require("../modules/member/member.router");
const user_routes_1 = require("../modules/user/user.routes");
const router = express_1.default.Router();
const routes = [
    { path: '/auth', route: auth_routes_1.AuthRoutes },
    { path: '/members', route: member_router_1.MemberRouter },
    { path: '/agencies', route: agency_routes_1.AgencyRouter },
    { path: '/users', route: user_routes_1.UserRoute },
];
routes.forEach((route) => {
    router.use(route.path, route.route);
});
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const news_controller_1 = require("./news.controller");
const news_validation_1 = __importDefault(require("./news.validation"));
const router = (0, express_1.Router)();
router
    .route('/')
    .post((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), (0, validateRequest_1.default)(news_validation_1.default.CreateNewsSchema), news_controller_1.NewsController.CreateNews)
    .get(news_controller_1.NewsController.GetAllNews);
router
    .route('/:id')
    .get(news_controller_1.NewsController.GetSingleNews)
    .patch((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), (0, validateRequest_1.default)(news_validation_1.default.UpdateNewsSchema), news_controller_1.NewsController.UpdateNews)
    .delete((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), news_controller_1.NewsController.DeleteNews);
exports.NewsRouter = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const blog_controller_1 = require("./blog.controller");
const blog_validation_1 = require("./blog.validation");
const router = (0, express_1.Router)();
router
    .route('/')
    .post((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.USER, client_1.Role.USER), (0, validateRequest_1.default)(blog_validation_1.BlogValidatoin.blogValidation), blog_controller_1.BlogController.CreateBlog)
    .get(blog_controller_1.BlogController.GetAllBlog);
router
    .route('/:id')
    .get(blog_controller_1.BlogController.GetSingleBlog)
    .patch((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY, client_1.Role.USER), (0, validateRequest_1.default)(blog_validation_1.BlogValidatoin.updateBlogValidation), blog_controller_1.BlogController.UpdateBlog)
    .delete((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), blog_controller_1.BlogController.DeleteBlog);
exports.BlogRouter = router;

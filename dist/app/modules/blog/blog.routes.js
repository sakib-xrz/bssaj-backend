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
const blog_validation_1 = __importDefault(require("./blog.validation"));
const handelFile_1 = require("../../utils/handelFile");
const router = (0, express_1.Router)();
router
    .route('/')
    .post((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY, client_1.Role.STUDENT, client_1.Role.USER), handelFile_1.upload.single('cover_image'), (0, validateRequest_1.default)(blog_validation_1.default.CreateBlogSchema), blog_controller_1.BlogController.CreateBlog)
    .get(blog_controller_1.BlogController.GetAllBlog);
router.get('/my-blogs', (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY, client_1.Role.STUDENT, client_1.Role.USER), blog_controller_1.BlogController.GetMyBlogs);
router
    .route('/:id')
    .get(blog_controller_1.BlogController.GetSingleBlog)
    .patch((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY, client_1.Role.STUDENT, client_1.Role.USER), handelFile_1.upload.single('cover_image'), // ADDED: File upload middleware for updates
(0, validateRequest_1.default)(blog_validation_1.default.UpdateBlogSchema), blog_controller_1.BlogController.UpdateBlog)
    .delete((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY, client_1.Role.STUDENT, client_1.Role.USER), blog_controller_1.BlogController.DeleteBlog);
exports.BlogRouter = router;

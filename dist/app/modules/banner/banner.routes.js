"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const banner_controller_1 = require("./banner.controller");
const banner_validation_1 = __importDefault(require("./banner.validation"));
const handelFile_1 = require("../../utils/handelFile");
const router = (0, express_1.Router)();
router
    .route('/')
    .post((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), handelFile_1.upload.single('image'), (0, validateRequest_1.default)(banner_validation_1.default.CreateBannerSchema), banner_controller_1.BannerController.CreateBanner)
    .get(banner_controller_1.BannerController.GetAllBanner);
router
    .route('/:id')
    .get(banner_controller_1.BannerController.GetSingleBanner)
    .patch((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), handelFile_1.upload.single('image'), (0, validateRequest_1.default)(banner_validation_1.default.UpdateBannerSchema), banner_controller_1.BannerController.UpdateBanner)
    .delete((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), banner_controller_1.BannerController.DeleteBanner);
exports.BannerRouter = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const gallery_controller_1 = require("./gallery.controller");
const gallery_validation_1 = __importDefault(require("./gallery.validation"));
const handelFile_1 = require("../../utils/handelFile");
const router = (0, express_1.Router)();
router
    .route('/')
    .post((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), handelFile_1.upload.single('image'), (0, validateRequest_1.default)(gallery_validation_1.default.CreateGallerySchema), gallery_controller_1.GalleryController.CreateGallery)
    .get(gallery_controller_1.GalleryController.GetAllGallery);
router
    .route('/:id')
    .get(gallery_controller_1.GalleryController.GetSingleGallery)
    .patch((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), handelFile_1.upload.single('image'), (0, validateRequest_1.default)(gallery_validation_1.default.UpdateGallerySchema), gallery_controller_1.GalleryController.UpdateGallery)
    .delete((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), gallery_controller_1.GalleryController.DeleteGallery);
exports.GalleryRouter = router;

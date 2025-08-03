"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const event_controller_1 = require("./event.controller");
const event_validation_1 = require("./event.validation");
const handelFile_1 = require("../../utils/handelFile");
const router = (0, express_1.Router)();
router
    .route('/')
    .post((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), handelFile_1.upload.single('cover_image'), (0, validateRequest_1.default)(event_validation_1.EventValidation.CreateEventSchema), event_controller_1.EventController.CreateEvent)
    .get(event_controller_1.EventController.GetAllEvent);
router
    .route('/:id')
    .get(event_controller_1.EventController.GetSingleEvent)
    .patch((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), handelFile_1.upload.single('cover_image'), (0, validateRequest_1.default)(event_validation_1.EventValidation.UpdateEventSchema), event_controller_1.EventController.UpdateEvent)
    .delete((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), event_controller_1.EventController.DeleteEvent);
exports.EventRouter = router;

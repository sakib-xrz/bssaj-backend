"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const job_controller_1 = require("./job.controller");
const job_validation_1 = __importDefault(require("./job.validation"));
const handelFile_1 = require("../../utils/handelFile");
const router = (0, express_1.Router)();
router
    .route('/')
    .post((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY), handelFile_1.upload.single('company_logo'), (0, validateRequest_1.default)(job_validation_1.default.CreateJobSchema), job_controller_1.JobController.CreateJob)
    .get(job_controller_1.JobController.GetAllJobs);
router.get('/my-jobs', (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY), job_controller_1.JobController.GetMyJobs);
router
    .route('/:id')
    .get(job_controller_1.JobController.GetSingleJob)
    .patch((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY), handelFile_1.upload.single('company_logo'), (0, validateRequest_1.default)(job_validation_1.default.UpdateJobSchema), job_controller_1.JobController.UpdateJob)
    .delete((0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AGENCY), job_controller_1.JobController.DeleteJob);
exports.JobRouter = router;

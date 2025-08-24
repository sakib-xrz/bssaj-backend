"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const admin_services_1 = require("./admin.services");
const ApprovedOrRejectMember = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    yield admin_services_1.AdminService.ApprovedOrRejectMember((_a = req.params) === null || _a === void 0 ? void 0 : _a.id, req.body.status, (_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Member status updated successfully',
    });
}));
const ApprovedOrRejectAgency = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const result = yield admin_services_1.AdminService.ApprovedOrRejectAgency((_a = req.params) === null || _a === void 0 ? void 0 : _a.id, req.body.status, (_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Agency status updated Successfully',
        data: result,
    });
}));
const ApprovedOrRejectBlog = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const approvedId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
    const result = yield admin_services_1.AdminService.ApprovedOrRejectBlog(approvedId, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: `Successfully approved the blog.`,
        data: result,
    });
}));
const ApprovedOrRejectJob = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const approvedId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
    const result = yield admin_services_1.AdminService.ApprovedOrRejectJob(approvedId, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: `Successfully processed the job.`,
        data: result,
    });
}));
exports.AdminController = {
    ApprovedOrRejectMember,
    ApprovedOrRejectAgency,
    ApprovedOrRejectBlog,
    ApprovedOrRejectJob,
};

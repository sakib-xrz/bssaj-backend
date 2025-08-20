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
exports.CertificationController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const pick_1 = __importDefault(require("../../utils/pick"));
const certification_service_1 = require("./certification.service");
const CreateCertification = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const result = yield certification_service_1.CertificationService.CreateCertification(req.body, file);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Certification created successfully',
        data: result,
    });
}));
const GetAllCertification = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = (0, pick_1.default)(req.query, ['search', 'agency_id']);
    const options = (0, pick_1.default)(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
    const result = yield certification_service_1.CertificationService.GetAllCertification(query, options);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Certifications retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
}));
const GetSingleCertification = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield certification_service_1.CertificationService.GetSingleCertification(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Certification retrieved successfully',
        data: result,
    });
}));
const UpdateCertification = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const file = req.file;
    const result = yield certification_service_1.CertificationService.UpdateCertification(id, req.body, file);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Certification updated successfully',
        data: result,
    });
}));
const DeleteCertification = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield certification_service_1.CertificationService.DeleteCertification(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Certification deleted successfully',
        data: result,
    });
}));
const GetCertificationsByAgency = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { agency_id } = req.params;
    const query = (0, pick_1.default)(req.query, ['search']);
    const options = (0, pick_1.default)(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
    const result = yield certification_service_1.CertificationService.GetCertificationsByAgency(agency_id, query, options);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Agency certifications retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
}));
const VerifyCertification = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sl_no } = req.params;
    const result = yield certification_service_1.CertificationService.VerifyCertification(sl_no);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Certificate verified successfully',
        data: result,
    });
}));
const GetMyAgenciesCertifications = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = (0, pick_1.default)(req.query, ['search', 'agency_id']);
    const options = (0, pick_1.default)(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
    const result = yield certification_service_1.CertificationService.GetMyAgenciesCertifications(req.user.id, query, options);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'My agencies certifications retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
}));
exports.CertificationController = {
    CreateCertification,
    GetAllCertification,
    GetSingleCertification,
    UpdateCertification,
    DeleteCertification,
    GetCertificationsByAgency,
    VerifyCertification,
    GetMyAgenciesCertifications,
};

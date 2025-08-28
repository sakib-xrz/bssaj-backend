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
exports.ConsultationController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const pick_1 = __importDefault(require("../../utils/pick"));
const consultation_services_1 = require("./consultation.services");
const CreateConsultation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield consultation_services_1.ConsultationService.CreateConsultation(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Consultation created successfully',
        data: result,
    });
}));
const GetAllConsultation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = (0, pick_1.default)(req.query, ['search', 'name', 'phone', 'email']);
    const options = (0, pick_1.default)(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
    const result = yield consultation_services_1.ConsultationService.GetAllConsultation(query, options);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Consultations retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
}));
const GetConsultationById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield consultation_services_1.ConsultationService.GetConsultationById(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Consultation retrieved successfully',
        data: result,
    });
}));
const UpdateConsultationStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = req.user;
    const result = yield consultation_services_1.ConsultationService.UpdateConsultationStatus(id, req.body, user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Consultation status updated successfully',
        data: result,
    });
}));
const DeleteConsultation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = req.user;
    const result = yield consultation_services_1.ConsultationService.DeleteConsultation(id, user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Consultation deleted successfully',
        data: result,
    });
}));
exports.ConsultationController = {
    CreateConsultation,
    GetAllConsultation,
    GetConsultationById,
    UpdateConsultationStatus,
    DeleteConsultation,
};

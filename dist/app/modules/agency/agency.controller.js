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
exports.AgencyController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const agency_services_1 = require("./agency.services");
const pick_1 = __importDefault(require("../../utils/pick"));
const CreateAgency = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    const result = yield agency_services_1.AgencyService.CreateAgency(req.body, files);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Agency and user created successfully',
        data: result,
    });
}));
const GetAllAgency = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = (0, pick_1.default)(req.query, [
        'name',
        'search',
        'status',
        'subscription_status',
    ]);
    const options = (0, pick_1.default)(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
    const result = yield agency_services_1.AgencyService.GetAllAgency(query, options);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Agencies retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
}));
const GetAgencyStats = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield agency_services_1.AgencyService.GetAgencyStats();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Agency statistics retrieved successfully',
        data: result,
    });
}));
const GetSingleAgency = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield agency_services_1.AgencyService.GetSingleAgency(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Agency retrieved successfully',
        data: result,
    });
}));
const UpdateAgency = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const files = req.files;
    const result = yield agency_services_1.AgencyService.UpdateAgency(req.body, id, files);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Agency updated successfully',
        data: result,
    });
}));
const DeleteAgency = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = req.params.id;
    const result = yield agency_services_1.AgencyService.DeleteAgency(id, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Agency deleted successfully',
        data: result,
    });
}));
const GetMyAgency = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield agency_services_1.AgencyService.GetMyAgency(req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Agencies retrieved successfully',
        data: result,
    });
}));
const UploadSuccessStory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    const result = yield agency_services_1.AgencyService.UploadSuccessStory(req.body, files);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Success stories uploaded successfully',
        data: result,
    });
}));
const ReplaceSuccessStory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const files = req.files;
    const result = yield agency_services_1.AgencyService.ReplaceSuccessStory(id, files);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Success story replaced successfully',
        data: result,
    });
}));
const DeleteSuccessStory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield agency_services_1.AgencyService.DeleteSuccessStory(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Success story deleted successfully',
        data: result,
    });
}));
const CheckExpiredSubscriptions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield agency_services_1.AgencyService.CheckAndUpdateExpiredSubscriptions();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Expired subscriptions checked successfully',
        data: result,
    });
}));
exports.AgencyController = {
    CreateAgency,
    GetAllAgency,
    GetAgencyStats,
    GetSingleAgency,
    UpdateAgency,
    DeleteAgency,
    GetMyAgency,
    UploadSuccessStory,
    ReplaceSuccessStory,
    DeleteSuccessStory,
    CheckExpiredSubscriptions,
};

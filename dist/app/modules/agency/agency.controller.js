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
    const result = yield agency_services_1.AgencyService.CreateAgency(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Agency created successfully',
        data: result,
    });
}));
const GetAllAgency = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = (0, pick_1.default)(req.query, ['name', 'search']);
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
    const result = yield agency_services_1.AgencyService.UpdateAgency(req.body, id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Agency updated successfully',
        data: result,
    });
}));
const DeleteAgency = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield agency_services_1.AgencyService.DeleteAgency(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Agency deleted successfully',
        data: result,
    });
}));
const ApprovedOrRejectAgency = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const result = yield agency_services_1.AgencyService.ApprovedOrRejectAgency((_a = req.params) === null || _a === void 0 ? void 0 : _a.id, req.body.status, (_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: `Successfully ${result.status.toLowerCase()} the agency.`,
        data: result,
    });
}));
exports.AgencyController = {
    CreateAgency,
    GetAllAgency,
    GetSingleAgency,
    UpdateAgency,
    DeleteAgency,
    ApprovedOrRejectAgency,
};

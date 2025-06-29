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
exports.MembersController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const pick_1 = __importDefault(require("../../utils/pick"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const member_service_1 = require("./member.service");
const CreateMember = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield member_service_1.MembersService.CreateMember(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Member created successfully',
        data: result,
    });
}));
const GetAllMember = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = (0, pick_1.default)(req.query, ['name', 'email', 'search', 'phone']);
    const options = (0, pick_1.default)(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
    const result = yield member_service_1.MembersService.GetAllMember(query, options);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Members fetched successfully',
        meta: result.meta,
        data: result.data,
    });
}));
const SingleMember = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield member_service_1.MembersService.GetSingleMember(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Single Member fetched successfully',
        data: result,
    });
}));
const UpdateMember = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield member_service_1.MembersService.UpdateMember(id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Member updated successfully',
        data: result,
    });
}));
const DeleteMember = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield member_service_1.MembersService.DeleteMember(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Member deleted successfully',
        data: result,
    });
}));
const ApprovedOrRejectMember = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const result = yield member_service_1.MembersService.ApprovedOrRejectMember((_a = req.params) === null || _a === void 0 ? void 0 : _a.id, req.body.status, (_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Member status updated successfully',
        data: result,
    });
}));
exports.MembersController = {
    CreateMember,
    GetAllMember,
    SingleMember,
    UpdateMember,
    DeleteMember,
    ApprovedOrRejectMember,
};

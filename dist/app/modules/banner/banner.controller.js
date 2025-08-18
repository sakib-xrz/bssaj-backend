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
exports.BannerController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const pick_1 = __importDefault(require("../../utils/pick"));
const banner_services_1 = require("./banner.services");
const CreateBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const user = req.user;
    const result = yield banner_services_1.BannerService.CreateBanner(req.body, file, user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Banner created successfully',
        data: result,
    });
}));
const GetAllBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = (0, pick_1.default)(req.query, ['search']);
    const options = (0, pick_1.default)(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
    const result = yield banner_services_1.BannerService.GetAllBanner(query, options);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Banners retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
}));
const GetSingleBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield banner_services_1.BannerService.GetSingleBanner(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Banner retrieved successfully',
        data: result,
    });
}));
const UpdateBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const file = req.file;
    const user = req.user;
    const result = yield banner_services_1.BannerService.UpdateBanner(id, req.body, file, user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Banner updated successfully',
        data: result,
    });
}));
const DeleteBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = req.user;
    const result = yield banner_services_1.BannerService.DeleteBanner(id, user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Banner deleted successfully',
        data: result,
    });
}));
exports.BannerController = {
    CreateBanner,
    GetAllBanner,
    GetSingleBanner,
    UpdateBanner,
    DeleteBanner,
};

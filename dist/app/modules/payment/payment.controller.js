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
exports.PaymentController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const payment_services_1 = require("./payment.services");
const pick_1 = __importDefault(require("../../utils/pick"));
const CreatePayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payment_services_1.PaymentService.CreatePayment(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Payment created successfully',
        data: result,
    });
}));
const GetAllPayments = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = (0, pick_1.default)(req.query, [
        'search',
        'payment_status',
        'agency_id',
        'payment_month',
        'start_date',
        'end_date',
    ]);
    const options = (0, pick_1.default)(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
    const result = yield payment_services_1.PaymentService.GetAllPayments(query, options);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Payments retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
}));
const GetPaymentStats = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payment_services_1.PaymentService.GetPaymentStats();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Payment statistics retrieved successfully',
        data: result,
    });
}));
const GetSinglePayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield payment_services_1.PaymentService.GetSinglePayment(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Payment retrieved successfully',
        data: result,
    });
}));
const UpdatePayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield payment_services_1.PaymentService.UpdatePayment(req.body, id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Payment updated successfully',
        data: result,
    });
}));
const ApprovePayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield payment_services_1.PaymentService.ApprovePayment(id, req.body, req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Payment approved successfully',
        data: result,
    });
}));
const DeletePayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield payment_services_1.PaymentService.DeletePayment(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Payment deleted successfully',
        data: result,
    });
}));
const GetAgencyPayments = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const agencyId = req.params.agencyId;
    const query = (0, pick_1.default)(req.query, ['payment_status', 'payment_month']);
    const options = (0, pick_1.default)(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
    const result = yield payment_services_1.PaymentService.GetAgencyPayments(agencyId, query, options);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Agency payments retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
}));
const BulkCreatePayments = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payment_services_1.PaymentService.BulkCreatePayments(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Bulk payments created successfully',
        data: result,
    });
}));
const GetAgencyPaymentSummary = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const agencyId = req.params.agencyId;
    const result = yield payment_services_1.PaymentService.GetAgencyPaymentSummary(agencyId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Agency payment summary retrieved successfully',
        data: result,
    });
}));
exports.PaymentController = {
    CreatePayment,
    GetAllPayments,
    GetPaymentStats,
    GetSinglePayment,
    UpdatePayment,
    ApprovePayment,
    DeletePayment,
    GetAgencyPayments,
    GetAgencyPaymentSummary,
    BulkCreatePayments,
};

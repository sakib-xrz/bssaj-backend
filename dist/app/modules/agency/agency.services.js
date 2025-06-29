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
exports.AgencyService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const pagination_1 = __importDefault(require("../../utils/pagination"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const CreateAgency = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.agency.create({
        data: payload,
    });
    return result;
});
const GetAllAgency = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search } = query;
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const andCondition = [];
    if (search) {
        andCondition.push({
            OR: ['name'].map((field) => ({
                [field]: {
                    contains: query.search,
                    mode: 'insensitive',
                },
            })),
        });
    }
    const whereCondition = { AND: andCondition };
    const result = yield prisma_1.default.agency.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sort_by && sort_order ? { [sort_by]: sort_order } : { created_at: 'asc' },
    });
    const total = yield prisma_1.default.agency.count({
        where: whereCondition,
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const GetSingleAgency = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.agency.findUnique({
        where: {
            id,
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'agency not found');
    }
    return result;
});
const UpdateAgency = (payload, id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingAgency = yield prisma_1.default.agency.findUnique({
        where: {
            id,
        },
    });
    if (!existingAgency) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'agency not found');
    }
    if (existingAgency.status !== 'APPROVED') {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'You cannot delete the agency. Please approve it first before update.');
    }
    const result = yield prisma_1.default.agency.update({
        where: {
            id,
        },
        data: payload,
    });
    return result;
});
const DeleteAgency = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingAgency = yield prisma_1.default.agency.findUnique({
        where: {
            id,
        },
    });
    if (!existingAgency) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'agency not found');
    }
    const result = yield prisma_1.default.agency.delete({
        where: {
            id,
        },
    });
    return result;
});
const ApprovedOrRejectAgency = (id, status, approved_by_id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const existingAgency = yield tx.agency.findUnique({
            where: { id },
        });
        if (!existingAgency) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Agency not found');
        }
        const updatedAgency = yield tx.agency.update({
            where: { id },
            data: {
                status: status,
                approved_by_id,
                approved_at: new Date(),
            },
        });
        if (status === client_1.AgencyStatus.APPROVED) {
            yield tx.user.update({
                where: { id: existingAgency.user_id },
                data: { role: 'AGENCY' },
            });
        }
        return updatedAgency;
    }));
    return result;
});
exports.AgencyService = {
    CreateAgency,
    GetAllAgency,
    GetSingleAgency,
    UpdateAgency,
    DeleteAgency,
    ApprovedOrRejectAgency,
};

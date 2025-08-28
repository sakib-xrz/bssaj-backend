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
exports.ConsultationService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const pagination_1 = __importDefault(require("../../utils/pagination"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const CreateConsultation = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.consultation.create({
        data: payload,
    });
    return result;
});
const GetAllConsultation = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, name, phone, email } = query;
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const andCondition = [];
    if (search) {
        andCondition.push({
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { message: { contains: search, mode: 'insensitive' } },
            ],
        });
    }
    if (name) {
        andCondition.push({
            name: { contains: name, mode: 'insensitive' },
        });
    }
    if (phone) {
        andCondition.push({
            phone: { contains: phone, mode: 'insensitive' },
        });
    }
    if (email) {
        andCondition.push({
            email: { contains: email, mode: 'insensitive' },
        });
    }
    const whereCondition = andCondition.length > 0 ? { AND: andCondition } : {};
    const result = yield prisma_1.default.consultation.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sort_by && sort_order
            ? { [sort_by]: sort_order }
            : { created_at: 'desc' },
    });
    const total = yield prisma_1.default.consultation.count({
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
const GetConsultationById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.consultation.findUnique({
        where: { id },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Consultation not found');
    }
    return result;
});
const UpdateConsultationStatus = (id, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    const consultation = yield prisma_1.default.consultation.findUnique({
        where: { id },
    });
    if (!consultation) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Consultation not found');
    }
    if (user) {
        const isAdmin = user.role === client_1.Role.SUPER_ADMIN || user.role === client_1.Role.ADMIN;
        if (!isAdmin) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Only admins can update consultation status');
        }
    }
    const result = yield prisma_1.default.consultation.update({
        where: { id },
        data: {
            status: payload.status,
        },
    });
    return result;
});
const DeleteConsultation = (id, user) => __awaiter(void 0, void 0, void 0, function* () {
    const consultation = yield prisma_1.default.consultation.findUnique({
        where: { id },
    });
    if (!consultation) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Consultation not found');
    }
    if (user) {
        const isAdmin = user.role === client_1.Role.SUPER_ADMIN || user.role === client_1.Role.ADMIN;
        if (!isAdmin) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Only admins can delete consultations');
        }
    }
    yield prisma_1.default.consultation.delete({
        where: { id },
    });
    return null;
});
exports.ConsultationService = {
    CreateConsultation,
    GetAllConsultation,
    GetConsultationById,
    UpdateConsultationStatus,
    DeleteConsultation,
};

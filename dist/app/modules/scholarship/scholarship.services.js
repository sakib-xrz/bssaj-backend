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
exports.ScholarshipService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const pagination_1 = __importDefault(require("../../utils/pagination"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const CreateScholarship = (payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate user permissions
    if (user) {
        const isAdmin = user.role === client_1.Role.SUPER_ADMIN || user.role === client_1.Role.ADMIN;
        if (!isAdmin) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Only admins can create scholarships');
        }
    }
    // Convert deadline string to Date
    const scholarshipData = Object.assign(Object.assign({}, payload), { deadline: new Date(payload.deadline) });
    const result = yield prisma_1.default.scholarship.create({
        data: scholarshipData,
    });
    return result;
});
const GetAllScholarships = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, title, provider, eligibility } = query;
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const andCondition = [{ is_deleted: false }];
    if (search) {
        andCondition.push({
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { provider: { contains: search, mode: 'insensitive' } },
                { eligibility: { contains: search, mode: 'insensitive' } },
            ],
        });
    }
    if (title) {
        andCondition.push({
            title: { contains: title, mode: 'insensitive' },
        });
    }
    if (provider) {
        andCondition.push({
            provider: { contains: provider, mode: 'insensitive' },
        });
    }
    if (eligibility) {
        andCondition.push({
            eligibility: { contains: eligibility, mode: 'insensitive' },
        });
    }
    const whereCondition = andCondition.length > 0 ? { AND: andCondition } : { is_deleted: false };
    const result = yield prisma_1.default.scholarship.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sort_by && sort_order
            ? { [sort_by]: sort_order }
            : { created_at: 'desc' },
    });
    const total = yield prisma_1.default.scholarship.count({
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
const GetScholarshipById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.scholarship.findUnique({
        where: { id, is_deleted: false },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Scholarship not found');
    }
    return result;
});
const UpdateScholarship = (id, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate user permissions
    if (user) {
        const isAdmin = user.role === client_1.Role.SUPER_ADMIN || user.role === client_1.Role.ADMIN;
        if (!isAdmin) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Only admins can update scholarships');
        }
    }
    const scholarship = yield prisma_1.default.scholarship.findUnique({
        where: { id, is_deleted: false },
    });
    if (!scholarship) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Scholarship not found');
    }
    // Convert deadline string to Date if provided
    const updateData = Object.assign(Object.assign({}, payload), (payload.deadline && { deadline: new Date(payload.deadline) }));
    const result = yield prisma_1.default.scholarship.update({
        where: { id },
        data: updateData,
    });
    return result;
});
const DeleteScholarship = (id, user) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate user permissions
    if (user) {
        const isAdmin = user.role === client_1.Role.SUPER_ADMIN || user.role === client_1.Role.ADMIN;
        if (!isAdmin) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Only admins can delete scholarships');
        }
    }
    const scholarship = yield prisma_1.default.scholarship.findUnique({
        where: { id, is_deleted: false },
    });
    if (!scholarship) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Scholarship not found');
    }
    // Soft delete
    yield prisma_1.default.scholarship.update({
        where: { id },
        data: { is_deleted: true },
    });
    return null;
});
exports.ScholarshipService = {
    CreateScholarship,
    GetAllScholarships,
    GetScholarshipById,
    UpdateScholarship,
    DeleteScholarship,
};

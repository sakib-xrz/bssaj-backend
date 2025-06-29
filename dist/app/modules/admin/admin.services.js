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
exports.AdminService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const ApprovedOrRejectMember = (id, status, approved_by_id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingMember = yield prisma_1.default.member.findUnique({
        where: {
            id,
        },
    });
    if (!existingMember) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This member is not found');
    }
    const result = yield prisma_1.default.member.update({
        where: {
            id,
        },
        data: {
            status,
            approved_by_id,
            approved_at: new Date(),
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
const ApprovedOrRejectBlog = (approvedId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const reuslt = yield prisma_1.default.blog.update({
        where: {
            id: payload.id
        },
        data: {
            approved_by_id: approvedId,
            is_published: payload.is_published,
            is_approved: payload.is_approved
        }
    });
    return reuslt;
});
exports.AdminService = {
    ApprovedOrRejectMember,
    ApprovedOrRejectAgency,
    ApprovedOrRejectBlog
};

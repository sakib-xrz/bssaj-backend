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
const handelFile_1 = require("../../utils/handelFile");
const ApprovedOrRejectMember = (id, status, approved_by_id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingMember = yield prisma_1.default.member.findUnique({
        where: {
            id,
        },
    });
    if (!existingMember) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This member is not found');
    }
    if (existingMember.status === client_1.MembershipStatus.APPROVED) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This member is already approved');
    }
    if (status === client_1.MembershipStatus.APPROVED) {
        yield prisma_1.default.member.update({
            where: {
                id,
            },
            data: {
                status,
                approved_by_id,
                approved_at: new Date(),
            },
        });
    }
    if (status === client_1.MembershipStatus.REJECTED) {
        yield prisma_1.default.member.delete({
            where: {
                id,
            },
        });
    }
});
const ApprovedOrRejectAgency = (id, status, approved_by_id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingAgency = yield prisma_1.default.agency.findUnique({
        where: { id },
        include: {
            success_stories: true,
            user: true,
        },
    });
    if (!existingAgency) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Agency not found');
    }
    if (existingAgency.status === client_1.AgencyStatus.APPROVED) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This agency is already approved');
    }
    if (status === client_1.AgencyStatus.APPROVED) {
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const updatedAgency = yield tx.agency.update({
                where: { id },
                data: {
                    status: status,
                    approved_by_id,
                    approved_at: new Date(),
                },
            });
            yield tx.user.update({
                where: { id: existingAgency.user_id },
                data: { role: 'AGENCY' },
            });
            return updatedAgency;
        }));
        return result;
    }
    if (status === client_1.AgencyStatus.REJECTED) {
        const filesToDelete = [];
        if (existingAgency.logo) {
            const logoKey = (0, handelFile_1.extractKeyFromUrl)(existingAgency.logo);
            if (logoKey)
                filesToDelete.push(logoKey);
        }
        if (existingAgency.success_stories &&
            existingAgency.success_stories.length > 0) {
            const successStoryKeys = existingAgency.success_stories
                .map((story) => (0, handelFile_1.extractKeyFromUrl)(story.image))
                .filter((key) => key);
            filesToDelete.push(...successStoryKeys);
        }
        yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            yield tx.agency.delete({
                where: { id },
            });
            yield tx.user.delete({
                where: { id: existingAgency.user_id },
            });
        }));
        if (filesToDelete.length > 0) {
            try {
                yield (0, handelFile_1.deleteMultipleFromSpaces)(filesToDelete);
            }
            catch (error) {
                console.error('Failed to delete some files from DigitalOcean Spaces:', error);
            }
        }
        return null;
    }
});
const ApprovedOrRejectBlog = (approvedId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const reuslt = yield prisma_1.default.blog.update({
        where: {
            id: payload.id,
        },
        data: {
            approved_by_id: approvedId,
            is_published: payload.is_published,
            is_approved: payload.is_approved,
        },
    });
    return reuslt;
});
exports.AdminService = {
    ApprovedOrRejectMember,
    ApprovedOrRejectAgency,
    ApprovedOrRejectBlog,
};

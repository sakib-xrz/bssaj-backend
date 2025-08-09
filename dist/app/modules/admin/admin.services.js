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
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const mailer_1 = __importDefault(require("../../utils/mailer"));
const agency_utils_1 = __importDefault(require("../agency/agency.utils"));
const handelFile_1 = require("../../utils/handelFile");
const templates_1 = require("../../templates");
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
    console.log('user_selection_type', existingAgency.user_selection_type);
    if (status === client_1.AgencyStatus.APPROVED &&
        existingAgency.user_selection_type === client_1.UserSelectionType.NEW) {
        // Generate new password for the agency user
        const newPassword = agency_utils_1.default.generateRandomPassword(12);
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, Number(config_1.default.bcrypt_salt_rounds));
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
                data: {
                    role: 'AGENCY',
                    password: hashedPassword,
                },
            });
            return updatedAgency;
        }));
        try {
            const emailTemplate = (0, templates_1.createAgencyApprovalEmailTemplate)(existingAgency.name, existingAgency.user.name, existingAgency.user.email, newPassword);
            yield (0, mailer_1.default)(existingAgency.user.email, '🎉 Congratulations! Your Agency Registration has been Approved', emailTemplate);
        }
        catch (emailError) {
            console.error('Failed to send approval email:', emailError);
            // Don't throw error for email failures - agency is still approved
        }
        return result;
    }
    else if (status === client_1.AgencyStatus.APPROVED &&
        existingAgency.user_selection_type === client_1.UserSelectionType.EXISTING) {
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
                data: {
                    role: 'AGENCY',
                },
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
            // Delete agency success stories first
            yield tx.agencySuccessStory.deleteMany({
                where: { agency_id: id },
            });
            // Delete the agency
            yield tx.agency.delete({
                where: { id },
            });
        }));
        // Clean up files from cloud storage
        if (filesToDelete.length > 0) {
            try {
                yield (0, handelFile_1.deleteMultipleFromSpaces)(filesToDelete);
            }
            catch (error) {
                console.error('Failed to delete some files from DigitalOcean Spaces:', error);
                // Don't throw error for file cleanup failures
            }
        }
    }
});
const ApprovedOrRejectBlog = (approvedId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingBlog = yield prisma_1.default.blog.findUnique({
        where: {
            id: payload.id,
        },
    });
    if (!existingBlog) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This blog is not found');
    }
    if (existingBlog.is_approved === true) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This blog is already approved');
    }
    // If approving the blog
    if (payload.is_approved === true) {
        const result = yield prisma_1.default.blog.update({
            where: {
                id: payload.id,
            },
            data: {
                approved_by_id: approvedId,
                is_published: payload.is_published,
                is_approved: payload.is_approved,
                approved_at: new Date(),
            },
        });
        return result;
    }
    // If rejecting the blog (hard delete)
    if (payload.is_approved === false) {
        const filesToDelete = [];
        // If blog has a cover image, prepare it for deletion
        if (existingBlog.cover_image) {
            const coverImageKey = (0, handelFile_1.extractKeyFromUrl)(existingBlog.cover_image);
            if (coverImageKey)
                filesToDelete.push(coverImageKey);
        }
        // Delete the blog from database
        yield prisma_1.default.blog.delete({
            where: {
                id: payload.id,
            },
        });
        // Clean up files from cloud storage
        if (filesToDelete.length > 0) {
            try {
                yield (0, handelFile_1.deleteMultipleFromSpaces)(filesToDelete);
            }
            catch (error) {
                console.error('Failed to delete some files from DigitalOcean Spaces:', error);
                // Don't throw error for file cleanup failures
            }
        }
        return { message: 'Blog rejected and deleted successfully' };
    }
    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid approval status');
});
exports.AdminService = {
    ApprovedOrRejectMember,
    ApprovedOrRejectAgency,
    ApprovedOrRejectBlog,
};

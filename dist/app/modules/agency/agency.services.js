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
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const pagination_1 = __importDefault(require("../../utils/pagination"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const path_1 = __importDefault(require("path"));
const handelFile_1 = require("../../utils/handelFile");
const agency_utils_1 = __importDefault(require("./agency.utils"));
const CreateAgency = (payload, files) => __awaiter(void 0, void 0, void 0, function* () {
    let logo = null;
    let uploadedSuccessStories = [];
    let generatedPassword = '';
    try {
        const existingUser = yield prisma_1.default.user.findUnique({
            where: { email: payload.contact_email },
        });
        if (existingUser) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'User with this email already exists');
        }
        generatedPassword = agency_utils_1.default.generateRandomPassword(12);
        const hashedPassword = yield bcrypt_1.default.hash(generatedPassword, Number(config_1.default.bcrypt_salt_rounds));
        const logoFile = files === null || files === void 0 ? void 0 : files.find((file) => file.fieldname === 'logo');
        if (logoFile) {
            const logoUploadResult = yield (0, handelFile_1.uploadToSpaces)(logoFile, {
                folder: 'agency-logos',
                filename: `agency_logo_${Date.now()}${path_1.default.extname(logoFile.originalname)}`,
            });
            logo = (logoUploadResult === null || logoUploadResult === void 0 ? void 0 : logoUploadResult.url) || null;
        }
        const successStoryFiles = (files === null || files === void 0 ? void 0 : files.filter((file) => file.fieldname.startsWith('successStoryImages'))) || [];
        if (successStoryFiles.length > 0) {
            const uploadPromises = successStoryFiles.map((file, index) => (0, handelFile_1.uploadToSpaces)(file, {
                folder: 'agency-success-stories',
                filename: `success_story_${Date.now()}_${index}${path_1.default.extname(file.originalname)}`,
            }));
            const uploadResults = yield Promise.all(uploadPromises);
            uploadedSuccessStories = uploadResults
                .map((result) => result === null || result === void 0 ? void 0 : result.url)
                .filter((url) => url !== undefined);
        }
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield tx.user.create({
                data: {
                    name: payload.director_name,
                    email: payload.contact_email,
                    password: hashedPassword,
                    role: client_1.Role.AGENCY,
                },
            });
            const agencyData = {
                user_id: user.id,
                name: payload.name,
                contact_email: payload.contact_email,
                contact_phone: payload.contact_phone || null,
                website: payload.website || null,
                director_name: payload.director_name || null,
                established_year: payload.established_year
                    ? Number(payload.established_year)
                    : null,
                description: payload.description || null,
                address: payload.address || null,
                facebook_url: payload.facebook_url || null,
                logo: logo,
                status: payload.status || 'PENDING',
                is_deleted: payload.is_deleted === 'true' ? true : false,
            };
            const agency = yield tx.agency.create({
                data: agencyData,
            });
            if (uploadedSuccessStories.length > 0) {
                const successStoryData = uploadedSuccessStories.map((imageUrl) => ({
                    agency_id: agency.id,
                    image: imageUrl,
                }));
                yield tx.agencySuccessStory.createMany({
                    data: successStoryData,
                });
            }
            return yield tx.agency.findUnique({
                where: { id: agency.id },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                    success_stories: true,
                },
            });
        }));
        return Object.assign({}, result);
    }
    catch (error) {
        if (logo) {
            const key = (0, handelFile_1.extractKeyFromUrl)(logo);
            if (key)
                yield (0, handelFile_1.deleteFromSpaces)(key).catch(() => { });
        }
        if (uploadedSuccessStories.length > 0) {
            const keys = uploadedSuccessStories
                .map((url) => (0, handelFile_1.extractKeyFromUrl)(url))
                .filter((key) => key);
            if (keys.length > 0)
                yield (0, handelFile_1.deleteMultipleFromSpaces)(keys).catch(() => { });
        }
        throw error;
    }
});
const GetAllAgency = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, status } = query;
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const andCondition = [];
    if (search) {
        andCondition.push({
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { director_name: { contains: search, mode: 'insensitive' } },
                { contact_email: { contains: search, mode: 'insensitive' } },
            ],
        });
    }
    if (status) {
        andCondition.push({ status });
    }
    // Filter out deleted agencies by default
    andCondition.push({ is_deleted: false });
    const whereCondition = { AND: andCondition };
    const result = yield prisma_1.default.agency.findMany({
        where: whereCondition,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            success_stories: true,
        },
        skip,
        take: limit,
        orderBy: sort_by && sort_order
            ? { [sort_by]: sort_order }
            : { created_at: 'desc' },
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
const GetAgencyStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalAgencies = yield prisma_1.default.agency.count({
        where: {
            is_deleted: false,
        },
    });
    const totalApprovedAgencies = yield prisma_1.default.agency.count({
        where: {
            is_deleted: false,
            status: 'APPROVED',
        },
    });
    const totalPendingAgencies = yield prisma_1.default.agency.count({
        where: {
            is_deleted: false,
            status: 'PENDING',
        },
    });
    const totalRejectedAgencies = yield prisma_1.default.agency.count({
        where: {
            is_deleted: false,
            status: 'REJECTED',
        },
    });
    return {
        total_agencies: totalAgencies,
        total_approved_agencies: totalApprovedAgencies,
        total_pending_agencies: totalPendingAgencies,
        total_rejected_agencies: totalRejectedAgencies,
    };
});
const GetSingleAgency = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.agency.findUnique({
        where: { id, is_deleted: false },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
            success_stories: true,
            approved_by: {
                select: {
                    name: true,
                },
            },
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Agency not found');
    }
    return result;
});
const UpdateAgency = (payload, id, files) => __awaiter(void 0, void 0, void 0, function* () {
    const existingAgency = yield prisma_1.default.agency.findUnique({
        where: { id, is_deleted: false },
        include: { success_stories: true },
    });
    if (!existingAgency) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Agency not found');
    }
    let logo = existingAgency.logo;
    let newSuccessStories = [];
    try {
        // Handle logo update - find logo file from array
        const logoFile = files === null || files === void 0 ? void 0 : files.find((file) => file.fieldname === 'logo');
        if (logoFile) {
            // Delete old logo if exists
            if (existingAgency.logo) {
                const key = (0, handelFile_1.extractKeyFromUrl)(existingAgency.logo);
                if (key)
                    yield (0, handelFile_1.deleteFromSpaces)(key).catch(() => { });
            }
            const logoUploadResult = yield (0, handelFile_1.uploadToSpaces)(logoFile, {
                folder: 'agency-logos',
                filename: `agency_logo_${Date.now()}${path_1.default.extname(logoFile.originalname)}`,
            });
            logo = (logoUploadResult === null || logoUploadResult === void 0 ? void 0 : logoUploadResult.url) || null;
        }
        // Handle success story images - filter files with fieldname starting with 'successStoryImages'
        const successStoryFiles = (files === null || files === void 0 ? void 0 : files.filter((file) => file.fieldname.startsWith('successStoryImages'))) || [];
        if (successStoryFiles.length > 0) {
            // Delete old success stories
            if (existingAgency.success_stories.length > 0) {
                const oldPublicIds = existingAgency.success_stories
                    .map((story) => (0, handelFile_1.extractKeyFromUrl)(story.image))
                    .filter((id) => id);
                if (oldPublicIds.length > 0) {
                    yield (0, handelFile_1.deleteMultipleFromSpaces)(oldPublicIds).catch(() => { });
                }
                // Delete old success story records
                yield prisma_1.default.agencySuccessStory.deleteMany({
                    where: { agency_id: id },
                });
            }
            // Upload new success stories
            const uploadPromises = successStoryFiles.map((file, index) => (0, handelFile_1.uploadToSpaces)(file, {
                folder: 'agency-success-stories',
                filename: `success_story_${Date.now()}_${index}${path_1.default.extname(file.originalname)}`,
            }));
            const uploadResults = yield Promise.all(uploadPromises);
            newSuccessStories = uploadResults
                .map((result) => result === null || result === void 0 ? void 0 : result.url)
                .filter((url) => url !== undefined);
            // Create new success story records
            const successStoryPromises = newSuccessStories.map((imageUrl) => prisma_1.default.agencySuccessStory.create({
                data: {
                    agency_id: id,
                    image: imageUrl,
                },
            }));
            yield Promise.all(successStoryPromises);
        }
        const updateData = Object.assign(Object.assign({}, payload), { logo });
        const result = yield prisma_1.default.agency.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                success_stories: true,
            },
        });
        return result;
    }
    catch (error) {
        // Clean up newly uploaded files on error
        if (newSuccessStories.length > 0) {
            const publicIds = newSuccessStories
                .map((url) => (0, handelFile_1.extractKeyFromUrl)(url))
                .filter((id) => id);
            if (publicIds.length > 0)
                yield (0, handelFile_1.deleteMultipleFromSpaces)(publicIds).catch(() => { });
        }
        throw error;
    }
});
const DeleteAgency = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingAgency = yield prisma_1.default.agency.findUnique({
        where: { id, is_deleted: false },
        include: { success_stories: true, user: true },
    });
    if (!existingAgency) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Agency not found');
    }
    // Hard delete agency and associated data
    yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Delete success stories first (due to foreign key constraints)
        yield tx.agencySuccessStory.deleteMany({
            where: { agency_id: id },
        });
        // Delete the agency
        yield tx.agency.delete({
            where: { id },
        });
        // Delete the associated user
        yield tx.user.delete({
            where: { id: existingAgency.user_id },
        });
    }));
    // Clean up uploaded files from cloud storage
    const filesToDelete = [];
    // Add logo to deletion list
    if (existingAgency.logo) {
        const logoPublicId = (0, handelFile_1.extractKeyFromUrl)(existingAgency.logo);
        if (logoPublicId)
            filesToDelete.push(logoPublicId);
    }
    // Add success story images to deletion list
    if (existingAgency.success_stories.length > 0) {
        const successStoryPublicIds = existingAgency.success_stories
            .map((story) => (0, handelFile_1.extractKeyFromUrl)(story.image))
            .filter((id) => id);
        filesToDelete.push(...successStoryPublicIds);
    }
    // Delete files from DigitalOcean Spaces
    if (filesToDelete.length > 0) {
        yield (0, handelFile_1.deleteMultipleFromSpaces)(filesToDelete).catch(() => {
            // Log error but don't fail the operation
            console.error('Failed to delete some files from DigitalOcean Spaces');
        });
    }
    return { message: 'Agency and associated user deleted successfully' };
});
exports.AgencyService = {
    CreateAgency,
    GetAllAgency,
    GetAgencyStats,
    GetSingleAgency,
    UpdateAgency,
    DeleteAgency,
};

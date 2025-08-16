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
    let coverPhoto = null;
    let uploadedSuccessStories = [];
    let generatedPassword = '';
    let userId;
    let hashedPassword = '';
    try {
        // Check if we're using an existing user or creating a new one
        if (payload.user_selection_type === 'existing' && payload.user_id) {
            // Using existing user
            const existingUser = yield prisma_1.default.user.findUnique({
                where: { id: payload.user_id, is_deleted: false },
            });
            if (!existingUser) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Selected user not found');
            }
            // Note: User can now have multiple agencies, so we don't check for existing agency
            userId = existingUser.id;
        }
        else {
            // Creating new user
            const existingUser = yield prisma_1.default.user.findUnique({
                where: { email: payload.contact_email },
            });
            if (existingUser) {
                throw new AppError_1.default(http_status_1.default.CONFLICT, 'User with this email already exists');
            }
            generatedPassword = agency_utils_1.default.generateRandomPassword(12);
            hashedPassword = yield bcrypt_1.default.hash(generatedPassword, Number(config_1.default.bcrypt_salt_rounds));
            // We'll create the user in the transaction
            userId = ''; // Will be set in transaction
        }
        const logoFile = files === null || files === void 0 ? void 0 : files.find((file) => file.fieldname === 'logo');
        if (logoFile) {
            const logoUploadResult = yield (0, handelFile_1.uploadToSpaces)(logoFile, {
                folder: 'agency-logos',
                filename: `agency_logo_${Date.now()}${path_1.default.extname(logoFile.originalname)}`,
            });
            logo = (logoUploadResult === null || logoUploadResult === void 0 ? void 0 : logoUploadResult.url) || null;
        }
        const coverPhotoFile = files === null || files === void 0 ? void 0 : files.find((file) => file.fieldname === 'cover_photo');
        if (coverPhotoFile) {
            const coverPhotoUploadResult = yield (0, handelFile_1.uploadToSpaces)(coverPhotoFile, {
                folder: 'agency-cover-photos',
                filename: `agency_cover_${Date.now()}${path_1.default.extname(coverPhotoFile.originalname)}`,
            });
            coverPhoto = (coverPhotoUploadResult === null || coverPhotoUploadResult === void 0 ? void 0 : coverPhotoUploadResult.url) || null;
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
            let finalUserId;
            if (payload.user_selection_type === 'existing' && payload.user_id) {
                // Use existing user
                finalUserId = userId;
            }
            else {
                // Create new user
                const user = yield tx.user.create({
                    data: {
                        name: payload.director_name,
                        email: payload.contact_email,
                        password: hashedPassword,
                        role: client_1.Role.AGENCY,
                    },
                });
                finalUserId = user.id;
            }
            const agencyData = {
                user_id: finalUserId,
                name: payload.name,
                contact_email: payload.contact_email,
                agency_email: payload.agency_email || null,
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
                cover_photo: coverPhoto,
                status: payload.status || 'PENDING',
                is_deleted: payload.is_deleted === 'true' ? true : false,
                user_selection_type: payload.user_selection_type === 'existing'
                    ? client_1.UserSelectionType.EXISTING
                    : client_1.UserSelectionType.NEW,
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
        if (coverPhoto) {
            const key = (0, handelFile_1.extractKeyFromUrl)(coverPhoto);
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
                { agency_email: { contains: search, mode: 'insensitive' } },
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
    let coverPhoto = existingAgency.cover_photo;
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
        // Handle cover photo update - find cover_photo file from array
        const coverPhotoFile = files === null || files === void 0 ? void 0 : files.find((file) => file.fieldname === 'cover_photo');
        if (coverPhotoFile) {
            // Delete old cover photo if exists
            if (existingAgency.cover_photo) {
                const key = (0, handelFile_1.extractKeyFromUrl)(existingAgency.cover_photo);
                if (key)
                    yield (0, handelFile_1.deleteFromSpaces)(key).catch(() => { });
            }
            const coverPhotoUploadResult = yield (0, handelFile_1.uploadToSpaces)(coverPhotoFile, {
                folder: 'agency-cover-photos',
                filename: `agency_cover_${Date.now()}${path_1.default.extname(coverPhotoFile.originalname)}`,
            });
            coverPhoto = (coverPhotoUploadResult === null || coverPhotoUploadResult === void 0 ? void 0 : coverPhotoUploadResult.url) || null;
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
        const updateData = Object.assign(Object.assign(Object.assign({}, payload), { logo, cover_photo: coverPhoto }), (payload.agency_email !== undefined && {
            agency_email: payload.agency_email,
        }));
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
        // Don't delete the user - they might have other agencies or data
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
const GetMyAgency = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.agency.findMany({
        where: {
            is_deleted: false,
            user_id: user.id,
        },
        select: {
            id: true,
            name: true,
        },
        orderBy: {
            name: 'asc',
        },
    });
    return result;
});
const UploadSuccessStory = (payload, files) => __awaiter(void 0, void 0, void 0, function* () {
    const { agency_id } = payload;
    // Verify agency exists and user has permission
    const agency = yield prisma_1.default.agency.findUnique({
        where: { id: agency_id, is_deleted: false },
    });
    if (!agency) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Agency not found');
    }
    if (!files || files.length === 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'At least one image is required');
    }
    let uploadedSuccessStories = [];
    try {
        // Upload new success story images
        const uploadPromises = files.map((file, index) => (0, handelFile_1.uploadToSpaces)(file, {
            folder: 'agency-success-stories',
            filename: `success_story_${Date.now()}_${index}${path_1.default.extname(file.originalname)}`,
        }));
        const uploadResults = yield Promise.all(uploadPromises);
        uploadedSuccessStories = uploadResults
            .map((result) => result === null || result === void 0 ? void 0 : result.url)
            .filter((url) => url !== undefined);
        // Create success story records
        const successStoryData = uploadedSuccessStories.map((imageUrl) => ({
            agency_id,
            image: imageUrl,
        }));
        yield prisma_1.default.agencySuccessStory.createMany({
            data: successStoryData,
        });
        // Return the created success stories
        const createdStories = yield prisma_1.default.agencySuccessStory.findMany({
            where: { agency_id },
            orderBy: { id: 'desc' },
            take: uploadedSuccessStories.length,
        });
        return createdStories;
    }
    catch (error) {
        // Clean up uploaded files on error
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
const ReplaceSuccessStory = (id, files) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the existing success story
    const existingStory = yield prisma_1.default.agencySuccessStory.findUnique({
        where: { id },
    });
    if (!existingStory) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Success story not found');
    }
    if (!files || files.length === 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Image file is required');
    }
    const file = files[0]; // Take the first file
    let newImageUrl = null;
    try {
        // Upload new image
        const uploadResult = yield (0, handelFile_1.uploadToSpaces)(file, {
            folder: 'agency-success-stories',
            filename: `success_story_${Date.now()}${path_1.default.extname(file.originalname)}`,
        });
        newImageUrl = (uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.url) || null;
        if (!newImageUrl) {
            throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to upload image');
        }
        // Update the success story
        const result = yield prisma_1.default.agencySuccessStory.update({
            where: { id },
            data: { image: newImageUrl },
        });
        // Delete old image from cloud storage
        const oldKey = (0, handelFile_1.extractKeyFromUrl)(existingStory.image);
        if (oldKey) {
            yield (0, handelFile_1.deleteFromSpaces)(oldKey).catch(() => { });
        }
        return result;
    }
    catch (error) {
        // Clean up newly uploaded file on error
        if (newImageUrl) {
            const key = (0, handelFile_1.extractKeyFromUrl)(newImageUrl);
            if (key)
                yield (0, handelFile_1.deleteFromSpaces)(key).catch(() => { });
        }
        throw error;
    }
});
const DeleteSuccessStory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the existing success story
    const existingStory = yield prisma_1.default.agencySuccessStory.findUnique({
        where: { id },
    });
    if (!existingStory) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Success story not found');
    }
    // Delete from database
    yield prisma_1.default.agencySuccessStory.delete({
        where: { id },
    });
    // Delete image from cloud storage
    const key = (0, handelFile_1.extractKeyFromUrl)(existingStory.image);
    if (key) {
        yield (0, handelFile_1.deleteFromSpaces)(key).catch(() => {
            console.error('Failed to delete image from DigitalOcean Spaces');
        });
    }
    return { message: 'Success story deleted successfully' };
});
exports.AgencyService = {
    CreateAgency,
    GetAllAgency,
    GetAgencyStats,
    GetSingleAgency,
    UpdateAgency,
    DeleteAgency,
    GetMyAgency,
    UploadSuccessStory,
    ReplaceSuccessStory,
    DeleteSuccessStory,
};

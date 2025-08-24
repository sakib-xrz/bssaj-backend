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
exports.JobService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const pagination_1 = __importDefault(require("../../utils/pagination"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const path_1 = __importDefault(require("path"));
const handelFile_1 = require("../../utils/handelFile");
const job_constant_1 = __importDefault(require("./job.constant"));
const CreateJob = (payload, file, user) => __awaiter(void 0, void 0, void 0, function* () {
    let companyLogoUrl = null;
    try {
        // Validate user exists
        const isValidUser = yield prisma_1.default.user.findUnique({
            where: { id: user === null || user === void 0 ? void 0 : user.id },
            include: {
                agencies: {
                    where: {
                        status: 'APPROVED',
                        subscription_status: client_1.SubscriptionStatus.ACTIVE,
                    },
                },
            },
        });
        if (!isValidUser) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
        }
        // Check authorization: only admin, super_admin, and approved active agencies can post
        const isAdmin = (user === null || user === void 0 ? void 0 : user.role) === client_1.Role.SUPER_ADMIN || (user === null || user === void 0 ? void 0 : user.role) === client_1.Role.ADMIN;
        const hasActiveAgency = isValidUser.agencies.length > 0;
        if (!isAdmin && !hasActiveAgency) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Only admins and approved agencies with active subscription can post jobs');
        }
        // If agency is posting, validate agency and set agency id
        if (payload.posted_by_agency_id) {
            const agency = yield prisma_1.default.agency.findFirst({
                where: {
                    id: payload.posted_by_agency_id,
                    user_id: user === null || user === void 0 ? void 0 : user.id,
                    status: 'APPROVED',
                    subscription_status: client_1.SubscriptionStatus.ACTIVE,
                },
            });
            if (!agency) {
                throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Agency not found or not authorized to post jobs');
            }
        }
        // Handle file upload if present
        if (file) {
            const uploadResult = yield (0, handelFile_1.uploadToSpaces)(file, {
                folder: 'jobs/company-logos',
                filename: `company_logo_${Date.now()}${path_1.default.extname(file.originalname)}`,
            });
            companyLogoUrl = (uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.url) || null;
        }
        const result = yield prisma_1.default.job.create({
            data: Object.assign(Object.assign({}, payload), { posted_by_id: user === null || user === void 0 ? void 0 : user.id, company_logo: companyLogoUrl }),
            include: {
                posted_by_agency: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                    },
                },
                approved_by: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return result;
    }
    catch (error) {
        if (companyLogoUrl) {
            const key = (0, handelFile_1.extractKeyFromUrl)(companyLogoUrl);
            if (key) {
                yield (0, handelFile_1.deleteFromSpaces)(key).catch(() => { });
            }
        }
        throw error;
    }
});
const GetAllJobs = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, kind, type, posted_by_id, posted_by_agency_id, is_approved, company_name, } = query;
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const andCondition = [{ is_deleted: false }];
    if (search) {
        andCondition.push({
            OR: job_constant_1.default.searchableFields.map((field) => ({
                [field]: { contains: search, mode: 'insensitive' },
            })),
        });
    }
    if (kind) {
        andCondition.push({ kind });
    }
    if (type) {
        andCondition.push({ type });
    }
    if (posted_by_id) {
        andCondition.push({ posted_by_id });
    }
    if (posted_by_agency_id) {
        andCondition.push({ posted_by_agency_id });
    }
    if (is_approved !== undefined) {
        andCondition.push({
            approved_at: is_approved === 'true' ? { not: null } : null,
        });
    }
    if (company_name) {
        andCondition.push({
            company_name: { contains: company_name, mode: 'insensitive' },
        });
    }
    const whereCondition = { AND: andCondition };
    const result = yield prisma_1.default.job.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sort_by && sort_order
            ? { [sort_by]: sort_order }
            : { created_at: 'desc' },
        include: {
            posted_by_agency: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                },
            },
            approved_by: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
    const total = yield prisma_1.default.job.count({
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
const GetSingleJob = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const job = yield prisma_1.default.job.findFirst({
        where: {
            id,
            is_deleted: false,
        },
        include: {
            posted_by_agency: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    contact_email: true,
                    contact_phone: true,
                    website: true,
                },
            },
            approved_by: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
    if (!job) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Job not found');
    }
    return job;
});
const UpdateJob = (id, payload, file, user) => __awaiter(void 0, void 0, void 0, function* () {
    const job = yield prisma_1.default.job.findUnique({
        where: { id, is_deleted: false },
    });
    if (!job) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Job not found');
    }
    // Check authorization: admins can update any job, others can only update their own
    const isAdmin = (user === null || user === void 0 ? void 0 : user.role) === client_1.Role.SUPER_ADMIN || (user === null || user === void 0 ? void 0 : user.role) === client_1.Role.ADMIN;
    const isOwner = job.posted_by_id === (user === null || user === void 0 ? void 0 : user.id);
    if (!isAdmin && !isOwner) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You can only update your own jobs');
    }
    // If already approved, only admins can update
    if (job.approved_at && !isAdmin) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Cannot update approved jobs. Contact admin for changes.');
    }
    let companyLogoUrl = null;
    try {
        if (file) {
            if (job.company_logo) {
                const oldKey = (0, handelFile_1.extractKeyFromUrl)(job.company_logo);
                if (oldKey) {
                    yield (0, handelFile_1.deleteFromSpaces)(oldKey).catch(() => { });
                }
            }
            const uploadResult = yield (0, handelFile_1.uploadToSpaces)(file, {
                folder: 'jobs/company-logos',
                filename: `company_logo_${Date.now()}${path_1.default.extname(file.originalname)}`,
            });
            companyLogoUrl = (uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.url) || null;
        }
        const result = yield prisma_1.default.job.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign({}, payload), (companyLogoUrl && { company_logo: companyLogoUrl })), (!isAdmin &&
                job.approved_at && {
                approved_at: null,
                approved_by_id: null,
            })),
            include: {
                posted_by_agency: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                    },
                },
                approved_by: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return result;
    }
    catch (error) {
        if (companyLogoUrl) {
            const key = (0, handelFile_1.extractKeyFromUrl)(companyLogoUrl);
            if (key) {
                yield (0, handelFile_1.deleteFromSpaces)(key).catch(() => { });
            }
        }
        throw error;
    }
});
const DeleteJob = (id, isHardDelete, user) => __awaiter(void 0, void 0, void 0, function* () {
    const job = yield prisma_1.default.job.findUnique({
        where: { id },
    });
    if (!job) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Job not found');
    }
    // Check authorization: admins can delete any job, others can only delete their own
    const isAdmin = (user === null || user === void 0 ? void 0 : user.role) === client_1.Role.SUPER_ADMIN || (user === null || user === void 0 ? void 0 : user.role) === client_1.Role.ADMIN;
    const isOwner = job.posted_by_id === (user === null || user === void 0 ? void 0 : user.id);
    if (!isAdmin && !isOwner) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You can only delete your own jobs');
    }
    if (isHardDelete) {
        if (job.company_logo) {
            const imageKey = (0, handelFile_1.extractKeyFromUrl)(job.company_logo);
            if (imageKey) {
                yield (0, handelFile_1.deleteFromSpaces)(imageKey).catch(() => { });
            }
        }
        yield prisma_1.default.job.delete({
            where: { id },
        });
    }
    else {
        yield prisma_1.default.job.update({
            where: { id },
            data: { is_deleted: true },
        });
    }
    return null;
});
const GetMyJobs = (userId, query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, kind, type, is_approved } = query;
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const andCondition = [
        { is_deleted: false },
        { posted_by_id: userId },
    ];
    if (search) {
        andCondition.push({
            OR: job_constant_1.default.searchableFields.map((field) => ({
                [field]: { contains: search, mode: 'insensitive' },
            })),
        });
    }
    if (kind) {
        andCondition.push({ kind });
    }
    if (type) {
        andCondition.push({ type });
    }
    if (is_approved !== undefined) {
        andCondition.push({
            approved_at: is_approved === 'true' ? { not: null } : null,
        });
    }
    const whereCondition = { AND: andCondition };
    const result = yield prisma_1.default.job.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sort_by && sort_order
            ? { [sort_by]: sort_order }
            : { created_at: 'desc' },
        include: {
            posted_by_agency: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                },
            },
            approved_by: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
    const total = yield prisma_1.default.job.count({
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
exports.JobService = {
    CreateJob,
    GetAllJobs,
    GetSingleJob,
    UpdateJob,
    DeleteJob,
    GetMyJobs,
};

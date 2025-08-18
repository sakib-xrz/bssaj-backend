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
exports.BannerService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const pagination_1 = __importDefault(require("../../utils/pagination"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const path_1 = __importDefault(require("path"));
const handelFile_1 = require("../../utils/handelFile");
const CreateBanner = (payload, file, user) => __awaiter(void 0, void 0, void 0, function* () {
    let imageUrl = null;
    if (user) {
        const isAdmin = user.role === client_1.Role.SUPER_ADMIN || user.role === client_1.Role.ADMIN;
        if (!isAdmin) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Only admins can create banners');
        }
    }
    try {
        if (file) {
            const uploadResult = yield (0, handelFile_1.uploadToSpaces)(file, {
                folder: 'banners/images',
                filename: `banner_image_${Date.now()}${path_1.default.extname(file.originalname)}`,
            });
            imageUrl = (uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.url) || null;
        }
        if (!imageUrl) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Banner image is required');
        }
        const result = yield prisma_1.default.banner.create({
            data: Object.assign(Object.assign({}, payload), { image: imageUrl }),
        });
        return result;
    }
    catch (error) {
        if (imageUrl) {
            const key = (0, handelFile_1.extractKeyFromUrl)(imageUrl);
            if (key) {
                yield (0, handelFile_1.deleteFromSpaces)(key).catch(() => { });
            }
        }
        throw error;
    }
});
const GetAllBanner = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search } = query;
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const andCondition = [];
    if (search) {
        andCondition.push({
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ],
        });
    }
    const whereCondition = andCondition.length > 0 ? { AND: andCondition } : {};
    const result = yield prisma_1.default.banner.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sort_by && sort_order
            ? { [sort_by]: sort_order }
            : { created_at: 'desc' },
    });
    const total = yield prisma_1.default.banner.count({
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
const GetSingleBanner = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const banner = yield prisma_1.default.banner.findUnique({
        where: { id },
    });
    if (!banner) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Banner not found');
    }
    return banner;
});
const UpdateBanner = (id, payload, file, user) => __awaiter(void 0, void 0, void 0, function* () {
    const banner = yield prisma_1.default.banner.findUnique({
        where: { id },
    });
    if (!banner) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Banner not found');
    }
    if (user) {
        const isAdmin = user.role === client_1.Role.SUPER_ADMIN || user.role === client_1.Role.ADMIN;
        if (!isAdmin) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Only admins can update banners');
        }
    }
    let imageUrl = null;
    try {
        if (file) {
            if (banner.image) {
                const oldKey = (0, handelFile_1.extractKeyFromUrl)(banner.image);
                if (oldKey) {
                    yield (0, handelFile_1.deleteFromSpaces)(oldKey).catch(() => { });
                }
            }
            const uploadResult = yield (0, handelFile_1.uploadToSpaces)(file, {
                folder: 'banners/images',
                filename: `banner_image_${Date.now()}${path_1.default.extname(file.originalname)}`,
            });
            imageUrl = (uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.url) || null;
        }
        const result = yield prisma_1.default.banner.update({
            where: { id },
            data: Object.assign(Object.assign({}, payload), (imageUrl && { image: imageUrl })),
        });
        return result;
    }
    catch (error) {
        if (imageUrl) {
            const key = (0, handelFile_1.extractKeyFromUrl)(imageUrl);
            if (key) {
                yield (0, handelFile_1.deleteFromSpaces)(key).catch(() => { });
            }
        }
        throw error;
    }
});
const DeleteBanner = (id, user) => __awaiter(void 0, void 0, void 0, function* () {
    const banner = yield prisma_1.default.banner.findUnique({
        where: { id },
    });
    if (!banner) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Banner not found');
    }
    if (user) {
        const isAdmin = user.role === client_1.Role.SUPER_ADMIN || user.role === client_1.Role.ADMIN;
        if (!isAdmin) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Only admins can delete banners');
        }
    }
    if (banner.image) {
        const imageKey = (0, handelFile_1.extractKeyFromUrl)(banner.image);
        if (imageKey) {
            yield (0, handelFile_1.deleteFromSpaces)(imageKey).catch(() => { });
        }
    }
    yield prisma_1.default.banner.delete({
        where: { id },
    });
    return null;
});
exports.BannerService = {
    CreateBanner,
    GetAllBanner,
    GetSingleBanner,
    UpdateBanner,
    DeleteBanner,
};

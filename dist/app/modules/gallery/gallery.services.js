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
exports.GalleryService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const pagination_1 = __importDefault(require("../../utils/pagination"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const path_1 = __importDefault(require("path"));
const handelFile_1 = require("../../utils/handelFile");
const CreateGallery = (payload, file, user) => __awaiter(void 0, void 0, void 0, function* () {
    let imageUrl = null;
    if (user) {
        const isAdmin = user.role === client_1.Role.SUPER_ADMIN || user.role === client_1.Role.ADMIN;
        if (!isAdmin) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Only admins can create gallery items');
        }
    }
    try {
        if (file) {
            const uploadResult = yield (0, handelFile_1.uploadToSpaces)(file, {
                folder: 'gallery/images',
                filename: `gallery_image_${Date.now()}${path_1.default.extname(file.originalname)}`,
            });
            imageUrl = (uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.url) || null;
        }
        if (!imageUrl) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Gallery image is required');
        }
        const result = yield prisma_1.default.gallery.create({
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
const GetAllGallery = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search } = query;
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const andCondition = [];
    if (search) {
        andCondition.push({
            OR: [{ title: { contains: search, mode: 'insensitive' } }],
        });
    }
    const whereCondition = andCondition.length > 0 ? { AND: andCondition } : {};
    const result = yield prisma_1.default.gallery.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sort_by && sort_order
            ? { [sort_by]: sort_order }
            : { created_at: 'desc' },
    });
    const total = yield prisma_1.default.gallery.count({
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
const GetSingleGallery = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const gallery = yield prisma_1.default.gallery.findUnique({
        where: { id },
    });
    if (!gallery) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Gallery item not found');
    }
    return gallery;
});
const UpdateGallery = (id, payload, file, user) => __awaiter(void 0, void 0, void 0, function* () {
    const gallery = yield prisma_1.default.gallery.findUnique({
        where: { id },
    });
    if (!gallery) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Gallery item not found');
    }
    if (user) {
        const isAdmin = user.role === client_1.Role.SUPER_ADMIN || user.role === client_1.Role.ADMIN;
        if (!isAdmin) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Only admins can update gallery items');
        }
    }
    let imageUrl = null;
    try {
        if (file) {
            if (gallery.image) {
                const oldKey = (0, handelFile_1.extractKeyFromUrl)(gallery.image);
                if (oldKey) {
                    yield (0, handelFile_1.deleteFromSpaces)(oldKey).catch(() => { });
                }
            }
            const uploadResult = yield (0, handelFile_1.uploadToSpaces)(file, {
                folder: 'gallery/images',
                filename: `gallery_image_${Date.now()}${path_1.default.extname(file.originalname)}`,
            });
            imageUrl = (uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.url) || null;
        }
        const result = yield prisma_1.default.gallery.update({
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
const DeleteGallery = (id, user) => __awaiter(void 0, void 0, void 0, function* () {
    const gallery = yield prisma_1.default.gallery.findUnique({
        where: { id },
    });
    if (!gallery) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Gallery item not found');
    }
    if (user) {
        const isAdmin = user.role === client_1.Role.SUPER_ADMIN || user.role === client_1.Role.ADMIN;
        if (!isAdmin) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Only admins can delete gallery items');
        }
    }
    if (gallery.image) {
        const imageKey = (0, handelFile_1.extractKeyFromUrl)(gallery.image);
        if (imageKey) {
            yield (0, handelFile_1.deleteFromSpaces)(imageKey).catch(() => { });
        }
    }
    yield prisma_1.default.gallery.delete({
        where: { id },
    });
    return null;
});
exports.GalleryService = {
    CreateGallery,
    GetAllGallery,
    GetSingleGallery,
    UpdateGallery,
    DeleteGallery,
};

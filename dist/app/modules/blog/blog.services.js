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
exports.BlogService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const pagination_1 = __importDefault(require("../../utils/pagination"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const path_1 = __importDefault(require("path"));
const handelFile_1 = require("../../utils/handelFile");
const blog_utils_1 = __importDefault(require("./blog.utils"));
const CreateBlog = (payload, file, user) => __awaiter(void 0, void 0, void 0, function* () {
    let coverImageUrl = null;
    try {
        // Validate author exists
        const isValidUser = yield prisma_1.default.user.findUnique({
            where: { id: user === null || user === void 0 ? void 0 : user.id },
        });
        if (!isValidUser) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Author not found');
        }
        // Handle file upload if present
        if (file) {
            const uploadResult = yield (0, handelFile_1.uploadToSpaces)(file, {
                folder: 'blogs/covers',
                filename: `blog_cover_${Date.now()}${path_1.default.extname(file.originalname)}`,
            });
            coverImageUrl = (uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.url) || null;
        }
        // Generate unique slug if not provided
        const slug = yield blog_utils_1.default.generateUniqueSlug(payload.title, prisma_1.default);
        const result = yield prisma_1.default.blog.create({
            data: Object.assign(Object.assign({}, payload), { author_id: user === null || user === void 0 ? void 0 : user.id, slug, cover_image: coverImageUrl }),
            include: {
                author: {
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
        if (coverImageUrl) {
            const key = (0, handelFile_1.extractKeyFromUrl)(coverImageUrl);
            if (key) {
                yield (0, handelFile_1.deleteFromSpaces)(key).catch(() => { });
            }
        }
        throw error;
    }
});
const GetAllBlog = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, is_published, is_approved, author_id } = query;
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const andCondition = [{ is_deleted: false }];
    if (search) {
        andCondition.push({
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ],
        });
    }
    if (is_published !== undefined) {
        andCondition.push({ is_published: is_published === 'true' });
    }
    if (is_approved !== undefined) {
        andCondition.push({ is_approved: is_approved === 'true' });
    }
    if (author_id) {
        andCondition.push({ author_id });
    }
    const whereCondition = { AND: andCondition };
    const result = yield prisma_1.default.blog.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sort_by && sort_order
            ? { [sort_by]: sort_order }
            : { created_at: 'desc' },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profile_picture: true,
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
    const total = yield prisma_1.default.blog.count({
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
const GetSingleBlog = (identifier) => __awaiter(void 0, void 0, void 0, function* () {
    const blog = yield prisma_1.default.blog.findFirst({
        where: {
            OR: [{ id: identifier }, { slug: identifier }],
            is_deleted: false,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profile_picture: true,
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
    if (!blog) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Blog not found');
    }
    return blog;
});
const UpdateBlog = (id, payload, file, user) => __awaiter(void 0, void 0, void 0, function* () {
    const blog = yield prisma_1.default.blog.findUnique({
        where: { id, is_deleted: false },
    });
    if (!blog) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Blog not found');
    }
    // Check authorization: admins can update any blog, others can only update their own
    if (user) {
        const isAdmin = user.role === client_1.Role.SUPER_ADMIN || user.role === client_1.Role.ADMIN;
        const isOwner = blog.author_id === user.id;
        if (!isAdmin && !isOwner) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You can only update your own blogs');
        }
    }
    let coverImageUrl = null;
    try {
        if (file) {
            if (blog.cover_image) {
                const oldKey = (0, handelFile_1.extractKeyFromUrl)(blog.cover_image);
                if (oldKey) {
                    yield (0, handelFile_1.deleteFromSpaces)(oldKey).catch(() => { });
                }
            }
            const uploadResult = yield (0, handelFile_1.uploadToSpaces)(file, {
                folder: 'blogs/covers',
                filename: `blog_cover_${Date.now()}${path_1.default.extname(file.originalname)}`,
            });
            coverImageUrl = (uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.url) || null;
        }
        let updatedSlug = payload.slug;
        if (payload.title && payload.title !== blog.title) {
            updatedSlug = yield blog_utils_1.default.generateUniqueSlug(payload.title, prisma_1.default, id);
        }
        const result = yield prisma_1.default.blog.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign({}, payload), (updatedSlug && { slug: updatedSlug })), (coverImageUrl && { cover_image: coverImageUrl })),
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profile_picture: true,
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
        if (coverImageUrl) {
            const key = (0, handelFile_1.extractKeyFromUrl)(coverImageUrl);
            if (key) {
                yield (0, handelFile_1.deleteFromSpaces)(key).catch(() => { });
            }
        }
        throw error;
    }
});
const DeleteBlog = (id, isHardDelete, user) => __awaiter(void 0, void 0, void 0, function* () {
    const blog = yield prisma_1.default.blog.findUnique({
        where: { id },
    });
    if (!blog) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Blog not found');
    }
    // Check authorization: admins can delete any blog, others can only delete their own
    if (user) {
        const isAdmin = user.role === client_1.Role.SUPER_ADMIN || user.role === client_1.Role.ADMIN;
        const isOwner = blog.author_id === user.id;
        if (!isAdmin && !isOwner) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You can only delete your own blogs');
        }
    }
    if (isHardDelete) {
        if (blog.cover_image) {
            const imageKey = (0, handelFile_1.extractKeyFromUrl)(blog.cover_image);
            if (imageKey) {
                yield (0, handelFile_1.deleteFromSpaces)(imageKey).catch(() => { });
            }
        }
        yield prisma_1.default.blog.delete({
            where: { id },
        });
    }
    else {
        yield prisma_1.default.blog.update({
            where: { id },
            data: { is_deleted: true },
        });
    }
    return null;
});
const GetMyBlogs = (userId, query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, is_published, is_approved } = query;
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const andCondition = [
        { is_deleted: false },
        { author_id: userId },
    ];
    if (search) {
        andCondition.push({
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ],
        });
    }
    if (is_published !== undefined) {
        andCondition.push({ is_published: is_published === 'true' });
    }
    if (is_approved !== undefined) {
        andCondition.push({ is_approved: is_approved === 'true' });
    }
    const whereCondition = { AND: andCondition };
    const result = yield prisma_1.default.blog.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sort_by && sort_order
            ? { [sort_by]: sort_order }
            : { created_at: 'desc' },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profile_picture: true,
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
    const total = yield prisma_1.default.blog.count({
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
exports.BlogService = {
    CreateBlog,
    GetAllBlog,
    GetSingleBlog,
    UpdateBlog,
    DeleteBlog,
    GetMyBlogs,
};

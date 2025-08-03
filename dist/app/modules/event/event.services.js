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
exports.EventService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const pagination_1 = __importDefault(require("../../utils/pagination"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const path_1 = __importDefault(require("path"));
const handelFile_1 = require("../../utils/handelFile");
const CreateEvent = (payload, file, user) => __awaiter(void 0, void 0, void 0, function* () {
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
                folder: 'events/covers',
                filename: `event_cover_${Date.now()}${path_1.default.extname(file.originalname)}`,
            });
            coverImageUrl = (uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.url) || null;
        }
        const result = yield prisma_1.default.event.create({
            data: Object.assign(Object.assign({}, payload), { author_id: user === null || user === void 0 ? void 0 : user.id, cover_image: coverImageUrl }),
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
const GetAllEvent = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, author_id } = query;
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const andCondition = [{ is_deleted: false }];
    if (search) {
        andCondition.push({
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
            ],
        });
    }
    if (author_id) {
        andCondition.push({ author_id });
    }
    const whereCondition = { AND: andCondition };
    const result = yield prisma_1.default.event.findMany({
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
        },
    });
    const total = yield prisma_1.default.event.count({
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
const GetSingleEvent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield prisma_1.default.event.findFirst({
        where: {
            id,
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
        },
    });
    if (!event) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    return event;
});
const UpdateEvent = (id, payload, file, user) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield prisma_1.default.event.findUnique({
        where: { id, is_deleted: false },
    });
    if (!event) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    // Check authorization: admins can update any event, others can only update their own
    if (user) {
        const isAdmin = user.role === client_1.Role.SUPER_ADMIN || user.role === client_1.Role.ADMIN;
        const isOwner = event.author_id === user.id;
        if (!isAdmin && !isOwner) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You can only update your own events');
        }
    }
    let coverImageUrl = null;
    try {
        if (file) {
            if (event.cover_image) {
                const oldKey = (0, handelFile_1.extractKeyFromUrl)(event.cover_image);
                if (oldKey) {
                    yield (0, handelFile_1.deleteFromSpaces)(oldKey).catch(() => { });
                }
            }
            const uploadResult = yield (0, handelFile_1.uploadToSpaces)(file, {
                folder: 'events/covers',
                filename: `event_cover_${Date.now()}${path_1.default.extname(file.originalname)}`,
            });
            coverImageUrl = (uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.url) || null;
        }
        const result = yield prisma_1.default.event.update({
            where: { id },
            data: Object.assign(Object.assign({}, payload), (coverImageUrl && { cover_image: coverImageUrl })),
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profile_picture: true,
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
const DeleteEvent = (id, isHardDelete, user) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield prisma_1.default.event.findUnique({
        where: { id },
    });
    if (!event) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    // Check authorization: admins can delete any event, others can only delete their own
    if (user) {
        const isAdmin = user.role === client_1.Role.SUPER_ADMIN || user.role === client_1.Role.ADMIN;
        const isOwner = event.author_id === user.id;
        if (!isAdmin && !isOwner) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You can only delete your own events');
        }
    }
    if (isHardDelete) {
        if (event.cover_image) {
            const imageKey = (0, handelFile_1.extractKeyFromUrl)(event.cover_image);
            if (imageKey) {
                yield (0, handelFile_1.deleteFromSpaces)(imageKey).catch(() => { });
            }
        }
        yield prisma_1.default.event.delete({
            where: { id },
        });
    }
    else {
        yield prisma_1.default.event.update({
            where: { id },
            data: { is_deleted: true },
        });
    }
    return null;
});
exports.EventService = {
    CreateEvent,
    GetAllEvent,
    GetSingleEvent,
    UpdateEvent,
    DeleteEvent,
};

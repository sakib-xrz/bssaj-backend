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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const client_1 = require("@prisma/client");
const pagination_1 = __importDefault(require("../../utils/pagination"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const path_1 = __importDefault(require("path"));
const handelFile_1 = require("../../utils/handelFile");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CreateUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name } = data, rest = __rest(data, ["email", "password", "name"]);
    // Check if user already exists
    const existingUser = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new Error('User already exists');
    }
    // Hash password
    const hashedPassword = yield bcrypt_1.default.hash(password, Number(config_1.default.bcrypt_salt_rounds));
    // Create user
    const result = yield prisma_1.default.user.create({
        data: Object.assign({ email,
            name, password: hashedPassword }, rest),
    });
    return {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        created_at: result.created_at,
    };
});
const GetAllUser = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search } = query, filterData = __rest(query, ["search"]);
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const andCondition = [];
    if (search) {
        andCondition.push({
            OR: ['name', 'email'].map((field) => ({
                [field]: {
                    contains: query.search,
                    mode: 'insensitive',
                },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andCondition.push({
            AND: Object.keys(filterData).map((field) => ({
                [field]: {
                    equals: filterData[field],
                    mode: 'insensitive',
                },
            })),
        });
    }
    const whereCondition = { AND: andCondition };
    const result = yield prisma_1.default.user.findMany({
        where: whereCondition,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            created_at: true,
        },
        skip,
        take: limit,
        orderBy: sort_by && sort_order ? { [sort_by]: sort_order } : { created_at: 'asc' },
    });
    const total = yield prisma_1.default.user.count({
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
const GetUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            address: true,
        },
    });
    if (!result) {
        throw new Error('User not found');
    }
    return result;
});
const SearchUser = (search) => __awaiter(void 0, void 0, void 0, function* () {
    if (!search || search.trim().length === 0) {
        return [];
    }
    const result = yield prisma_1.default.user.findMany({
        where: {
            OR: [
                { name: { contains: search.trim(), mode: 'insensitive' } },
                { email: { contains: search.trim(), mode: 'insensitive' } },
            ],
            role: {
                not: client_1.Role.SUPER_ADMIN,
            },
            member: null,
            is_deleted: false,
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
        take: 20,
    });
    return result;
});
const UpdateUser = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: { id },
    });
    if (!userData) {
        throw new Error('User not found');
    }
    const result = yield prisma_1.default.user.update({
        where: { id },
        data: {
            name: data.name || userData.name,
            address: data.address || userData.address,
            current_study_info: data.current_study_info || userData.current_study_info,
        },
    });
    result === null || result === void 0 ? true : delete result.password;
    return result;
});
const UpdateProfilePicture = (id, file) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: { id },
    });
    if (!userData) {
        throw new Error('User not found');
    }
    let profilePicture = userData.profile_picture || null;
    try {
        if (userData.profile_picture) {
            const key = (0, handelFile_1.extractKeyFromUrl)(userData.profile_picture);
            if (key) {
                yield (0, handelFile_1.deleteFromSpaces)(key);
            }
        }
        const uploadResult = yield (0, handelFile_1.uploadToSpaces)(file, {
            folder: 'profile-pictures',
            filename: `profile_picture_${Date.now()}${path_1.default.extname(file.originalname)}`,
        });
        profilePicture = (uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.url) || null;
    }
    catch (error) {
        console.log('Error from DigitalOcean Spaces while uploading profile picture', error);
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to upload profile picture');
    }
    const result = yield prisma_1.default.user.update({
        where: { id },
        data: { profile_picture: profilePicture },
    });
    result === null || result === void 0 ? true : delete result.password;
    return result;
});
const DeleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.notification.deleteMany({
            where: { user_id: id },
        });
        yield tx.payment.updateMany({
            where: { approved_by_id: id },
            data: { approved_by_id: null },
        });
        yield tx.member.updateMany({
            where: { approved_by_id: id },
            data: { approved_by_id: null },
        });
        yield tx.blog.updateMany({
            where: { approved_by_id: id },
            data: { approved_by_id: null },
        });
        yield tx.agency.updateMany({
            where: { approved_by_id: id },
            data: { approved_by_id: null },
        });
        yield tx.agencySuccessStory.deleteMany({
            where: { agency_id: id },
        });
        yield tx.agency.deleteMany({
            where: { user_id: id },
        });
        yield tx.payment.deleteMany({
            where: { user_id: id },
        });
        yield tx.blog.deleteMany({
            where: { author_id: id },
        });
        yield tx.certification.deleteMany({
            where: { student_id: id },
        });
        yield tx.examRegistration.deleteMany({
            where: { user_id: id },
        });
        yield tx.member
            .delete({
            where: { user_id: id },
        })
            .catch(() => { });
        yield tx.agency
            .deleteMany({
            where: { user_id: id },
        })
            .catch(() => { });
        yield tx.user.delete({
            where: { id },
        });
    }));
    return transaction;
});
exports.UserService = {
    CreateUser,
    GetAllUser,
    GetUserById,
    SearchUser,
    UpdateUser,
    UpdateProfilePicture,
    DeleteUser,
};

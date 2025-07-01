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
exports.MembersService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const pagination_1 = __importDefault(require("../../utils/pagination"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const member_constant_1 = require("./member.constant");
const member_utils_1 = __importDefault(require("./member.utils"));
const CreateMember = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: {
            id: payload.user_id,
        },
    });
    if (!user) {
        throw new Error('User not found');
    }
    const memberId = yield member_utils_1.default.GenerateMemberId(payload.kind);
    const information = {
        member_id: memberId,
        user_id: payload.user_id,
        name: user.name,
        email: user.email,
        phone: payload.phone,
        kind: payload.kind,
    };
    const result = yield prisma_1.default.member.create({
        data: information,
    });
    return result;
});
const GetSingleMember = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingMember = yield prisma_1.default.member.findUnique({
        where: {
            id: id,
            is_deleted: false,
        },
        select: {
            id: true,
            member_id: true,
            name: true,
            email: true,
            phone: true,
            kind: true,
            status: true,
            approved_at: true,
            approved_by: {
                select: {
                    id: true,
                    name: true,
                },
            },
            created_at: true,
            updated_at: true,
            user: {
                select: {
                    id: true,
                    role: true,
                    profile_picture: true,
                },
            },
        },
    });
    if (!existingMember) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Invalid Member Id');
    }
    return existingMember;
});
const GetAllMember = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search } = query, filterData = __rest(query, ["search"]);
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const andCondition = [];
    if (search) {
        andCondition.push({
            OR: member_constant_1.memberSearchableFields.map((field) => ({
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
    const result = yield prisma_1.default.member.findMany({
        where: whereCondition,
        select: {
            id: true,
            name: true,
            email: true,
            kind: true,
            phone: true,
            status: true,
            approved_at: true,
            created_at: true,
            user: {
                select: {
                    profile_picture: true,
                },
            },
            approved_by: {
                select: {
                    name: true,
                },
            },
        },
        skip,
        take: limit,
        orderBy: sort_by && sort_order ? { [sort_by]: sort_order } : { created_at: 'asc' },
    });
    const total = yield prisma_1.default.member.count({
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
const GetMemberStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalMember = yield prisma_1.default.member.count({
        where: {
            is_deleted: false,
        },
    });
    const totalApprovedMember = yield prisma_1.default.member.count({
        where: {
            is_deleted: false,
            status: 'APPROVED',
        },
    });
    const totalPendingMember = yield prisma_1.default.member.count({
        where: {
            is_deleted: false,
            status: 'PENDING',
        },
    });
    return {
        total_members: totalMember,
        total_approved_members: totalApprovedMember,
        total_pending_members: totalPendingMember,
    };
});
const UpdateMember = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const member = yield prisma_1.default.member.findUnique({
        where: {
            id,
        },
    });
    if (!member) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Invalid member id');
    }
    if (member.is_deleted === true) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'This member is already deleted!');
    }
    const result = yield prisma_1.default.member.update({
        where: {
            id: id,
        },
        data: payload,
    });
    return result;
});
const DeleteMember = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingMember = yield prisma_1.default.member.findUnique({
        where: {
            id: id,
        },
    });
    if (!existingMember) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'This member is not found!');
    }
    yield prisma_1.default.member.delete({
        where: {
            id: id,
        },
    });
    return null;
});
exports.MembersService = {
    CreateMember,
    GetSingleMember,
    GetAllMember,
    GetMemberStats,
    UpdateMember,
    DeleteMember,
};

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
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const pagination_1 = __importDefault(require("../../utils/pagination"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const CreateEvent = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield prisma_1.default.user.findUnique({
        where: {
            id: payload.author_id
        }
    });
    if (!isExistUser) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const reuslt = yield prisma_1.default.event.create({
        data: payload
    });
    return reuslt;
});
const GetAllEvent = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search } = query;
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const andCondition = [];
    if (search) {
        andCondition.push({
            OR: ['title', 'description'].map((field) => ({
                [field]: {
                    contains: search,
                    mode: 'insensitive',
                },
            })),
        });
    }
    const whereCondition = { AND: andCondition };
    const result = yield prisma_1.default.event.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sort_by && sort_order ? { [sort_by]: sort_order } : { created_at: 'desc' },
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
    const result = yield prisma_1.default.event.findUnique({
        where: {
            id
        }
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    return result;
});
const UpdateEvent = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistEvent = yield prisma_1.default.event.findUnique({
        where: {
            id
        }
    });
    if (!isExistEvent) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    const reuslt = yield prisma_1.default.event.update({
        where: {
            id
        },
        data: payload
    });
    return reuslt;
});
const DeleteEvent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistEvent = yield prisma_1.default.event.findUnique({
        where: {
            id
        }
    });
    if (!isExistEvent) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    yield prisma_1.default.event.delete({
        where: { id }
    });
    return null;
});
exports.EventService = {
    CreateEvent,
    GetAllEvent,
    GetSingleEvent,
    UpdateEvent,
    DeleteEvent
};

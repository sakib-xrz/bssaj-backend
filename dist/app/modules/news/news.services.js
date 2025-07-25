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
exports.NewsService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const pagination_1 = __importDefault(require("../../utils/pagination"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const CreateNews = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.news.create({
        data: payload,
    });
    return result;
});
const GetAllNews = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search } = query;
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const andCondition = [{ is_deleted: false }];
    if (search) {
        andCondition.push({
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ],
        });
    }
    const whereCondition = { AND: andCondition };
    const result = yield prisma_1.default.news.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sort_by && sort_order
            ? { [sort_by]: sort_order }
            : { created_at: 'desc' },
    });
    const total = yield prisma_1.default.news.count({
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
const GetSingleNews = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const news = yield prisma_1.default.news.findFirst({
        where: {
            id,
            is_deleted: false,
        },
    });
    if (!news) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'News not found');
    }
    return news;
});
const UpdateNews = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const news = yield prisma_1.default.news.findUnique({
        where: { id, is_deleted: false },
    });
    if (!news) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'News not found');
    }
    const result = yield prisma_1.default.news.update({
        where: { id },
        data: payload,
    });
    return result;
});
const DeleteNews = (id, isHardDelete) => __awaiter(void 0, void 0, void 0, function* () {
    const news = yield prisma_1.default.news.findUnique({
        where: { id },
    });
    if (!news) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'News not found');
    }
    if (isHardDelete) {
        yield prisma_1.default.news.delete({
            where: { id },
        });
    }
    else {
        yield prisma_1.default.news.update({
            where: { id },
            data: { is_deleted: true },
        });
    }
    return null;
});
exports.NewsService = {
    CreateNews,
    GetAllNews,
    GetSingleNews,
    UpdateNews,
    DeleteNews,
};

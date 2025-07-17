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
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const pagination_1 = __importDefault(require("../../utils/pagination"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const path_1 = __importDefault(require("path"));
const handelFile_1 = require("../../utils/handelFile");
const CreateCommittee = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    let profilePictureUrl = null;
    try {
        if (file) {
            const uploadResult = yield (0, handelFile_1.uploadToSpaces)(file, {
                folder: 'committee-profiles',
                filename: `committee_${Date.now()}${path_1.default.extname(file.originalname)}`,
            });
            profilePictureUrl = (uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.url) || null;
        }
        const result = yield prisma_1.default.committee.create({
            data: Object.assign(Object.assign({}, payload), { profile_picture: profilePictureUrl }),
        });
        return result;
    }
    catch (error) {
        if (profilePictureUrl) {
            const key = (0, handelFile_1.extractKeyFromUrl)(profilePictureUrl);
            if (key) {
                yield (0, handelFile_1.deleteFromSpaces)(key).catch(() => { }); // Ignore cleanup errors
            }
        }
        throw error;
    }
});
const GetSingleCommittee = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingCommittee = yield prisma_1.default.committee.findUnique({
        where: {
            id: id,
        },
    });
    if (!existingCommittee) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Invalid Committee Member Id');
    }
    return existingCommittee;
});
const GetAllCommittee = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { term_start_year, term_end_year, search } = query, filterData = __rest(query, ["term_start_year", "term_end_year", "search"]);
    const { limit, page, skip } = (0, pagination_1.default)(options);
    const andCondition = [];
    if (term_start_year && term_end_year) {
        andCondition.push({
            term_start_year: term_start_year,
            term_end_year: term_end_year,
        });
    }
    else if (term_start_year) {
        andCondition.push({
            term_start_year: term_start_year,
        });
    }
    else if (term_end_year) {
        andCondition.push({
            term_end_year: term_end_year,
        });
    }
    if (search) {
        andCondition.push({
            name: {
                contains: search,
                mode: 'insensitive',
            },
        });
    }
    if (Object.keys(filterData).length > 0) {
        andCondition.push({
            AND: Object.keys(filterData).map((field) => ({
                [field]: filterData[field],
            })),
        });
    }
    const whereCondition = andCondition.length > 0 ? { AND: andCondition } : {};
    const designationOrder = [
        'PRESIDENT',
        'SR_VICE_PRESIDENT',
        'VICE_PRESIDENT',
        'GENERAL_SECRETARY',
        'JOINT_GENERAL_SECRETARY',
        'TREASURER',
        'JOINT_TREASURER',
        'EXECUTIVE_MEMBER',
        'ADVISOR',
        'OTHER',
    ];
    const result = yield prisma_1.default.committee.findMany({
        where: whereCondition,
        skip,
        take: limit,
    });
    const sortedResult = result.sort((a, b) => {
        const aIndex = designationOrder.indexOf(a.designation);
        const bIndex = designationOrder.indexOf(b.designation);
        const aOrder = aIndex === -1 ? designationOrder.length : aIndex;
        const bOrder = bIndex === -1 ? designationOrder.length : bIndex;
        return aOrder - bOrder;
    });
    const total = yield prisma_1.default.committee.count({
        where: whereCondition,
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: sortedResult,
    };
});
const UpdateCommittee = (id, payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const committee = yield prisma_1.default.committee.findUnique({
        where: {
            id,
        },
    });
    if (!committee) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Invalid committee member id');
    }
    let profilePictureUrl = null;
    try {
        if (file) {
            if (committee.profile_picture) {
                const oldKey = (0, handelFile_1.extractKeyFromUrl)(committee.profile_picture);
                if (oldKey) {
                    yield (0, handelFile_1.deleteFromSpaces)(oldKey).catch(() => { });
                }
            }
            const uploadResult = yield (0, handelFile_1.uploadToSpaces)(file, {
                folder: 'committee-profiles',
                filename: `committee_${Date.now()}${path_1.default.extname(file.originalname)}`,
            });
            profilePictureUrl = (uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.url) || null;
        }
        const result = yield prisma_1.default.committee.update({
            where: {
                id: id,
            },
            data: Object.assign(Object.assign({}, payload), (profilePictureUrl && { profile_picture: profilePictureUrl })),
        });
        return result;
    }
    catch (error) {
        if (profilePictureUrl) {
            const key = (0, handelFile_1.extractKeyFromUrl)(profilePictureUrl);
            if (key) {
                yield (0, handelFile_1.deleteFromSpaces)(key).catch(() => { }); // Ignore cleanup errors
            }
        }
        throw error;
    }
});
const DeleteCommittee = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingCommittee = yield prisma_1.default.committee.findUnique({
        where: {
            id: id,
        },
    });
    if (!existingCommittee) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This committee member is not found!');
    }
    if (existingCommittee.profile_picture) {
        const key = (0, handelFile_1.extractKeyFromUrl)(existingCommittee.profile_picture);
        if (key) {
            yield (0, handelFile_1.deleteFromSpaces)(key).catch(() => { }); // Ignore cleanup errors
        }
    }
    yield prisma_1.default.committee.delete({
        where: {
            id: id,
        },
    });
    return null;
});
const GetUniqueTermPairs = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.committee.findMany({
        select: {
            term_start_year: true,
            term_end_year: true,
        },
        distinct: ['term_start_year', 'term_end_year'],
        orderBy: [{ term_start_year: 'desc' }, { term_end_year: 'desc' }],
    });
    return result;
});
const CommitteeService = {
    CreateCommittee,
    GetSingleCommittee,
    GetAllCommittee,
    UpdateCommittee,
    DeleteCommittee,
    GetUniqueTermPairs,
};
exports.default = CommitteeService;

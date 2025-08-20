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
exports.CertificationService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const pagination_1 = __importDefault(require("../../utils/pagination"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const path_1 = __importDefault(require("path"));
const handelFile_1 = require("../../utils/handelFile");
const certification_utils_1 = __importDefault(require("./certification.utils"));
const CreateCertification = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    let certificateUrl = null;
    try {
        // Validate agency exists
        const agency = yield prisma_1.default.agency.findUnique({
            where: { id: payload.agency_id },
        });
        if (!agency) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Agency not found');
        }
        // Generate unique sl_no
        const slNo = yield certification_utils_1.default.generateSlNo(payload.agency_id);
        // Handle file upload if present
        if (file) {
            const uploadResult = yield (0, handelFile_1.uploadToSpaces)(file, {
                folder: 'certifications',
                filename: `certificate_${Date.now()}${path_1.default.extname(file.originalname)}`,
            });
            certificateUrl = (uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.url) || null;
        }
        // Convert date strings to Date objects
        const certificationData = Object.assign(Object.assign({}, payload), { sl_no: slNo, date_of_birth: new Date(payload.date_of_birth), issued_at: new Date(payload.issued_at), certificate_url: certificateUrl });
        const result = yield prisma_1.default.certification.create({
            data: certificationData,
            include: {
                agency: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        return result;
    }
    catch (error) {
        // Clean up uploaded file on error
        if (certificateUrl) {
            const key = (0, handelFile_1.extractKeyFromUrl)(certificateUrl);
            if (key) {
                yield (0, handelFile_1.deleteFromSpaces)(key).catch(() => { });
            }
        }
        throw error;
    }
});
const GetAllCertification = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, agency_id } = query;
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const andCondition = [];
    // Search only by sl_no
    if (search) {
        andCondition.push({
            sl_no: {
                contains: search,
                mode: 'insensitive',
            },
        });
    }
    // Filter by agency_id
    if (agency_id) {
        andCondition.push({ agency_id });
    }
    const whereCondition = andCondition.length > 0 ? { AND: andCondition } : {};
    const result = yield prisma_1.default.certification.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sort_by && sort_order ? { [sort_by]: sort_order } : { issued_at: 'desc' },
        include: {
            agency: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
    const total = yield prisma_1.default.certification.count({
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
const GetSingleCertification = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const certification = yield prisma_1.default.certification.findUnique({
        where: { id },
        include: {
            agency: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                },
            },
        },
    });
    if (!certification) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Certification not found');
    }
    return certification;
});
const UpdateCertification = (id, payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const certification = yield prisma_1.default.certification.findUnique({
        where: { id },
    });
    if (!certification) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Certification not found');
    }
    let certificateUrl = null;
    try {
        // Handle file upload
        if (file) {
            // Delete old certificate file if exists
            if (certification.certificate_url) {
                const oldKey = (0, handelFile_1.extractKeyFromUrl)(certification.certificate_url);
                if (oldKey) {
                    yield (0, handelFile_1.deleteFromSpaces)(oldKey).catch(() => { });
                }
            }
            const uploadResult = yield (0, handelFile_1.uploadToSpaces)(file, {
                folder: 'certifications',
                filename: `certificate_${Date.now()}${path_1.default.extname(file.originalname)}`,
            });
            certificateUrl = (uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.url) || null;
        }
        // Prepare update data
        const updateData = Object.assign({}, payload);
        if (payload.date_of_birth) {
            updateData.date_of_birth = new Date(payload.date_of_birth);
        }
        if (payload.issued_at) {
            updateData.issued_at = new Date(payload.issued_at);
        }
        if (certificateUrl) {
            updateData.certificate_url = certificateUrl;
        }
        const result = yield prisma_1.default.certification.update({
            where: { id },
            data: updateData,
            include: {
                agency: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        return result;
    }
    catch (error) {
        // Clean up newly uploaded file on error
        if (certificateUrl) {
            const key = (0, handelFile_1.extractKeyFromUrl)(certificateUrl);
            if (key) {
                yield (0, handelFile_1.deleteFromSpaces)(key).catch(() => { });
            }
        }
        throw error;
    }
});
const DeleteCertification = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const certification = yield prisma_1.default.certification.findUnique({
        where: { id },
    });
    if (!certification) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Certification not found');
    }
    // Delete certificate file if exists
    if (certification.certificate_url) {
        const fileKey = (0, handelFile_1.extractKeyFromUrl)(certification.certificate_url);
        if (fileKey) {
            yield (0, handelFile_1.deleteFromSpaces)(fileKey).catch(() => { });
        }
    }
    yield prisma_1.default.certification.delete({
        where: { id },
    });
    return null;
});
const GetCertificationsByAgency = (agencyId, query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search } = query;
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    // Validate agency exists
    const agency = yield prisma_1.default.agency.findUnique({
        where: { id: agencyId },
    });
    if (!agency) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Agency not found');
    }
    const andCondition = [
        { agency_id: agencyId },
    ];
    // Only search by sl_no
    if (search) {
        andCondition.push({
            sl_no: {
                contains: search,
                mode: 'insensitive',
            },
        });
    }
    const whereCondition = { AND: andCondition };
    const result = yield prisma_1.default.certification.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sort_by && sort_order ? { [sort_by]: sort_order } : { issued_at: 'desc' },
        include: {
            agency: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
    const total = yield prisma_1.default.certification.count({
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
const VerifyCertification = (slNo) => __awaiter(void 0, void 0, void 0, function* () {
    const certification = yield prisma_1.default.certification.findFirst({
        where: {
            sl_no: {
                equals: slNo,
                mode: 'insensitive',
            },
        },
        include: {
            agency: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    contact_email: true,
                    website: true,
                },
            },
        },
    });
    if (!certification) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Certificate not found');
    }
    return certification;
});
const GetMyAgenciesCertifications = (userId, query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, agency_id } = query;
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const userAgencies = yield prisma_1.default.agency.findMany({
        where: {
            user_id: userId,
            is_deleted: false,
        },
        select: {
            id: true,
        },
    });
    // Extract agency IDs
    const agencyIds = userAgencies.map((agency) => agency.id);
    // If user has no agencies, return empty result
    if (agencyIds.length === 0) {
        return {
            meta: {
                page,
                limit,
                total: 0,
            },
            data: [],
        };
    }
    // Build where conditions
    const andCondition = [
        {
            agency_id: {
                in: agencyIds,
            },
        },
    ];
    // Search by sl_no
    if (search) {
        andCondition.push({
            sl_no: { contains: search, mode: 'insensitive' },
        });
    }
    // Filter by specific agency_id (if provided and user owns that agency)
    if (agency_id && agencyIds.includes(agency_id)) {
        andCondition.push({
            agency_id,
        });
    }
    const whereCondition = { AND: andCondition };
    // Get certifications with pagination
    const certifications = yield prisma_1.default.certification.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sort_by && sort_order
            ? { [sort_by]: sort_order }
            : { issued_at: 'desc' },
        include: {
            agency: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
    // Get total count
    const total = yield prisma_1.default.certification.count({
        where: whereCondition,
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: certifications,
    };
});
exports.CertificationService = {
    CreateCertification,
    GetAllCertification,
    GetSingleCertification,
    UpdateCertification,
    DeleteCertification,
    GetCertificationsByAgency,
    VerifyCertification,
    GetMyAgenciesCertifications,
};

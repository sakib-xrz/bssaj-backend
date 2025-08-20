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
exports.PaymentService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const pagination_1 = __importDefault(require("../../utils/pagination"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
// Helper function to generate transaction ID
const generateTransactionId = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN-${timestamp}-${random}`;
};
const CreatePayment = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if agency exists
    const agency = yield prisma_1.default.agency.findUnique({
        where: { id: payload.agency_id, is_deleted: false },
    });
    if (!agency) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Agency not found');
    }
    // Check if payment for this month already exists
    const existingPayment = yield prisma_1.default.agencySubscriptionPayment.findUnique({
        where: {
            agency_id_payment_month: {
                agency_id: payload.agency_id,
                payment_month: payload.payment_month,
            },
        },
    });
    if (existingPayment) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Payment for this month already exists for this agency');
    }
    // Generate unique transaction ID
    const transactionId = generateTransactionId();
    const result = yield prisma_1.default.agencySubscriptionPayment.create({
        data: {
            agency_id: payload.agency_id,
            payment_month: payload.payment_month,
            amount: payload.amount,
            payment_date: new Date(),
            payment_status: client_1.PaymentStatus.PENDING,
            payment_method: payload.payment_method,
            transaction_id: transactionId,
            notes: payload.notes,
        },
        include: {
            agency: {
                select: {
                    id: true,
                    name: true,
                    contact_email: true,
                },
            },
        },
    });
    return result;
});
const GetAllPayments = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, payment_status, agency_id, payment_month, start_date, end_date, } = query;
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const andCondition = [];
    if (search) {
        andCondition.push({
            OR: [
                { agency: { name: { contains: search, mode: 'insensitive' } } },
                { transaction_id: { contains: search, mode: 'insensitive' } },
                { payment_method: { contains: search, mode: 'insensitive' } },
            ],
        });
    }
    if (payment_status) {
        andCondition.push({ payment_status });
    }
    if (agency_id) {
        andCondition.push({ agency_id });
    }
    if (payment_month) {
        andCondition.push({ payment_month });
    }
    if (start_date && end_date) {
        andCondition.push({
            payment_date: {
                gte: new Date(start_date),
                lte: new Date(end_date),
            },
        });
    }
    // Filter out deleted payments by default
    andCondition.push({ is_deleted: false });
    const whereCondition = {
        AND: andCondition,
    };
    const result = yield prisma_1.default.agencySubscriptionPayment.findMany({
        where: whereCondition,
        include: {
            agency: {
                select: {
                    id: true,
                    name: true,
                    contact_email: true,
                    subscription_status: true,
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
        skip,
        take: limit,
        orderBy: sort_by && sort_order
            ? { [sort_by]: sort_order }
            : { created_at: 'desc' },
    });
    const total = yield prisma_1.default.agencySubscriptionPayment.count({
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
const GetPaymentStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalPayments = yield prisma_1.default.agencySubscriptionPayment.count({
        where: { is_deleted: false },
    });
    const totalPaidPayments = yield prisma_1.default.agencySubscriptionPayment.count({
        where: { is_deleted: false, payment_status: client_1.PaymentStatus.PAID },
    });
    const totalPendingPayments = yield prisma_1.default.agencySubscriptionPayment.count({
        where: { is_deleted: false, payment_status: client_1.PaymentStatus.PENDING },
    });
    const totalOverduePayments = yield prisma_1.default.agencySubscriptionPayment.count({
        where: { is_deleted: false, payment_status: client_1.PaymentStatus.OVERDUE },
    });
    const totalRevenue = yield prisma_1.default.agencySubscriptionPayment.aggregate({
        where: { is_deleted: false, payment_status: client_1.PaymentStatus.PAID },
        _sum: { amount: true },
    });
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const currentMonthRevenue = yield prisma_1.default.agencySubscriptionPayment.aggregate({
        where: {
            is_deleted: false,
            payment_status: client_1.PaymentStatus.PAID,
            payment_month: currentMonth,
        },
        _sum: { amount: true },
    });
    return {
        total_payments: totalPayments,
        total_paid_payments: totalPaidPayments,
        total_pending_payments: totalPendingPayments,
        total_overdue_payments: totalOverduePayments,
        total_revenue: totalRevenue._sum.amount || 0,
        current_month_revenue: currentMonthRevenue._sum.amount || 0,
    };
});
const GetSinglePayment = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.agencySubscriptionPayment.findUnique({
        where: { id, is_deleted: false },
        include: {
            agency: {
                select: {
                    id: true,
                    name: true,
                    contact_email: true,
                    subscription_status: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
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
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Payment not found');
    }
    return result;
});
const UpdatePayment = (payload, id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingPayment = yield prisma_1.default.agencySubscriptionPayment.findUnique({
        where: { id, is_deleted: false },
    });
    if (!existingPayment) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Payment not found');
    }
    const updateData = Object.assign({}, payload);
    const result = yield prisma_1.default.agencySubscriptionPayment.update({
        where: { id },
        data: updateData,
        include: {
            agency: {
                select: {
                    id: true,
                    name: true,
                    contact_email: true,
                    subscription_status: true,
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
});
const ApprovePayment = (id, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    const existingPayment = yield prisma_1.default.agencySubscriptionPayment.findUnique({
        where: { id, is_deleted: false },
        include: { agency: true },
    });
    if (!existingPayment) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Payment not found');
    }
    if (existingPayment.payment_status === client_1.PaymentStatus.PAID) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Payment is already approved');
    }
    const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Update payment
        const updatedPayment = yield tx.agencySubscriptionPayment.update({
            where: { id },
            data: {
                payment_status: payload.payment_status,
                approved_at: new Date(),
                approved_by_id: user.id,
                notes: payload.notes || existingPayment.notes,
            },
            include: {
                agency: {
                    select: {
                        id: true,
                        name: true,
                        contact_email: true,
                        subscription_status: true,
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
        // Update agency subscription status if payment is approved
        if (payload.payment_status === client_1.PaymentStatus.PAID) {
            // Calculate subscription end date based on payment month
            const [paymentYear, paymentMonth] = existingPayment.payment_month
                .split('-')
                .map(Number);
            const subscriptionEndDate = new Date(paymentYear, paymentMonth, 0); // Last day of payment month
            yield tx.agency.update({
                where: { id: existingPayment.agency_id },
                data: {
                    subscription_status: 'ACTIVE',
                    is_visible: true,
                    last_payment_month: existingPayment.payment_month,
                    subscription_end_date: subscriptionEndDate,
                },
            });
        }
        else if (payload.payment_status === 'FAILED') {
            // If payment is failed, pause the agency subscription
            yield tx.agency.update({
                where: { id: existingPayment.agency_id },
                data: {
                    subscription_status: 'PAUSED',
                    is_visible: false,
                },
            });
        }
        return updatedPayment;
    }));
    return result;
});
const DeletePayment = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingPayment = yield prisma_1.default.agencySubscriptionPayment.findUnique({
        where: { id, is_deleted: false },
    });
    if (!existingPayment) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Payment not found');
    }
    yield prisma_1.default.agencySubscriptionPayment.update({
        where: { id },
        data: { is_deleted: true },
    });
    return { message: 'Payment deleted successfully' };
});
const GetAgencyPayments = (agencyId, query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { payment_status, payment_month } = query;
    const { limit, page, sort_order, sort_by, skip } = (0, pagination_1.default)(options);
    const andCondition = [];
    andCondition.push({ agency_id: agencyId });
    andCondition.push({ is_deleted: false });
    if (payment_status) {
        andCondition.push({ payment_status });
    }
    if (payment_month) {
        andCondition.push({ payment_month });
    }
    const whereCondition = {
        AND: andCondition,
    };
    const result = yield prisma_1.default.agencySubscriptionPayment.findMany({
        where: whereCondition,
        include: {
            approved_by: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        skip,
        take: limit,
        orderBy: sort_by && sort_order
            ? { [sort_by]: sort_order }
            : { created_at: 'desc' },
    });
    const total = yield prisma_1.default.agencySubscriptionPayment.count({
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
const BulkCreatePayments = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { payment_month, amount, agency_ids, include_all_active_agencies } = payload;
    let targetAgencyIds = [];
    if (include_all_active_agencies) {
        // Get all active agencies
        const activeAgencies = yield prisma_1.default.agency.findMany({
            where: {
                is_deleted: false,
                status: 'APPROVED',
                subscription_status: { in: ['ACTIVE', 'PAUSED'] },
            },
            select: { id: true },
        });
        targetAgencyIds = activeAgencies.map((agency) => agency.id);
    }
    else if (agency_ids && agency_ids.length > 0) {
        targetAgencyIds = agency_ids;
    }
    else {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Either provide agency_ids or set include_all_active_agencies to true');
    }
    // Check for existing payments for this month
    const existingPayments = yield prisma_1.default.agencySubscriptionPayment.findMany({
        where: {
            agency_id: { in: targetAgencyIds },
            payment_month,
        },
        select: { agency_id: true },
    });
    const existingAgencyIds = existingPayments.map((p) => p.agency_id);
    const newAgencyIds = targetAgencyIds.filter((id) => !existingAgencyIds.includes(id));
    if (newAgencyIds.length === 0) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'All selected agencies already have payments for this month');
    }
    // Create bulk payments with auto-generated transaction IDs
    const paymentsData = newAgencyIds.map((agencyId) => ({
        agency_id: agencyId,
        payment_month,
        amount,
        payment_date: new Date(),
        payment_status: client_1.PaymentStatus.PENDING,
        transaction_id: generateTransactionId(),
    }));
    const result = yield prisma_1.default.agencySubscriptionPayment.createMany({
        data: paymentsData,
    });
    return {
        created_count: result.count,
        skipped_count: existingAgencyIds.length,
        message: `Created ${result.count} payments, skipped ${existingAgencyIds.length} existing payments`,
    };
});
const MarkOverduePayments = () => __awaiter(void 0, void 0, void 0, function* () {
    // Mark payments as overdue based on payment_month logic
    const currentMonthYear = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const [currentYear, currentMonth] = currentMonthYear.split('-').map(Number);
    // Get payments that are from previous months and still pending
    const overduePayments = yield prisma_1.default.agencySubscriptionPayment.findMany({
        where: {
            payment_status: client_1.PaymentStatus.PENDING,
            is_deleted: false,
        },
        select: { id: true, payment_month: true },
    });
    const overduePaymentIds = overduePayments
        .filter((payment) => {
        const [paymentYear, paymentMonth] = payment.payment_month
            .split('-')
            .map(Number);
        return (paymentYear < currentYear ||
            (paymentYear === currentYear && paymentMonth < currentMonth));
    })
        .map((p) => p.id);
    const result = yield prisma_1.default.agencySubscriptionPayment.updateMany({
        where: {
            id: { in: overduePaymentIds },
        },
        data: {
            payment_status: client_1.PaymentStatus.OVERDUE,
        },
    });
    // Also update agency subscription status to PAUSED for overdue payments
    if (overduePaymentIds.length > 0) {
        const overdueAgencies = yield prisma_1.default.agencySubscriptionPayment.findMany({
            where: {
                id: { in: overduePaymentIds },
            },
            select: { agency_id: true },
            distinct: ['agency_id'],
        });
        if (overdueAgencies.length > 0) {
            yield prisma_1.default.agency.updateMany({
                where: {
                    id: { in: overdueAgencies.map((p) => p.agency_id) },
                },
                data: {
                    subscription_status: 'PAUSED',
                    is_visible: false,
                },
            });
        }
    }
    return {
        updated_payments: result.count,
        paused_agencies: overduePaymentIds.length,
    };
});
const GetAgencyPaymentSummary = (agencyId) => __awaiter(void 0, void 0, void 0, function* () {
    const agency = yield prisma_1.default.agency.findUnique({
        where: { id: agencyId, is_deleted: false },
        select: {
            id: true,
            name: true,
            subscription_status: true,
            last_payment_month: true,
            subscription_end_date: true,
        },
    });
    if (!agency) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Agency not found');
    }
    // Get recent payments
    const recentPayments = yield prisma_1.default.agencySubscriptionPayment.findMany({
        where: {
            agency_id: agencyId,
            is_deleted: false,
        },
        orderBy: { payment_month: 'desc' },
        take: 6,
        select: {
            id: true,
            payment_month: true,
            amount: true,
            payment_status: true,
            payment_date: true,
            approved_at: true,
        },
    });
    // Get payment statistics
    const totalPaidPayments = yield prisma_1.default.agencySubscriptionPayment.count({
        where: {
            agency_id: agencyId,
            payment_status: client_1.PaymentStatus.PAID,
            is_deleted: false,
        },
    });
    const totalPendingPayments = yield prisma_1.default.agencySubscriptionPayment.count({
        where: {
            agency_id: agencyId,
            payment_status: client_1.PaymentStatus.PENDING,
            is_deleted: false,
        },
    });
    const totalOverduePayments = yield prisma_1.default.agencySubscriptionPayment.count({
        where: {
            agency_id: agencyId,
            payment_status: client_1.PaymentStatus.OVERDUE,
            is_deleted: false,
        },
    });
    const totalAmountPaid = yield prisma_1.default.agencySubscriptionPayment.aggregate({
        where: {
            agency_id: agencyId,
            payment_status: client_1.PaymentStatus.PAID,
            is_deleted: false,
        },
        _sum: { amount: true },
    });
    return {
        agency_info: agency,
        payment_stats: {
            total_paid_payments: totalPaidPayments,
            total_pending_payments: totalPendingPayments,
            total_overdue_payments: totalOverduePayments,
            total_amount_paid: totalAmountPaid._sum.amount || 0,
        },
        recent_payments: recentPayments,
    };
});
exports.PaymentService = {
    CreatePayment,
    GetAllPayments,
    GetPaymentStats,
    GetSinglePayment,
    UpdatePayment,
    ApprovePayment,
    DeletePayment,
    GetAgencyPayments,
    GetAgencyPaymentSummary,
    BulkCreatePayments,
    MarkOverduePayments,
};

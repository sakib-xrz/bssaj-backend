/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AgencySubscriptionPayment,
  Prisma,
  PaymentStatus,
} from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import calculatePagination from '../../utils/pagination';
import prisma from '../../utils/prisma';
import { JwtPayload } from 'jsonwebtoken';

// Helper function to generate transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

const CreatePayment = async (payload: any) => {
  // Check if agency exists
  const agency = await prisma.agency.findUnique({
    where: { id: payload.agency_id, is_deleted: false },
  });

  if (!agency) {
    throw new AppError(httpStatus.NOT_FOUND, 'Agency not found');
  }

  // Check if payment for this month already exists
  const existingPayment = await prisma.agencySubscriptionPayment.findUnique({
    where: {
      agency_id_payment_month: {
        agency_id: payload.agency_id,
        payment_month: payload.payment_month,
      },
    },
  });

  if (existingPayment) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Payment for this month already exists for this agency',
    );
  }

  // Generate unique transaction ID
  const transactionId = generateTransactionId();

  const result = await prisma.agencySubscriptionPayment.create({
    data: {
      agency_id: payload.agency_id,
      payment_month: payload.payment_month,
      amount: payload.amount,
      payment_date: new Date(),
      payment_status: PaymentStatus.PENDING,
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
};

const GetAllPayments = async (query: any, options: any) => {
  const {
    search,
    payment_status,
    agency_id,
    payment_month,
    start_date,
    end_date,
  } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);

  const andCondition: Prisma.AgencySubscriptionPaymentWhereInput[] = [];

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

  const whereCondition: Prisma.AgencySubscriptionPaymentWhereInput = {
    AND: andCondition,
  };

  const result = await prisma.agencySubscriptionPayment.findMany({
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
    orderBy:
      sort_by && sort_order
        ? { [sort_by]: sort_order }
        : { created_at: 'desc' },
  });

  const total = await prisma.agencySubscriptionPayment.count({
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
};

const GetPaymentStats = async () => {
  const totalPayments = await prisma.agencySubscriptionPayment.count({
    where: { is_deleted: false },
  });

  const totalPaidPayments = await prisma.agencySubscriptionPayment.count({
    where: { is_deleted: false, payment_status: PaymentStatus.PAID },
  });

  const totalPendingPayments = await prisma.agencySubscriptionPayment.count({
    where: { is_deleted: false, payment_status: PaymentStatus.PENDING },
  });

  const totalOverduePayments = await prisma.agencySubscriptionPayment.count({
    where: { is_deleted: false, payment_status: PaymentStatus.OVERDUE },
  });

  const totalRevenue = await prisma.agencySubscriptionPayment.aggregate({
    where: { is_deleted: false, payment_status: PaymentStatus.PAID },
    _sum: { amount: true },
  });

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const currentMonthRevenue = await prisma.agencySubscriptionPayment.aggregate({
    where: {
      is_deleted: false,
      payment_status: PaymentStatus.PAID,
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
};

const GetSinglePayment = async (id: string) => {
  const result = await prisma.agencySubscriptionPayment.findUnique({
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
    throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
  }

  return result;
};

const UpdatePayment = async (
  payload: Partial<AgencySubscriptionPayment>,
  id: string,
) => {
  const existingPayment = await prisma.agencySubscriptionPayment.findUnique({
    where: { id, is_deleted: false },
  });

  if (!existingPayment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
  }

  const updateData = {
    ...payload,
  };

  const result = await prisma.agencySubscriptionPayment.update({
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
};

const ApprovePayment = async (
  id: string,
  payload: { payment_status: PaymentStatus; notes?: string },
  user: JwtPayload,
) => {
  const existingPayment = await prisma.agencySubscriptionPayment.findUnique({
    where: { id, is_deleted: false },
    include: { agency: true },
  });

  if (!existingPayment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
  }

  if (existingPayment.payment_status === PaymentStatus.PAID) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment is already approved');
  }

  const result = await prisma.$transaction(async (tx) => {
    // Update payment
    const updatedPayment = await tx.agencySubscriptionPayment.update({
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
    if (payload.payment_status === PaymentStatus.PAID) {
      // Calculate subscription end date based on payment month
      const [paymentYear, paymentMonth] = existingPayment.payment_month
        .split('-')
        .map(Number);
      const subscriptionEndDate = new Date(paymentYear, paymentMonth, 0); // Last day of payment month

      await tx.agency.update({
        where: { id: existingPayment.agency_id },
        data: {
          subscription_status: 'ACTIVE',
          is_visible: true,
          last_payment_month: existingPayment.payment_month,
          subscription_end_date: subscriptionEndDate,
        },
      });
    } else if (payload.payment_status === 'FAILED') {
      // If payment is failed, pause the agency subscription
      await tx.agency.update({
        where: { id: existingPayment.agency_id },
        data: {
          subscription_status: 'PAUSED',
          is_visible: false,
        },
      });
    }

    return updatedPayment;
  });

  return result;
};

const DeletePayment = async (id: string) => {
  const existingPayment = await prisma.agencySubscriptionPayment.findUnique({
    where: { id, is_deleted: false },
  });

  if (!existingPayment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
  }

  await prisma.agencySubscriptionPayment.update({
    where: { id },
    data: { is_deleted: true },
  });

  return { message: 'Payment deleted successfully' };
};

const GetAgencyPayments = async (
  agencyId: string,
  query: any,
  options: any,
) => {
  const { payment_status, payment_month } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);

  const andCondition: Prisma.AgencySubscriptionPaymentWhereInput[] = [];

  andCondition.push({ agency_id: agencyId });
  andCondition.push({ is_deleted: false });

  if (payment_status) {
    andCondition.push({ payment_status });
  }

  if (payment_month) {
    andCondition.push({ payment_month });
  }

  const whereCondition: Prisma.AgencySubscriptionPaymentWhereInput = {
    AND: andCondition,
  };

  const result = await prisma.agencySubscriptionPayment.findMany({
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
    orderBy:
      sort_by && sort_order
        ? { [sort_by]: sort_order }
        : { created_at: 'desc' },
  });

  const total = await prisma.agencySubscriptionPayment.count({
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
};

const BulkCreatePayments = async (payload: any) => {
  const { payment_month, amount, agency_ids, include_all_active_agencies } =
    payload;

  let targetAgencyIds: string[] = [];

  if (include_all_active_agencies) {
    // Get all active agencies
    const activeAgencies = await prisma.agency.findMany({
      where: {
        is_deleted: false,
        status: 'APPROVED',
        subscription_status: { in: ['ACTIVE', 'PAUSED'] },
      },
      select: { id: true },
    });
    targetAgencyIds = activeAgencies.map((agency) => agency.id);
  } else if (agency_ids && agency_ids.length > 0) {
    targetAgencyIds = agency_ids;
  } else {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Either provide agency_ids or set include_all_active_agencies to true',
    );
  }

  // Check for existing payments for this month
  const existingPayments = await prisma.agencySubscriptionPayment.findMany({
    where: {
      agency_id: { in: targetAgencyIds },
      payment_month,
    },
    select: { agency_id: true },
  });

  const existingAgencyIds = existingPayments.map((p) => p.agency_id);
  const newAgencyIds = targetAgencyIds.filter(
    (id) => !existingAgencyIds.includes(id),
  );

  if (newAgencyIds.length === 0) {
    throw new AppError(
      httpStatus.CONFLICT,
      'All selected agencies already have payments for this month',
    );
  }

  // Create bulk payments with auto-generated transaction IDs
  const paymentsData = newAgencyIds.map((agencyId) => ({
    agency_id: agencyId,
    payment_month,
    amount,
    payment_date: new Date(),
    payment_status: PaymentStatus.PENDING,
    transaction_id: generateTransactionId(),
  }));

  const result = await prisma.agencySubscriptionPayment.createMany({
    data: paymentsData,
  });

  return {
    created_count: result.count,
    skipped_count: existingAgencyIds.length,
    message: `Created ${result.count} payments, skipped ${existingAgencyIds.length} existing payments`,
  };
};

const GetAgencyPaymentSummary = async (agencyId: string) => {
  const agency = await prisma.agency.findUnique({
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
    throw new AppError(httpStatus.NOT_FOUND, 'Agency not found');
  }

  // Get recent payments
  const recentPayments = await prisma.agencySubscriptionPayment.findMany({
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
  const totalPaidPayments = await prisma.agencySubscriptionPayment.count({
    where: {
      agency_id: agencyId,
      payment_status: PaymentStatus.PAID,
      is_deleted: false,
    },
  });

  const totalPendingPayments = await prisma.agencySubscriptionPayment.count({
    where: {
      agency_id: agencyId,
      payment_status: PaymentStatus.PENDING,
      is_deleted: false,
    },
  });

  const totalOverduePayments = await prisma.agencySubscriptionPayment.count({
    where: {
      agency_id: agencyId,
      payment_status: PaymentStatus.OVERDUE,
      is_deleted: false,
    },
  });

  const totalAmountPaid = await prisma.agencySubscriptionPayment.aggregate({
    where: {
      agency_id: agencyId,
      payment_status: PaymentStatus.PAID,
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
};

export const PaymentService = {
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
};

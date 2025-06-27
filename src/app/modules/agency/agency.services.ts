/* eslint-disable @typescript-eslint/no-explicit-any */
import { Agency, AgencyStatus, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import calculatePagination from '../../utils/pagination';
import prisma from '../../utils/prisma';

const CreateAgency = async (payload: Agency) => {
  const result = await prisma.agency.create({
    data: payload,
  });
  return result;
};

const GetAllAgency = async (query: any, options: any) => {
  const { search } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);
  const andCondition: Prisma.AgencyWhereInput[] = [];
  if (search) {
    andCondition.push({
      OR: ['name'].map((field) => ({
        [field]: {
          contains: query.search,
          mode: 'insensitive',
        },
      })),
    });
  }

  const whereCondition: Prisma.AgencyWhereInput = { AND: andCondition };

  const result = await prisma.agency.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sort_by && sort_order ? { [sort_by]: sort_order } : { created_at: 'asc' },
  });
  const total = await prisma.agency.count({
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

const GetSingleAgency = async (id: string) => {
  const result = await prisma.agency.findUnique({
    where: {
      id,
    },
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'agency not found');
  }
  return result;
};

const UpdateAgency = async (payload: Partial<Agency>, id: string) => {
  const existingAgency = await prisma.agency.findUnique({
    where: {
      id,
    },
  });
  if (!existingAgency) {
    throw new AppError(httpStatus.NOT_FOUND, 'agency not found');
  }
  if (existingAgency.status !== 'APPROVED') {
    throw new AppError(
      httpStatus.CONFLICT,
      'You cannot delete the agency. Please approve it first before update.',
    );
  }
  const result = await prisma.agency.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const DeleteAgency = async (id: string) => {
  const existingAgency = await prisma.agency.findUnique({
    where: {
      id,
    },
  });
  if (!existingAgency) {
    throw new AppError(httpStatus.NOT_FOUND, 'agency not found');
  }
  const result = await prisma.agency.delete({
    where: {
      id,
    },
  });
  return result;
};

const ApprovedOrRejectAgency = async (
  id: string,
  status: AgencyStatus,
  approved_by_id: string,
) => {
  const result = await prisma.$transaction(async (tx) => {
    const existingAgency = await tx.agency.findUnique({
      where: { id },
    });

    if (!existingAgency) {
      throw new AppError(httpStatus.NOT_FOUND, 'Agency not found');
    }

    const updatedAgency = await tx.agency.update({
      where: { id },
      data: {
        status: status,
        approved_by_id,
        approved_at: new Date(),
      },
    });

    if (status === AgencyStatus.APPROVED) {
      await tx.user.update({
        where: { id: existingAgency.user_id },
        data: { role: 'AGENCY' },
      });
    }

    return updatedAgency;
  });

  return result;
};

export const AgencyService = {
  CreateAgency,
  GetAllAgency,
  GetSingleAgency,
  UpdateAgency,
  DeleteAgency,
  ApprovedOrRejectAgency,
};

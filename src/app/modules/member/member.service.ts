/* eslint-disable @typescript-eslint/no-explicit-any */
import { Member, MembershipStatus, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import calculatePagination from '../../utils/pagination';
import prisma from '../../utils/prisma';
import { memberSearchableFields } from './member.constant';

const CreateMember = async (payload: Member) => {
  const user = await prisma.user.findUnique({
    where: {
      id: payload.user_id,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const information = {
    member_id: `M-${Date.now()}`,
    user_id: payload.user_id,
    name: user.name,
    email: user.email,
    phone: payload.phone,
    kind: payload.kind,
  };

  const result = await prisma.member.create({
    data: information,
  });

  return result;
};

const GetSingleMember = async (id: string) => {
  const existingMember = await prisma.member.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingMember) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid Member Id');
  }

  if (existingMember.is_deleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'This member is Deleted');
  }

  return existingMember;
};

const GetAllMember = async (query: any, options: any) => {
  const { search, ...filterData } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);
  const andCondition: Prisma.MemberWhereInput[] = [];
  if (search) {
    andCondition.push({
      OR: memberSearchableFields.map((field) => ({
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

  const whareCondition: Prisma.MemberWhereInput = { AND: andCondition };

  const result = await prisma.member.findMany({
    where: whareCondition,
    skip,
    take: limit,
    orderBy:
      sort_by && sort_order ? { [sort_by]: sort_order } : { created_at: 'asc' },
  });
  const total = await prisma.member.count({
    where: whareCondition,
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

const UpdateMember = async (id: string, payload: Partial<Member>) => {
  const member = await prisma.member.findUnique({
    where: {
      id,
    },
  });

  if (!member) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid member id');
  }
  if (member.is_deleted === true) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'This member is already deleted!',
    );
  }

  const result = await prisma.member.update({
    where: {
      id: id,
    },
    data: payload,
  });

  return result;
};

const DeleteMember = async (id: string) => {
  const existingMember = await prisma.member.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingMember) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'This member is not found!');
  }

  await prisma.member.delete({
    where: {
      id: id,
    },
  });
  return null;
};

const ApprovedOrRejectMember = async (
  id: string,
  status: MembershipStatus,
  approved_by_id: string,
) => {
  const existingMember = await prisma.member.findUnique({
    where: {
      id,
    },
  });

  if (!existingMember) {
    throw new AppError(httpStatus.NOT_FOUND, 'This member is not found');
  }

  const result = await prisma.member.update({
    where: {
      id,
    },
    data: {
      status,
      approved_by_id,
      approved_at: new Date(),
    },
  });

  return result;
};

export const MembersService = {
  CreateMember,
  GetSingleMember,
  GetAllMember,
  UpdateMember,
  DeleteMember,
  ApprovedOrRejectMember,
};

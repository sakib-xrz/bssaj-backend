/* eslint-disable @typescript-eslint/no-explicit-any */
import { Member, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import calculatePagination from '../../utils/pagination';
import prisma from '../../utils/prisma';
import { memberSearchableFields } from './member.constant';
import MemberUtils from './member.utils';
import { JwtPayload } from 'jsonwebtoken';

const CreateMember = async (payload: Member) => {
  const user = await prisma.user.findUnique({
    where: {
      id: payload.user_id,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const memberId = await MemberUtils.GenerateMemberId(payload.kind);

  const information = {
    member_id: memberId,
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
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid Member Id');
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

  const whereCondition: Prisma.MemberWhereInput = { AND: andCondition };

  const result = await prisma.member.findMany({
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
    orderBy:
      sort_by && sort_order ? { [sort_by]: sort_order } : { created_at: 'asc' },
  });
  const total = await prisma.member.count({
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

const GetMemberStats = async () => {
  const totalMember = await prisma.member.count({
    where: {
      is_deleted: false,
    },
  });

  const totalApprovedMember = await prisma.member.count({
    where: {
      is_deleted: false,
      status: 'APPROVED',
    },
  });

  const totalPendingMember = await prisma.member.count({
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
};

const GetMyMember = async (user: JwtPayload) => {
  const member = await prisma.member.findUnique({
    where: { user_id: user.id },
    include: {
      approved_by: {
        select: {
          id: true,
          name: true,
          profile_picture: true,
        },
      },
    },
  });
  return member;
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

export const MembersService = {
  CreateMember,
  GetSingleMember,
  GetAllMember,
  GetMemberStats,
  GetMyMember,
  UpdateMember,
  DeleteMember,
};

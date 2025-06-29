/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from '@prisma/client';
import calculatePagination from '../../utils/pagination';
import prisma from '../../utils/prisma';

const CreateUser = async (data: any) => {
  const result = await prisma.user.create({
    data,
  });
  return result;
};

const GetAllUser = async (query: any, options: any) => {
  const { search, ...filterData } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);
  const andCondition: Prisma.UserWhereInput[] = [];
  if (search) {
    andCondition.push({
      OR: ['name', 'email'].map((field) => ({
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

  const whereCondition: Prisma.UserWhereInput = { AND: andCondition };

  const result = await prisma.user.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sort_by && sort_order ? { [sort_by]: sort_order } : { created_at: 'asc' },
  });
  const total = await prisma.user.count({
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

const SearchUser = async (search: string) => {
  const result = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    },
  });
  return result;
};
const UpdateUser = async (id: string, data: any) => {
  const result = await prisma.user.update({
    where: { id },
    data,
  });
  return result;
};

const DeleteUser = async (id: string) => {
  const transaction = await prisma.$transaction(async (tx) => {
    await tx.notification.deleteMany({
      where: { user_id: id },
    });

    await tx.payment.updateMany({
      where: { approved_by_id: id },
      data: { approved_by_id: null },
    });

    await tx.member.updateMany({
      where: { approved_by_id: id },
      data: { approved_by_id: null },
    });

    await tx.blog.updateMany({
      where: { approved_by_id: id },
      data: { approved_by_id: null },
    });

    await tx.agency.updateMany({
      where: { approved_by_id: id },
      data: { approved_by_id: null },
    });

    await tx.payment.deleteMany({
      where: { user_id: id },
    });

    await tx.blog.deleteMany({
      where: { author_id: id },
    });

    await tx.certification.deleteMany({
      where: { student_id: id },
    });

    await tx.examRegistration.deleteMany({
      where: { user_id: id },
    });

    await tx.member
      .delete({
        where: { user_id: id },
      })
      .catch(() => {});

    await tx.agency
      .delete({
        where: { user_id: id },
      })
      .catch(() => {});

    await tx.user.delete({
      where: { id },
    });
  });

  return transaction;
};

export const UserService = {
  CreateUser,
  GetAllUser,
  SearchUser,
  UpdateUser,
  DeleteUser,
};

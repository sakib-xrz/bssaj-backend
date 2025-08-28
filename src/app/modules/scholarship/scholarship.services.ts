/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scholarship, Prisma, Role } from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import calculatePagination from '../../utils/pagination';
import prisma from '../../utils/prisma';
import { JwtPayload } from 'jsonwebtoken';

const CreateScholarship = async (payload: Scholarship, user?: JwtPayload) => {
  // Validate user permissions
  if (user) {
    const isAdmin = user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN;

    if (!isAdmin) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Only admins can create scholarships',
      );
    }
  }

  // Convert deadline string to Date
  const scholarshipData = {
    ...payload,
    deadline: new Date(payload.deadline),
  };

  const result = await prisma.scholarship.create({
    data: scholarshipData,
  });

  return result;
};

const GetAllScholarships = async (query: any, options: any) => {
  const { search, title, provider, eligibility } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);

  const andCondition: Prisma.ScholarshipWhereInput[] = [{ is_deleted: false }];

  if (search) {
    andCondition.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { provider: { contains: search, mode: 'insensitive' } },
        { eligibility: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (title) {
    andCondition.push({
      title: { contains: title, mode: 'insensitive' },
    });
  }

  if (provider) {
    andCondition.push({
      provider: { contains: provider, mode: 'insensitive' },
    });
  }

  if (eligibility) {
    andCondition.push({
      eligibility: { contains: eligibility, mode: 'insensitive' },
    });
  }

  const whereCondition: Prisma.ScholarshipWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : { is_deleted: false };

  const result = await prisma.scholarship.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sort_by && sort_order
        ? { [sort_by]: sort_order }
        : { created_at: 'desc' },
  });

  const total = await prisma.scholarship.count({
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

const GetScholarshipById = async (id: string) => {
  const result = await prisma.scholarship.findUnique({
    where: { id, is_deleted: false },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Scholarship not found');
  }

  return result;
};

const UpdateScholarship = async (
  id: string,
  payload: Partial<Scholarship>,
  user?: JwtPayload,
) => {
  // Validate user permissions
  if (user) {
    const isAdmin = user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN;

    if (!isAdmin) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Only admins can update scholarships',
      );
    }
  }

  const scholarship = await prisma.scholarship.findUnique({
    where: { id, is_deleted: false },
  });

  if (!scholarship) {
    throw new AppError(httpStatus.NOT_FOUND, 'Scholarship not found');
  }

  // Convert deadline string to Date if provided
  const updateData = {
    ...payload,
    ...(payload.deadline && { deadline: new Date(payload.deadline) }),
  };

  const result = await prisma.scholarship.update({
    where: { id },
    data: updateData,
  });

  return result;
};

const DeleteScholarship = async (id: string, user?: JwtPayload) => {
  // Validate user permissions
  if (user) {
    const isAdmin = user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN;

    if (!isAdmin) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Only admins can delete scholarships',
      );
    }
  }

  const scholarship = await prisma.scholarship.findUnique({
    where: { id, is_deleted: false },
  });

  if (!scholarship) {
    throw new AppError(httpStatus.NOT_FOUND, 'Scholarship not found');
  }

  // Soft delete
  await prisma.scholarship.update({
    where: { id },
    data: { is_deleted: true },
  });

  return null;
};

export const ScholarshipService = {
  CreateScholarship,
  GetAllScholarships,
  GetScholarshipById,
  UpdateScholarship,
  DeleteScholarship,
};

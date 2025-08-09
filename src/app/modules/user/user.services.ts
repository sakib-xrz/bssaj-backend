/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, Role } from '@prisma/client';
import calculatePagination from '../../utils/pagination';
import prisma from '../../utils/prisma';
import bcrypt from 'bcrypt';
import config from '../../config';
import path from 'path';
import {
  deleteFromSpaces,
  extractKeyFromUrl,
  uploadToSpaces,
} from '../../utils/handelFile';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';

const CreateUser = async (data: any) => {
  const { email, password, name, ...rest } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  // Create user
  const result = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      ...rest,
    },
  });

  return {
    id: result.id,
    email: result.email,
    name: result.name,
    role: result.role,
    created_at: result.created_at,
  };
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
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
    },
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

const GetUserById = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      address: true,
    },
  });
  if (!result) {
    throw new Error('User not found');
  }
  return result;
};

const SearchUser = async (search: string) => {
  if (!search || search.trim().length === 0) {
    return [];
  }

  const result = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
      ],
      role: {
        not: Role.SUPER_ADMIN,
      },
      member: null,
      is_deleted: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    take: 20,
  });

  return result;
};

const UpdateUser = async (id: string, data: any) => {
  const userData = await prisma.user.findUnique({
    where: { id },
  });

  if (!userData) {
    throw new Error('User not found');
  }

  const result = await prisma.user.update({
    where: { id },
    data: {
      name: data.name || userData.name,
      address: data.address || userData.address,
      current_study_info:
        data.current_study_info || userData.current_study_info,
    },
  });

  delete (result as any)?.password;

  return result;
};

const UpdateProfilePicture = async (id: string, file: Express.Multer.File) => {
  const userData = await prisma.user.findUnique({
    where: { id },
  });
  if (!userData) {
    throw new Error('User not found');
  }

  let profilePicture: string | null = userData.profile_picture || null;

  try {
    if (userData.profile_picture) {
      const key = extractKeyFromUrl(userData.profile_picture);
      if (key) {
        await deleteFromSpaces(key);
      }
    }

    const uploadResult = await uploadToSpaces(file, {
      folder: 'profile-pictures',
      filename: `profile_picture_${Date.now()}${path.extname(file.originalname)}`,
    });
    profilePicture = uploadResult?.url || null;
  } catch (error) {
    console.log(
      'Error from DigitalOcean Spaces while uploading profile picture',
      error,
    );
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to upload profile picture',
    );
  }

  const result = await prisma.user.update({
    where: { id },
    data: { profile_picture: profilePicture },
  });

  delete (result as any)?.password;

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

    await tx.agencySuccessStory.deleteMany({
      where: { agency_id: id },
    });

    await tx.agency.deleteMany({
      where: { user_id: id },
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
      .deleteMany({
        where: { user_id: id },
      })
      .catch(() => {});

    await tx.user.delete({
      where: { id },
    });
  });

  return transaction;
};

const UpdateUserById = async (id: string, data: any) => {
  const userData = await prisma.user.findUnique({
    where: { id },
  });
  if (!userData) {
    throw new Error('User not found');
  }

  const result = await prisma.user.update({
    where: { id },
    data,
  });

  return result;
};

export const UserService = {
  CreateUser,
  GetAllUser,
  GetUserById,
  SearchUser,
  UpdateUser,
  UpdateProfilePicture,
  DeleteUser,
  UpdateUserById,
};

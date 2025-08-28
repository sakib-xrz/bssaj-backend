/* eslint-disable @typescript-eslint/no-explicit-any */
import { Consultation, Prisma, Role } from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import calculatePagination from '../../utils/pagination';
import prisma from '../../utils/prisma';
import { JwtPayload } from 'jsonwebtoken';

const CreateConsultation = async (payload: Consultation) => {
  const result = await prisma.consultation.create({
    data: payload,
  });

  return result;
};

const GetAllConsultation = async (query: any, options: any) => {
  const { search, name, phone, email } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);

  const andCondition: Prisma.ConsultationWhereInput[] = [];

  if (search) {
    andCondition.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (name) {
    andCondition.push({
      name: { contains: name, mode: 'insensitive' },
    });
  }

  if (phone) {
    andCondition.push({
      phone: { contains: phone, mode: 'insensitive' },
    });
  }

  if (email) {
    andCondition.push({
      email: { contains: email, mode: 'insensitive' },
    });
  }

  const whereCondition: Prisma.ConsultationWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.consultation.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sort_by && sort_order
        ? { [sort_by]: sort_order }
        : { created_at: 'desc' },
  });

  const total = await prisma.consultation.count({
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

const GetConsultationById = async (id: string) => {
  const result = await prisma.consultation.findUnique({
    where: { id },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Consultation not found');
  }

  return result;
};

const UpdateConsultationStatus = async (
  id: string,
  payload: { status: string },
  user?: JwtPayload,
) => {
  const consultation = await prisma.consultation.findUnique({
    where: { id },
  });

  if (!consultation) {
    throw new AppError(httpStatus.NOT_FOUND, 'Consultation not found');
  }

  if (user) {
    const isAdmin = user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN;

    if (!isAdmin) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Only admins can update consultation status',
      );
    }
  }

  const result = await prisma.consultation.update({
    where: { id },
    data: {
      status: payload.status as any,
    },
  });

  return result;
};

const DeleteConsultation = async (id: string, user?: JwtPayload) => {
  const consultation = await prisma.consultation.findUnique({
    where: { id },
  });

  if (!consultation) {
    throw new AppError(httpStatus.NOT_FOUND, 'Consultation not found');
  }

  if (user) {
    const isAdmin = user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN;

    if (!isAdmin) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Only admins can delete consultations',
      );
    }
  }

  await prisma.consultation.delete({
    where: { id },
  });

  return null;
};

export const ConsultationService = {
  CreateConsultation,
  GetAllConsultation,
  GetConsultationById,
  UpdateConsultationStatus,
  DeleteConsultation,
};

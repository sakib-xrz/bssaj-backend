/* eslint-disable @typescript-eslint/no-explicit-any */
import { News, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import calculatePagination from '../../utils/pagination';
import prisma from '../../utils/prisma';

type NewsCreatePayload = Omit<News, 'id' | 'created_at' | 'updated_at'>;

const CreateNews = async (payload: NewsCreatePayload) => {
  const result = await prisma.news.create({
    data: payload,
  });

  return result;
};

const GetAllNews = async (query: any, options: any) => {
  const { search } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);

  const andCondition: Prisma.NewsWhereInput[] = [{ is_deleted: false }];

  if (search) {
    andCondition.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  const whereCondition: Prisma.NewsWhereInput = { AND: andCondition };

  const result = await prisma.news.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sort_by && sort_order
        ? { [sort_by]: sort_order }
        : { created_at: 'desc' },
  });

  const total = await prisma.news.count({
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

const GetSingleNews = async (id: string) => {
  const news = await prisma.news.findFirst({
    where: {
      id,
      is_deleted: false,
    },
  });

  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  return news;
};

const UpdateNews = async (id: string, payload: Partial<NewsCreatePayload>) => {
  const news = await prisma.news.findUnique({
    where: { id, is_deleted: false },
  });

  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  const result = await prisma.news.update({
    where: { id },
    data: payload,
  });

  return result;
};

const DeleteNews = async (id: string, isHardDelete: boolean) => {
  const news = await prisma.news.findUnique({
    where: { id },
  });

  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  if (isHardDelete) {
    await prisma.news.delete({
      where: { id },
    });
  } else {
    await prisma.news.update({
      where: { id },
      data: { is_deleted: true },
    });
  }

  return null;
};

export const NewsService = {
  CreateNews,
  GetAllNews,
  GetSingleNews,
  UpdateNews,
  DeleteNews,
};

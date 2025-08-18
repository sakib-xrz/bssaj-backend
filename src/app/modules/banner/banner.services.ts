/* eslint-disable @typescript-eslint/no-explicit-any */
import { Banner, Prisma, Role } from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import calculatePagination from '../../utils/pagination';
import prisma from '../../utils/prisma';
import path from 'path';
import {
  uploadToSpaces,
  deleteFromSpaces,
  extractKeyFromUrl,
} from '../../utils/handelFile';
import { JwtPayload } from 'jsonwebtoken';

const CreateBanner = async (
  payload: Banner,
  file?: Express.Multer.File,
  user?: JwtPayload,
) => {
  let imageUrl: string | null = null;

  if (user) {
    const isAdmin = user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN;
    if (!isAdmin) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Only admins can create banners',
      );
    }
  }

  try {
    if (file) {
      const uploadResult = await uploadToSpaces(file, {
        folder: 'banners/images',
        filename: `banner_image_${Date.now()}${path.extname(file.originalname)}`,
      });
      imageUrl = uploadResult?.url || null;
    }

    if (!imageUrl) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Banner image is required');
    }

    const result = await prisma.banner.create({
      data: {
        ...payload,
        image: imageUrl,
      },
    });

    return result;
  } catch (error) {
    if (imageUrl) {
      const key = extractKeyFromUrl(imageUrl);
      if (key) {
        await deleteFromSpaces(key).catch(() => {});
      }
    }
    throw error;
  }
};

const GetAllBanner = async (query: any, options: any) => {
  const { search } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);

  const andCondition: Prisma.BannerWhereInput[] = [];

  if (search) {
    andCondition.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  const whereCondition: Prisma.BannerWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.banner.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sort_by && sort_order
        ? { [sort_by]: sort_order }
        : { created_at: 'desc' },
  });

  const total = await prisma.banner.count({
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

const GetSingleBanner = async (id: string) => {
  const banner = await prisma.banner.findUnique({
    where: { id },
  });

  if (!banner) {
    throw new AppError(httpStatus.NOT_FOUND, 'Banner not found');
  }

  return banner;
};

const UpdateBanner = async (
  id: string,
  payload: Partial<Banner>,
  file?: Express.Multer.File,
  user?: JwtPayload,
) => {
  const banner = await prisma.banner.findUnique({
    where: { id },
  });

  if (!banner) {
    throw new AppError(httpStatus.NOT_FOUND, 'Banner not found');
  }

  if (user) {
    const isAdmin = user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN;

    if (!isAdmin) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Only admins can update banners',
      );
    }
  }

  let imageUrl: string | null = null;

  try {
    if (file) {
      if (banner.image) {
        const oldKey = extractKeyFromUrl(banner.image);
        if (oldKey) {
          await deleteFromSpaces(oldKey).catch(() => {});
        }
      }

      const uploadResult = await uploadToSpaces(file, {
        folder: 'banners/images',
        filename: `banner_image_${Date.now()}${path.extname(file.originalname)}`,
      });
      imageUrl = uploadResult?.url || null;
    }

    const result = await prisma.banner.update({
      where: { id },
      data: {
        ...payload,
        ...(imageUrl && { image: imageUrl }),
      },
    });

    return result;
  } catch (error) {
    if (imageUrl) {
      const key = extractKeyFromUrl(imageUrl);
      if (key) {
        await deleteFromSpaces(key).catch(() => {});
      }
    }
    throw error;
  }
};

const DeleteBanner = async (id: string, user?: JwtPayload) => {
  const banner = await prisma.banner.findUnique({
    where: { id },
  });

  if (!banner) {
    throw new AppError(httpStatus.NOT_FOUND, 'Banner not found');
  }

  if (user) {
    const isAdmin = user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN;

    if (!isAdmin) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Only admins can delete banners',
      );
    }
  }

  if (banner.image) {
    const imageKey = extractKeyFromUrl(banner.image);
    if (imageKey) {
      await deleteFromSpaces(imageKey).catch(() => {});
    }
  }

  await prisma.banner.delete({
    where: { id },
  });

  return null;
};

export const BannerService = {
  CreateBanner,
  GetAllBanner,
  GetSingleBanner,
  UpdateBanner,
  DeleteBanner,
};

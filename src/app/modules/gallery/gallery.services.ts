/* eslint-disable @typescript-eslint/no-explicit-any */
import { Gallery, Prisma, Role } from '@prisma/client';
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

const CreateGallery = async (
  payload: Gallery,
  file?: Express.Multer.File,
  user?: JwtPayload,
) => {
  let imageUrl: string | null = null;

  if (user) {
    const isAdmin = user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN;
    if (!isAdmin) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Only admins can create gallery items',
      );
    }
  }

  try {
    if (file) {
      const uploadResult = await uploadToSpaces(file, {
        folder: 'gallery/images',
        filename: `gallery_image_${Date.now()}${path.extname(file.originalname)}`,
      });
      imageUrl = uploadResult?.url || null;
    }

    if (!imageUrl) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Gallery image is required');
    }

    const result = await prisma.gallery.create({
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

const GetAllGallery = async (query: any, options: any) => {
  const { search } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);

  const andCondition: Prisma.GalleryWhereInput[] = [];

  if (search) {
    andCondition.push({
      OR: [{ title: { contains: search, mode: 'insensitive' } }],
    });
  }

  const whereCondition: Prisma.GalleryWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.gallery.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sort_by && sort_order
        ? { [sort_by]: sort_order }
        : { created_at: 'desc' },
  });

  const total = await prisma.gallery.count({
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

const GetSingleGallery = async (id: string) => {
  const gallery = await prisma.gallery.findUnique({
    where: { id },
  });

  if (!gallery) {
    throw new AppError(httpStatus.NOT_FOUND, 'Gallery item not found');
  }

  return gallery;
};

const UpdateGallery = async (
  id: string,
  payload: Partial<Gallery>,
  file?: Express.Multer.File,
  user?: JwtPayload,
) => {
  const gallery = await prisma.gallery.findUnique({
    where: { id },
  });

  if (!gallery) {
    throw new AppError(httpStatus.NOT_FOUND, 'Gallery item not found');
  }

  if (user) {
    const isAdmin = user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN;

    if (!isAdmin) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Only admins can update gallery items',
      );
    }
  }

  let imageUrl: string | null = null;

  try {
    if (file) {
      if (gallery.image) {
        const oldKey = extractKeyFromUrl(gallery.image);
        if (oldKey) {
          await deleteFromSpaces(oldKey).catch(() => {});
        }
      }

      const uploadResult = await uploadToSpaces(file, {
        folder: 'gallery/images',
        filename: `gallery_image_${Date.now()}${path.extname(file.originalname)}`,
      });
      imageUrl = uploadResult?.url || null;
    }

    const result = await prisma.gallery.update({
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

const DeleteGallery = async (id: string, user?: JwtPayload) => {
  const gallery = await prisma.gallery.findUnique({
    where: { id },
  });

  if (!gallery) {
    throw new AppError(httpStatus.NOT_FOUND, 'Gallery item not found');
  }

  if (user) {
    const isAdmin = user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN;

    if (!isAdmin) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Only admins can delete gallery items',
      );
    }
  }

  if (gallery.image) {
    const imageKey = extractKeyFromUrl(gallery.image);
    if (imageKey) {
      await deleteFromSpaces(imageKey).catch(() => {});
    }
  }

  await prisma.gallery.delete({
    where: { id },
  });

  return null;
};

export const GalleryService = {
  CreateGallery,
  GetAllGallery,
  GetSingleGallery,
  UpdateGallery,
  DeleteGallery,
};

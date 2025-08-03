/* eslint-disable @typescript-eslint/no-explicit-any */
import { Event, Prisma, Role } from '@prisma/client';
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

interface EventCreatePayload
  extends Omit<
    Event,
    | 'id'
    | 'created_at'
    | 'updated_at'
    | 'author_id'
  > {
  author_id?: string;
}

const CreateEvent = async (
  payload: EventCreatePayload,
  file?: Express.Multer.File,
  user?: JwtPayload,
) => {
  let coverImageUrl: string | null = null;

  try {
    // Validate author exists
    const isValidUser = await prisma.user.findUnique({
      where: { id: user?.id },
    });

    if (!isValidUser) {
      throw new AppError(httpStatus.NOT_FOUND, 'Author not found');
    }

    // Handle file upload if present
    if (file) {
      const uploadResult = await uploadToSpaces(file, {
        folder: 'events/covers',
        filename: `event_cover_${Date.now()}${path.extname(file.originalname)}`,
      });
      coverImageUrl = uploadResult?.url || null;
    }

    const result = await prisma.event.create({
      data: {
        ...payload,
        author_id: user?.id,
        cover_image: coverImageUrl,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return result;
  } catch (error) {
    if (coverImageUrl) {
      const key = extractKeyFromUrl(coverImageUrl);
      if (key) {
        await deleteFromSpaces(key).catch(() => {});
      }
    }
    throw error;
  }
};

const GetAllEvent = async (query: any, options: any) => {
  const { search, author_id } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);

  const andCondition: Prisma.EventWhereInput[] = [{ is_deleted: false }];

  if (search) {
    andCondition.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (author_id) {
    andCondition.push({ author_id });
  }

  const whereCondition: Prisma.EventWhereInput = { AND: andCondition };

  const result = await prisma.event.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sort_by && sort_order
        ? { [sort_by]: sort_order }
        : { created_at: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          profile_picture: true,
        },
      },
    },
  });

  const total = await prisma.event.count({
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

const GetSingleEvent = async (id: string) => {
  const event = await prisma.event.findFirst({
    where: {
      id,
      is_deleted: false,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          profile_picture: true,
        },
      },
    },
  });

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
  }

  return event;
};

const UpdateEvent = async (
  id: string,
  payload: Partial<EventCreatePayload>,
  file?: Express.Multer.File,
  user?: JwtPayload,
) => {
  const event = await prisma.event.findUnique({
    where: { id, is_deleted: false },
  });

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
  }

  // Check authorization: admins can update any event, others can only update their own
  if (user) {
    const isAdmin = user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN;
    const isOwner = event.author_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You can only update your own events',
      );
    }
  }

  let coverImageUrl: string | null = null;

  try {
    if (file) {
      if (event.cover_image) {
        const oldKey = extractKeyFromUrl(event.cover_image);
        if (oldKey) {
          await deleteFromSpaces(oldKey).catch(() => {});
        }
      }

      const uploadResult = await uploadToSpaces(file, {
        folder: 'events/covers',
        filename: `event_cover_${Date.now()}${path.extname(file.originalname)}`,
      });
      coverImageUrl = uploadResult?.url || null;
    }

    const result = await prisma.event.update({
      where: { id },
      data: {
        ...payload,
        ...(coverImageUrl && { cover_image: coverImageUrl }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_picture: true,
          },
        },
      },
    });

    return result;
  } catch (error) {
    if (coverImageUrl) {
      const key = extractKeyFromUrl(coverImageUrl);
      if (key) {
        await deleteFromSpaces(key).catch(() => {});
      }
    }
    throw error;
  }
};

const DeleteEvent = async (
  id: string,
  isHardDelete: boolean,
  user?: JwtPayload,
) => {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
  }

  // Check authorization: admins can delete any event, others can only delete their own
  if (user) {
    const isAdmin = user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN;
    const isOwner = event.author_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You can only delete your own events',
      );
    }
  }

  if (isHardDelete) {
    if (event.cover_image) {
      const imageKey = extractKeyFromUrl(event.cover_image);
      if (imageKey) {
        await deleteFromSpaces(imageKey).catch(() => {});
      }
    }

    await prisma.event.delete({
      where: { id },
    });
  } else {
    await prisma.event.update({
      where: { id },
      data: { is_deleted: true },
    });
  }

  return null;
};

export const EventService = {
  CreateEvent,
  GetAllEvent,
  GetSingleEvent,
  UpdateEvent,
  DeleteEvent,
};

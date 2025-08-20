/* eslint-disable @typescript-eslint/no-explicit-any */
import { Blog, Prisma, Role } from '@prisma/client';
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
import BlogUtils from './blog.utils';
import { JwtPayload } from 'jsonwebtoken';

interface BlogCreatePayload
  extends Omit<
    Blog,
    | 'id'
    | 'created_at'
    | 'updated_at'
    | 'slug'
    | 'approved_at'
    | 'approved_by_id'
  > {
  slug?: string;
}

const CreateBlog = async (
  payload: BlogCreatePayload,
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
        folder: 'blogs/covers',
        filename: `blog_cover_${Date.now()}${path.extname(file.originalname)}`,
      });
      coverImageUrl = uploadResult?.url || null;
    }

    // Generate unique slug if not provided
    const slug = await BlogUtils.generateUniqueSlug(payload.title, prisma);

    const result = await prisma.blog.create({
      data: {
        ...payload,
        author_id: user?.id,
        slug,
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

const GetAllBlog = async (query: any, options: any) => {
  const { search, is_published, is_approved, author_id } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);

  const andCondition: Prisma.BlogWhereInput[] = [{ is_deleted: false }];

  if (search) {
    andCondition.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (is_published !== undefined) {
    andCondition.push({ is_published: is_published === 'true' });
  }

  if (is_approved !== undefined) {
    andCondition.push({ is_approved: is_approved === 'true' });
  }

  if (author_id) {
    andCondition.push({ author_id });
  }

  const whereCondition: Prisma.BlogWhereInput = { AND: andCondition };

  const result = await prisma.blog.findMany({
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
      approved_by: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const total = await prisma.blog.count({
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

const GetSingleBlog = async (identifier: string) => {
  const blog = await prisma.blog.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
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
      approved_by: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!blog) {
    throw new AppError(httpStatus.NOT_FOUND, 'Blog not found');
  }

  return blog;
};

const UpdateBlog = async (
  id: string,
  payload: Partial<BlogCreatePayload>,
  file?: Express.Multer.File,
  user?: JwtPayload,
) => {
  const blog = await prisma.blog.findUnique({
    where: { id, is_deleted: false },
  });

  if (!blog) {
    throw new AppError(httpStatus.NOT_FOUND, 'Blog not found');
  }

  // Check authorization: admins can update any blog, others can only update their own
  if (user) {
    const isAdmin = user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN;
    const isOwner = blog.author_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You can only update your own blogs',
      );
    }
  }

  let coverImageUrl: string | null = null;

  try {
    if (file) {
      if (blog.cover_image) {
        const oldKey = extractKeyFromUrl(blog.cover_image);
        if (oldKey) {
          await deleteFromSpaces(oldKey).catch(() => {});
        }
      }

      const uploadResult = await uploadToSpaces(file, {
        folder: 'blogs/covers',
        filename: `blog_cover_${Date.now()}${path.extname(file.originalname)}`,
      });
      coverImageUrl = uploadResult?.url || null;
    }

    let updatedSlug = payload.slug;
    if (payload.title && payload.title !== blog.title) {
      updatedSlug = await BlogUtils.generateUniqueSlug(
        payload.title,
        prisma,
        id,
      );
    }

    const result = await prisma.blog.update({
      where: { id },
      data: {
        ...payload,
        ...(updatedSlug && { slug: updatedSlug }),
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
        approved_by: {
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

const DeleteBlog = async (
  id: string,
  isHardDelete: boolean,
  user?: JwtPayload,
) => {
  const blog = await prisma.blog.findUnique({
    where: { id },
  });

  if (!blog) {
    throw new AppError(httpStatus.NOT_FOUND, 'Blog not found');
  }

  // Check authorization: admins can delete any blog, others can only delete their own
  if (user) {
    const isAdmin = user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN;
    const isOwner = blog.author_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You can only delete your own blogs',
      );
    }
  }

  if (isHardDelete) {
    if (blog.cover_image) {
      const imageKey = extractKeyFromUrl(blog.cover_image);
      if (imageKey) {
        await deleteFromSpaces(imageKey).catch(() => {});
      }
    }

    await prisma.blog.delete({
      where: { id },
    });
  } else {
    await prisma.blog.update({
      where: { id },
      data: { is_deleted: true },
    });
  }

  return null;
};

const GetMyBlogs = async (userId: string, query: any, options: any) => {
  const { search, is_published, is_approved } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);

  const andCondition: Prisma.BlogWhereInput[] = [
    { is_deleted: false },
    { author_id: userId },
  ];

  if (search) {
    andCondition.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (is_published !== undefined) {
    andCondition.push({ is_published: is_published === 'true' });
  }

  if (is_approved !== undefined) {
    andCondition.push({ is_approved: is_approved === 'true' });
  }

  const whereCondition: Prisma.BlogWhereInput = { AND: andCondition };

  const result = await prisma.blog.findMany({
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
      approved_by: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const total = await prisma.blog.count({
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

export const BlogService = {
  CreateBlog,
  GetAllBlog,
  GetSingleBlog,
  UpdateBlog,
  DeleteBlog,
  GetMyBlogs,
};

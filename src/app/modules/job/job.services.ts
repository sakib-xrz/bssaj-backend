/* eslint-disable @typescript-eslint/no-explicit-any */
import { Job, Prisma, Role } from '@prisma/client';
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
import JobConstants from './job.constant';

const CreateJob = async (
  payload: Job,
  file?: Express.Multer.File,
  user?: JwtPayload,
) => {
  let companyLogoUrl: string | null = null;

  try {
    // Validate user exists
    const isValidUser = await prisma.user.findUnique({
      where: {
        id: user?.id,
        role: {
          in: [Role.ADMIN, Role.SUPER_ADMIN, Role.AGENCY],
        },
      },
    });

    if (!isValidUser) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check authorization: only admin, super_admin, and users can post
    const isAdmin =
      user?.role === Role.SUPER_ADMIN || user?.role === Role.ADMIN;

    if (!isAdmin && user?.role !== Role.AGENCY) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Only admins and users can post jobs',
      );
    }

    // Handle file upload if present
    if (file) {
      const uploadResult = await uploadToSpaces(file, {
        folder: 'jobs/company-logos',
        filename: `company_logo_${Date.now()}${path.extname(file.originalname)}`,
      });
      companyLogoUrl = uploadResult?.url || null;
    }

    const result = await prisma.job.create({
      data: {
        ...payload,
        posted_by_id: user?.id,
        company_logo: companyLogoUrl,
      },
      include: {
        posted_by: {
          select: {
            id: true,
            name: true,
            email: true,
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
    if (companyLogoUrl) {
      const key = extractKeyFromUrl(companyLogoUrl);
      if (key) {
        await deleteFromSpaces(key).catch(() => {});
      }
    }
    throw error;
  }
};

const GetAllJobs = async (query: any, options: any) => {
  const { search, kind, type, posted_by_id, is_approved, company_name } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);

  const andCondition: Prisma.JobWhereInput[] = [{ is_deleted: false }];

  if (search) {
    andCondition.push({
      OR: JobConstants.searchableFields.map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      })),
    });
  }

  if (kind) {
    andCondition.push({ kind });
  }

  if (type) {
    andCondition.push({ type });
  }

  if (posted_by_id) {
    andCondition.push({ posted_by_id });
  }

  if (is_approved !== undefined) {
    andCondition.push({
      approved_at: is_approved === 'true' ? { not: null } : null,
    });
  }

  if (company_name) {
    andCondition.push({
      company_name: { contains: company_name, mode: 'insensitive' },
    });
  }

  const whereCondition: Prisma.JobWhereInput = { AND: andCondition };

  const result = await prisma.job.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sort_by && sort_order
        ? { [sort_by]: sort_order }
        : { created_at: 'desc' },
    include: {
      posted_by: {
        select: {
          id: true,
          name: true,
          email: true,
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

  const total = await prisma.job.count({
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

const GetSingleJob = async (id: string) => {
  const job = await prisma.job.findFirst({
    where: {
      id,
      is_deleted: false,
    },
    include: {
      posted_by: {
        select: {
          id: true,
          name: true,
          email: true,
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

  if (!job) {
    throw new AppError(httpStatus.NOT_FOUND, 'Job not found');
  }

  return job;
};

const UpdateJob = async (
  id: string,
  payload: Partial<Job>,
  file?: Express.Multer.File,
  user?: JwtPayload,
) => {
  const job = await prisma.job.findUnique({
    where: { id, is_deleted: false },
  });

  if (!job) {
    throw new AppError(httpStatus.NOT_FOUND, 'Job not found');
  }

  // Check authorization: admins can update any job, others can only update their own
  const isAdmin = user?.role === Role.SUPER_ADMIN || user?.role === Role.ADMIN;
  const isOwner = job.posted_by_id === user?.id;

  if (!isAdmin && !isOwner) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only update your own jobs',
    );
  }

  // If already approved, only admins can update
  if (job.approved_at && !isAdmin) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Cannot update approved jobs. Contact admin for changes.',
    );
  }

  let companyLogoUrl: string | null = null;

  try {
    if (file) {
      if (job.company_logo) {
        const oldKey = extractKeyFromUrl(job.company_logo);
        if (oldKey) {
          await deleteFromSpaces(oldKey).catch(() => {});
        }
      }

      const uploadResult = await uploadToSpaces(file, {
        folder: 'jobs/company-logos',
        filename: `company_logo_${Date.now()}${path.extname(file.originalname)}`,
      });
      companyLogoUrl = uploadResult?.url || null;
    }

    const result = await prisma.job.update({
      where: { id },
      data: {
        ...payload,
        ...(companyLogoUrl && { company_logo: companyLogoUrl }),
        // Reset approval when job is updated by non-admin
        ...(!isAdmin &&
          job.approved_at && {
            approved_at: null,
            approved_by_id: null,
          }),
      },
      include: {
        posted_by: {
          select: {
            id: true,
            name: true,
            email: true,
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
    if (companyLogoUrl) {
      const key = extractKeyFromUrl(companyLogoUrl);
      if (key) {
        await deleteFromSpaces(key).catch(() => {});
      }
    }
    throw error;
  }
};

const DeleteJob = async (
  id: string,
  isHardDelete: boolean,
  user?: JwtPayload,
) => {
  const job = await prisma.job.findUnique({
    where: { id },
  });

  if (!job) {
    throw new AppError(httpStatus.NOT_FOUND, 'Job not found');
  }

  // Check authorization: admins can delete any job, others can only delete their own
  const isAdmin = user?.role === Role.SUPER_ADMIN || user?.role === Role.ADMIN;
  const isOwner = job.posted_by_id === user?.id;

  if (!isAdmin && !isOwner) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only delete your own jobs',
    );
  }

  if (isHardDelete) {
    if (job.company_logo) {
      const imageKey = extractKeyFromUrl(job.company_logo);
      if (imageKey) {
        await deleteFromSpaces(imageKey).catch(() => {});
      }
    }

    await prisma.job.delete({
      where: { id },
    });
  } else {
    await prisma.job.update({
      where: { id },
      data: { is_deleted: true },
    });
  }

  return null;
};

const GetMyJobs = async (userId: string, query: any, options: any) => {
  const { search, kind, type, is_approved } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);

  const andCondition: Prisma.JobWhereInput[] = [
    { is_deleted: false },
    { posted_by_id: userId },
  ];

  if (search) {
    andCondition.push({
      OR: JobConstants.searchableFields.map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      })),
    });
  }

  if (kind) {
    andCondition.push({ kind });
  }

  if (type) {
    andCondition.push({ type });
  }

  if (is_approved !== undefined) {
    andCondition.push({
      approved_at: is_approved === 'true' ? { not: null } : null,
    });
  }

  const whereCondition: Prisma.JobWhereInput = { AND: andCondition };

  const result = await prisma.job.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sort_by && sort_order
        ? { [sort_by]: sort_order }
        : { created_at: 'desc' },
    include: {
      posted_by: {
        select: {
          id: true,
          name: true,
          email: true,
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

  const total = await prisma.job.count({
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

export const JobService = {
  CreateJob,
  GetAllJobs,
  GetSingleJob,
  UpdateJob,
  DeleteJob,
  GetMyJobs,
};

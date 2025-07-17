/* eslint-disable @typescript-eslint/no-explicit-any */
import { Committee, Prisma } from '@prisma/client';
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

const CreateCommittee = async (payload: any, file?: Express.Multer.File) => {
  let profilePictureUrl: string | null = null;

  try {
    if (file) {
      const uploadResult = await uploadToSpaces(file, {
        folder: 'committee-profiles',
        filename: `committee_${Date.now()}${path.extname(file.originalname)}`,
      });
      profilePictureUrl = uploadResult?.url || null;
    }

    const result = await prisma.committee.create({
      data: {
        ...payload,
        profile_picture: profilePictureUrl,
      },
    });

    return result;
  } catch (error) {
    if (profilePictureUrl) {
      const key = extractKeyFromUrl(profilePictureUrl);
      if (key) {
        await deleteFromSpaces(key).catch(() => {}); // Ignore cleanup errors
      }
    }
    throw error;
  }
};

const GetSingleCommittee = async (id: string) => {
  const existingCommittee = await prisma.committee.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingCommittee) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid Committee Member Id');
  }

  return existingCommittee;
};

const GetAllCommittee = async (query: any, options: any) => {
  const { term_start_year, term_end_year, search, ...filterData } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);
  const andCondition: Prisma.CommitteeWhereInput[] = [];

  if (term_start_year && term_end_year) {
    andCondition.push({
      term_start_year: term_start_year,
      term_end_year: term_end_year,
    });
  } else if (term_start_year) {
    andCondition.push({
      term_start_year: term_start_year,
    });
  } else if (term_end_year) {
    andCondition.push({
      term_end_year: term_end_year,
    });
  }

  if (search) {
    andCondition.push({
      name: {
        contains: search,
        mode: 'insensitive',
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((field) => ({
        [field]: filterData[field],
      })),
    });
  }

  const whereCondition: Prisma.CommitteeWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const designationOrder = [
    'PRESIDENT',
    'SR_VICE_PRESIDENT',
    'VICE_PRESIDENT',
    'GENERAL_SECRETARY',
    'JOINT_GENERAL_SECRETARY',
    'TREASURER',
    'JOINT_TREASURER',
    'EXECUTIVE_MEMBER',
    'ADVISOR',
    'OTHER',
  ];

  const result = await prisma.committee.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: sort_by && sort_order ? { [sort_by]: sort_order } : undefined,
  });

  const sortedResult =
    sort_by && sort_order
      ? result
      : result.sort((a, b) => {
          const aIndex = designationOrder.indexOf(a.designation);
          const bIndex = designationOrder.indexOf(b.designation);

          const aOrder = aIndex === -1 ? designationOrder.length : aIndex;
          const bOrder = bIndex === -1 ? designationOrder.length : bIndex;

          return aOrder - bOrder;
        });

  const total = await prisma.committee.count({
    where: whereCondition,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: sortedResult,
  };
};

const UpdateCommittee = async (
  id: string,
  payload: Partial<Committee>,
  file?: Express.Multer.File,
) => {
  const committee = await prisma.committee.findUnique({
    where: {
      id,
    },
  });

  if (!committee) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid committee member id');
  }

  let profilePictureUrl: string | null = null;

  try {
    if (file) {
      if (committee.profile_picture) {
        const oldKey = extractKeyFromUrl(committee.profile_picture);
        if (oldKey) {
          await deleteFromSpaces(oldKey).catch(() => {});
        }
      }

      const uploadResult = await uploadToSpaces(file, {
        folder: 'committee-profiles',
        filename: `committee_${Date.now()}${path.extname(file.originalname)}`,
      });
      profilePictureUrl = uploadResult?.url || null;
    }

    const result = await prisma.committee.update({
      where: {
        id: id,
      },
      data: {
        ...payload,
        ...(profilePictureUrl && { profile_picture: profilePictureUrl }),
      },
    });

    return result;
  } catch (error) {
    if (profilePictureUrl) {
      const key = extractKeyFromUrl(profilePictureUrl);
      if (key) {
        await deleteFromSpaces(key).catch(() => {}); // Ignore cleanup errors
      }
    }
    throw error;
  }
};

const DeleteCommittee = async (id: string) => {
  const existingCommittee = await prisma.committee.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingCommittee) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This committee member is not found!',
    );
  }

  if (existingCommittee.profile_picture) {
    const key = extractKeyFromUrl(existingCommittee.profile_picture);
    if (key) {
      await deleteFromSpaces(key).catch(() => {}); // Ignore cleanup errors
    }
  }

  await prisma.committee.delete({
    where: {
      id: id,
    },
  });

  return null;
};

const GetUniqueTermPairs = async () => {
  const result = await prisma.committee.findMany({
    select: {
      term_start_year: true,
      term_end_year: true,
    },
    distinct: ['term_start_year', 'term_end_year'],
    orderBy: [{ term_start_year: 'desc' }, { term_end_year: 'desc' }],
  });

  return result;
};

const CommitteeService = {
  CreateCommittee,
  GetSingleCommittee,
  GetAllCommittee,
  UpdateCommittee,
  DeleteCommittee,
  GetUniqueTermPairs,
};

export default CommitteeService;

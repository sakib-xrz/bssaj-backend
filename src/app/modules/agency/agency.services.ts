/* eslint-disable @typescript-eslint/no-explicit-any */
import { Agency, Prisma, Role } from '@prisma/client';
import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import config from '../../config';
import AppError from '../../errors/AppError';
import calculatePagination from '../../utils/pagination';
import prisma from '../../utils/prisma';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
} from '../../utils/handelFile';
import AgencyUtils from './agency.utils';

const CreateAgency = async (payload: any, files: Express.Multer.File[]) => {
  let logo: string | null = null;
  let uploadedSuccessStories: string[] = [];
  let generatedPassword: string = '';

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.contact_email },
    });

    if (existingUser) {
      throw new AppError(
        httpStatus.CONFLICT,
        'User with this email already exists',
      );
    }

    generatedPassword = AgencyUtils.generateRandomPassword(12);
    const hashedPassword = await bcrypt.hash(
      generatedPassword,
      Number(config.bcrypt_salt_rounds),
    );

    const logoFile = files?.find((file) => file.fieldname === 'logo');
    if (logoFile) {
      const logoUploadResult = await uploadToCloudinary(logoFile, {
        folder: 'agency-logos',
        public_id: `agency_logo_${Date.now()}`,
      });
      logo = logoUploadResult?.secure_url || null;
    }

    const successStoryFiles =
      files?.filter((file) =>
        file.fieldname.startsWith('successStoryImages'),
      ) || [];

    if (successStoryFiles.length > 0) {
      const uploadPromises = successStoryFiles.map((file, index) =>
        uploadToCloudinary(file, {
          folder: 'agency-success-stories',
          public_id: `success_story_${Date.now()}_${index}`,
        }),
      );

      const uploadResults = await Promise.all(uploadPromises);
      uploadedSuccessStories = uploadResults
        .map((result) => result?.secure_url)
        .filter((url) => url !== undefined) as string[];
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: payload.name,
          email: payload.contact_email,
          password: hashedPassword,
          role: Role.AGENCY,
        },
      });

      const agencyData: Partial<Agency> = {
        user_id: user.id,
        name: payload.name,
        contact_email: payload.contact_email,
        contact_phone: payload.contact_phone || null,
        website: payload.website || null,
        director_name: payload.director_name || null,
        established_year: payload.established_year
          ? Number(payload.established_year)
          : null,
        description: payload.description || null,
        address: payload.address || null,
        facebook_url: payload.facebook_url || null,
        logo: logo,
        status: payload.status || 'PENDING',
        is_approved: payload.is_approved === 'true' ? true : false,
        is_deleted: payload.is_deleted === 'true' ? true : false,
      };

      const agency = await tx.agency.create({
        data: agencyData as Agency,
      });

      if (uploadedSuccessStories.length > 0) {
        const successStoryData = uploadedSuccessStories.map((imageUrl) => ({
          agency_id: agency.id,
          image: imageUrl,
        }));

        await tx.agencySuccessStory.createMany({
          data: successStoryData,
        });
      }

      return await tx.agency.findUnique({
        where: { id: agency.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          success_stories: true,
        },
      });
    });

    return {
      ...result,
    };
  } catch (error) {
    if (logo) {
      const publicId = extractPublicIdFromUrl(logo);
      if (publicId) await deleteFromCloudinary([publicId]).catch(() => {});
    }
    if (uploadedSuccessStories.length > 0) {
      const publicIds = uploadedSuccessStories
        .map((url) => extractPublicIdFromUrl(url))
        .filter((id) => id) as string[];
      if (publicIds.length > 0)
        await deleteFromCloudinary(publicIds).catch(() => {});
    }

    throw error;
  }
};

const GetAllAgency = async (query: any, options: any) => {
  const { search, status } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);

  const andCondition: Prisma.AgencyWhereInput[] = [];

  if (search) {
    andCondition.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { director_name: { contains: search, mode: 'insensitive' } },
        { contact_email: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (status) {
    andCondition.push({ status });
  }

  // Filter out deleted agencies by default
  andCondition.push({ is_deleted: false });

  const whereCondition: Prisma.AgencyWhereInput = { AND: andCondition };

  const result = await prisma.agency.findMany({
    where: whereCondition,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      success_stories: true,
    },
    skip,
    take: limit,
    orderBy:
      sort_by && sort_order
        ? { [sort_by]: sort_order }
        : { created_at: 'desc' },
  });

  const total = await prisma.agency.count({
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

const GetSingleAgency = async (id: string) => {
  const result = await prisma.agency.findUnique({
    where: { id, is_deleted: false },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      success_stories: true,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Agency not found');
  }

  return result;
};

const UpdateAgency = async (
  payload: Partial<Agency>,
  id: string,
  files?: Express.Multer.File[],
) => {
  const existingAgency = await prisma.agency.findUnique({
    where: { id, is_deleted: false },
    include: { success_stories: true },
  });

  if (!existingAgency) {
    throw new AppError(httpStatus.NOT_FOUND, 'Agency not found');
  }

  let logo = existingAgency.logo;
  let newSuccessStories: string[] = [];

  try {
    // Handle logo update - find logo file from array
    const logoFile = files?.find((file) => file.fieldname === 'logo');
    if (logoFile) {
      // Delete old logo if exists
      if (existingAgency.logo) {
        const oldPublicId = extractPublicIdFromUrl(existingAgency.logo);
        if (oldPublicId)
          await deleteFromCloudinary([oldPublicId]).catch(() => {});
      }

      const logoUploadResult = await uploadToCloudinary(logoFile, {
        folder: 'agency-logos',
        public_id: `agency_logo_${Date.now()}`,
      });
      logo = logoUploadResult?.secure_url || null;
    }

    // Handle success story images - filter files with fieldname starting with 'successStoryImages'
    const successStoryFiles =
      files?.filter((file) =>
        file.fieldname.startsWith('successStoryImages'),
      ) || [];

    if (successStoryFiles.length > 0) {
      // Delete old success stories
      if (existingAgency.success_stories.length > 0) {
        const oldPublicIds = existingAgency.success_stories
          .map((story) => extractPublicIdFromUrl(story.image))
          .filter((id) => id) as string[];
        if (oldPublicIds.length > 0) {
          await deleteFromCloudinary(oldPublicIds).catch(() => {});
        }

        // Delete old success story records
        await prisma.agencySuccessStory.deleteMany({
          where: { agency_id: id },
        });
      }

      // Upload new success stories
      const uploadPromises = successStoryFiles.map((file, index) =>
        uploadToCloudinary(file, {
          folder: 'agency-success-stories',
          public_id: `success_story_${Date.now()}_${index}`,
        }),
      );

      const uploadResults = await Promise.all(uploadPromises);
      newSuccessStories = uploadResults
        .map((result) => result?.secure_url)
        .filter((url) => url !== undefined) as string[];

      // Create new success story records
      const successStoryPromises = newSuccessStories.map((imageUrl) =>
        prisma.agencySuccessStory.create({
          data: {
            agency_id: id,
            image: imageUrl,
          },
        }),
      );

      await Promise.all(successStoryPromises);
    }

    const updateData = {
      ...payload,
      logo,
    };

    const result = await prisma.agency.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        success_stories: true,
      },
    });

    return result;
  } catch (error) {
    // Clean up newly uploaded files on error
    if (newSuccessStories.length > 0) {
      const publicIds = newSuccessStories
        .map((url) => extractPublicIdFromUrl(url))
        .filter((id) => id) as string[];
      if (publicIds.length > 0)
        await deleteFromCloudinary(publicIds).catch(() => {});
    }
    throw error;
  }
};

const DeleteAgency = async (id: string) => {
  const existingAgency = await prisma.agency.findUnique({
    where: { id, is_deleted: false },
    include: { success_stories: true, user: true },
  });

  if (!existingAgency) {
    throw new AppError(httpStatus.NOT_FOUND, 'Agency not found');
  }

  // Soft delete agency and associated user
  await prisma.$transaction([
    prisma.agency.update({
      where: { id },
      data: { is_deleted: true },
    }),
    prisma.user.update({
      where: { id: existingAgency.user_id },
      data: { is_deleted: true },
    }),
  ]);

  return { message: 'Agency and associated user deleted successfully' };
};

export const AgencyService = {
  CreateAgency,
  GetAllAgency,
  GetSingleAgency,
  UpdateAgency,
  DeleteAgency,
};

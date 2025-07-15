/* eslint-disable @typescript-eslint/no-explicit-any */
import { Agency, Prisma, Role } from '@prisma/client';
import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import config from '../../config';
import AppError from '../../errors/AppError';
import calculatePagination from '../../utils/pagination';
import prisma from '../../utils/prisma';
import path from 'path';
import {
  uploadToSpaces,
  deleteFromSpaces,
  deleteMultipleFromSpaces,
  extractKeyFromUrl,
} from '../../utils/handelFile';
import AgencyUtils from './agency.utils';

const CreateAgency = async (payload: any, files: Express.Multer.File[]) => {
  let logo: string | null = null;
  let coverPhoto: string | null = null;
  let uploadedSuccessStories: string[] = [];
  let generatedPassword: string = '';
  let userId: string;
  let hashedPassword: string = '';

  try {
    // Check if we're using an existing user or creating a new one
    if (payload.user_selection_type === 'existing' && payload.user_id) {
      // Using existing user
      const existingUser = await prisma.user.findUnique({
        where: { id: payload.user_id, is_deleted: false },
      });

      if (!existingUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'Selected user not found');
      }

      // Note: User can now have multiple agencies, so we don't check for existing agency

      userId = existingUser.id;
    } else {
      // Creating new user
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
      hashedPassword = await bcrypt.hash(
        generatedPassword,
        Number(config.bcrypt_salt_rounds),
      );

      // We'll create the user in the transaction
      userId = ''; // Will be set in transaction
    }

    const logoFile = files?.find((file) => file.fieldname === 'logo');
    if (logoFile) {
      const logoUploadResult = await uploadToSpaces(logoFile, {
        folder: 'agency-logos',
        filename: `agency_logo_${Date.now()}${path.extname(logoFile.originalname)}`,
      });
      logo = logoUploadResult?.url || null;
    }

    const coverPhotoFile = files?.find(
      (file) => file.fieldname === 'cover_photo',
    );
    if (coverPhotoFile) {
      const coverPhotoUploadResult = await uploadToSpaces(coverPhotoFile, {
        folder: 'agency-cover-photos',
        filename: `agency_cover_${Date.now()}${path.extname(coverPhotoFile.originalname)}`,
      });
      coverPhoto = coverPhotoUploadResult?.url || null;
    }

    const successStoryFiles =
      files?.filter((file) =>
        file.fieldname.startsWith('successStoryImages'),
      ) || [];

    if (successStoryFiles.length > 0) {
      const uploadPromises = successStoryFiles.map((file, index) =>
        uploadToSpaces(file, {
          folder: 'agency-success-stories',
          filename: `success_story_${Date.now()}_${index}${path.extname(file.originalname)}`,
        }),
      );

      const uploadResults = await Promise.all(uploadPromises);
      uploadedSuccessStories = uploadResults
        .map((result) => result?.url)
        .filter((url) => url !== undefined) as string[];
    }

    const result = await prisma.$transaction(async (tx) => {
      let finalUserId: string;

      if (payload.user_selection_type === 'existing' && payload.user_id) {
        // Use existing user
        finalUserId = userId;
      } else {
        // Create new user
        const user = await tx.user.create({
          data: {
            name: payload.director_name,
            email: payload.contact_email,
            password: hashedPassword,
            role: Role.AGENCY,
          },
        });
        finalUserId = user.id;
      }

      const agencyData = {
        user_id: finalUserId,
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
        cover_photo: coverPhoto,
        status: payload.status || 'PENDING',
        is_deleted: payload.is_deleted === 'true' ? true : false,
      };

      const agency = await tx.agency.create({
        data: agencyData as any,
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
      const key = extractKeyFromUrl(logo);
      if (key) await deleteFromSpaces(key).catch(() => {});
    }
    if (coverPhoto) {
      const key = extractKeyFromUrl(coverPhoto);
      if (key) await deleteFromSpaces(key).catch(() => {});
    }
    if (uploadedSuccessStories.length > 0) {
      const keys = uploadedSuccessStories
        .map((url) => extractKeyFromUrl(url))
        .filter((key) => key) as string[];
      if (keys.length > 0) await deleteMultipleFromSpaces(keys).catch(() => {});
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

const GetAgencyStats = async () => {
  const totalAgencies = await prisma.agency.count({
    where: {
      is_deleted: false,
    },
  });

  const totalApprovedAgencies = await prisma.agency.count({
    where: {
      is_deleted: false,
      status: 'APPROVED',
    },
  });

  const totalPendingAgencies = await prisma.agency.count({
    where: {
      is_deleted: false,
      status: 'PENDING',
    },
  });

  const totalRejectedAgencies = await prisma.agency.count({
    where: {
      is_deleted: false,
      status: 'REJECTED',
    },
  });

  return {
    total_agencies: totalAgencies,
    total_approved_agencies: totalApprovedAgencies,
    total_pending_agencies: totalPendingAgencies,
    total_rejected_agencies: totalRejectedAgencies,
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
      approved_by: {
        select: {
          name: true,
        },
      },
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
  let coverPhoto = (existingAgency as any).cover_photo;
  let newSuccessStories: string[] = [];

  try {
    // Handle logo update - find logo file from array
    const logoFile = files?.find((file) => file.fieldname === 'logo');
    if (logoFile) {
      // Delete old logo if exists
      if (existingAgency.logo) {
        const key = extractKeyFromUrl(existingAgency.logo);
        if (key) await deleteFromSpaces(key).catch(() => {});
      }

      const logoUploadResult = await uploadToSpaces(logoFile, {
        folder: 'agency-logos',
        filename: `agency_logo_${Date.now()}${path.extname(logoFile.originalname)}`,
      });
      logo = logoUploadResult?.url || null;
    }

    // Handle cover photo update - find cover_photo file from array
    const coverPhotoFile = files?.find(
      (file) => file.fieldname === 'cover_photo',
    );
    if (coverPhotoFile) {
      // Delete old cover photo if exists
      if ((existingAgency as any).cover_photo) {
        const key = extractKeyFromUrl((existingAgency as any).cover_photo);
        if (key) await deleteFromSpaces(key).catch(() => {});
      }

      const coverPhotoUploadResult = await uploadToSpaces(coverPhotoFile, {
        folder: 'agency-cover-photos',
        filename: `agency_cover_${Date.now()}${path.extname(coverPhotoFile.originalname)}`,
      });
      coverPhoto = coverPhotoUploadResult?.url || null;
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
          .map((story) => extractKeyFromUrl(story.image))
          .filter((id) => id) as string[];
        if (oldPublicIds.length > 0) {
          await deleteMultipleFromSpaces(oldPublicIds).catch(() => {});
        }

        // Delete old success story records
        await prisma.agencySuccessStory.deleteMany({
          where: { agency_id: id },
        });
      }

      // Upload new success stories
      const uploadPromises = successStoryFiles.map((file, index) =>
        uploadToSpaces(file, {
          folder: 'agency-success-stories',
          filename: `success_story_${Date.now()}_${index}${path.extname(file.originalname)}`,
        }),
      );

      const uploadResults = await Promise.all(uploadPromises);
      newSuccessStories = uploadResults
        .map((result) => result?.url)
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
      cover_photo: coverPhoto,
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
        .map((url) => extractKeyFromUrl(url))
        .filter((id) => id) as string[];
      if (publicIds.length > 0)
        await deleteMultipleFromSpaces(publicIds).catch(() => {});
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

  // Hard delete agency and associated data
  await prisma.$transaction(async (tx) => {
    // Delete success stories first (due to foreign key constraints)
    await tx.agencySuccessStory.deleteMany({
      where: { agency_id: id },
    });

    // Delete the agency
    await tx.agency.delete({
      where: { id },
    });

    // Don't delete the user - they might have other agencies or data
  });

  // Clean up uploaded files from cloud storage
  const filesToDelete: string[] = [];

  // Add logo to deletion list
  if (existingAgency.logo) {
    const logoPublicId = extractKeyFromUrl(existingAgency.logo);
    if (logoPublicId) filesToDelete.push(logoPublicId);
  }

  // Add success story images to deletion list
  if (existingAgency.success_stories.length > 0) {
    const successStoryPublicIds = existingAgency.success_stories
      .map((story) => extractKeyFromUrl(story.image))
      .filter((id) => id) as string[];
    filesToDelete.push(...successStoryPublicIds);
  }

  // Delete files from DigitalOcean Spaces
  if (filesToDelete.length > 0) {
    await deleteMultipleFromSpaces(filesToDelete).catch(() => {
      // Log error but don't fail the operation
      console.error('Failed to delete some files from DigitalOcean Spaces');
    });
  }

  return { message: 'Agency and associated user deleted successfully' };
};

export const AgencyService = {
  CreateAgency,
  GetAllAgency,
  GetAgencyStats,
  GetSingleAgency,
  UpdateAgency,
  DeleteAgency,
};

import { AgencyStatus, Blog, MembershipStatus } from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import {
  deleteMultipleFromSpaces,
  extractKeyFromUrl,
} from '../../utils/handelFile';

const ApprovedOrRejectMember = async (
  id: string,
  status: MembershipStatus,
  approved_by_id: string,
) => {
  const existingMember = await prisma.member.findUnique({
    where: {
      id,
    },
  });

  if (!existingMember) {
    throw new AppError(httpStatus.NOT_FOUND, 'This member is not found');
  }

  if (existingMember.status === MembershipStatus.APPROVED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This member is already approved',
    );
  }

  if (status === MembershipStatus.APPROVED) {
    await prisma.member.update({
      where: {
        id,
      },
      data: {
        status,
        approved_by_id,
        approved_at: new Date(),
      },
    });
  }

  if (status === MembershipStatus.REJECTED) {
    await prisma.member.delete({
      where: {
        id,
      },
    });
  }
};

const ApprovedOrRejectAgency = async (
  id: string,
  status: AgencyStatus,
  approved_by_id: string,
) => {
  const existingAgency = await prisma.agency.findUnique({
    where: { id },
    include: {
      success_stories: true,
      user: true,
    },
  });

  if (!existingAgency) {
    throw new AppError(httpStatus.NOT_FOUND, 'Agency not found');
  }

  if (existingAgency.status === AgencyStatus.APPROVED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This agency is already approved',
    );
  }

  if (status === AgencyStatus.APPROVED) {
    const result = await prisma.$transaction(async (tx) => {
      const updatedAgency = await tx.agency.update({
        where: { id },
        data: {
          status: status,
          approved_by_id,
          approved_at: new Date(),
        },
      });

      await tx.user.update({
        where: { id: existingAgency.user_id },
        data: { role: 'AGENCY' },
      });

      return updatedAgency;
    });

    return result;
  }

  if (status === AgencyStatus.REJECTED) {
    const filesToDelete: string[] = [];

    if (existingAgency.logo) {
      const logoKey = extractKeyFromUrl(existingAgency.logo);
      if (logoKey) filesToDelete.push(logoKey);
    }

    if (
      existingAgency.success_stories &&
      existingAgency.success_stories.length > 0
    ) {
      const successStoryKeys = existingAgency.success_stories
        .map((story) => extractKeyFromUrl(story.image))
        .filter((key) => key) as string[];
      filesToDelete.push(...successStoryKeys);
    }

    await prisma.$transaction(async (tx) => {
      await tx.agency.delete({
        where: { id },
      });

      await tx.user.delete({
        where: { id: existingAgency.user_id },
      });
    });

    if (filesToDelete.length > 0) {
      try {
        await deleteMultipleFromSpaces(filesToDelete);
      } catch (error) {
        console.error(
          'Failed to delete some files from DigitalOcean Spaces:',
          error,
        );
      }
    }

    return null;
  }
};

const ApprovedOrRejectBlog = async (
  approvedId: string,
  payload: Partial<Blog>,
) => {
  const reuslt = await prisma.blog.update({
    where: {
      id: payload.id,
    },
    data: {
      approved_by_id: approvedId,
      is_published: payload.is_published,
      is_approved: payload.is_approved,
    },
  });
  return reuslt;
};

export const AdminService = {
  ApprovedOrRejectMember,
  ApprovedOrRejectAgency,
  ApprovedOrRejectBlog,
};

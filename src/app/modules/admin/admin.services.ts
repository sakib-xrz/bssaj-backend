import {
  AgencyStatus,
  Blog,
  MembershipStatus,
  UserSelectionType,
} from '@prisma/client';
import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import config from '../../config';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import sendMail from '../../utils/mailer';
import AgencyUtils from '../agency/agency.utils';
import {
  deleteMultipleFromSpaces,
  extractKeyFromUrl,
} from '../../utils/handelFile';
import { createAgencyApprovalEmailTemplate } from '../../templates';

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

  console.log('user_selection_type', existingAgency.user_selection_type);

  if (
    status === AgencyStatus.APPROVED &&
    existingAgency.user_selection_type === UserSelectionType.NEW
  ) {
    // Generate new password for the agency user
    const newPassword = AgencyUtils.generateRandomPassword(12);
    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(config.bcrypt_salt_rounds),
    );

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
        data: {
          role: 'AGENCY',
          password: hashedPassword,
        },
      });

      return updatedAgency;
    });

    try {
      const emailTemplate = createAgencyApprovalEmailTemplate(
        existingAgency.name,
        existingAgency.user.name,
        existingAgency.user.email,
        newPassword,
      );

      await sendMail(
        existingAgency.user.email,
        '🎉 Congratulations! Your Agency Registration has been Approved',
        emailTemplate,
      );
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't throw error for email failures - agency is still approved
    }

    return result;
  } else if (
    status === AgencyStatus.APPROVED &&
    existingAgency.user_selection_type === UserSelectionType.EXISTING
  ) {
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
        data: {
          role: 'AGENCY',
        },
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
      // Delete agency success stories first
      await tx.agencySuccessStory.deleteMany({
        where: { agency_id: id },
      });

      // Delete the agency
      await tx.agency.delete({
        where: { id },
      });
    });

    // Clean up files from cloud storage
    if (filesToDelete.length > 0) {
      try {
        await deleteMultipleFromSpaces(filesToDelete);
      } catch (error) {
        console.error(
          'Failed to delete some files from DigitalOcean Spaces:',
          error,
        );
        // Don't throw error for file cleanup failures
      }
    }
  }
};

const ApprovedOrRejectBlog = async (
  approvedId: string,
  payload: Partial<Blog>,
) => {
  const existingBlog = await prisma.blog.findUnique({
    where: {
      id: payload.id,
    },
  });

  if (!existingBlog) {
    throw new AppError(httpStatus.NOT_FOUND, 'This blog is not found');
  }

  if (existingBlog.is_approved === true) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This blog is already approved');
  }

  // If approving the blog
  if (payload.is_approved === true) {
    const result = await prisma.blog.update({
      where: {
        id: payload.id,
      },
      data: {
        approved_by_id: approvedId,
        is_published: payload.is_published,
        is_approved: payload.is_approved,
        approved_at: new Date(),
      },
    });
    return result;
  }

  // If rejecting the blog (hard delete)
  if (payload.is_approved === false) {
    const filesToDelete: string[] = [];

    // If blog has a cover image, prepare it for deletion
    if (existingBlog.cover_image) {
      const coverImageKey = extractKeyFromUrl(existingBlog.cover_image);
      if (coverImageKey) filesToDelete.push(coverImageKey);
    }

    // Delete the blog from database
    await prisma.blog.delete({
      where: {
        id: payload.id,
      },
    });

    // Clean up files from cloud storage
    if (filesToDelete.length > 0) {
      try {
        await deleteMultipleFromSpaces(filesToDelete);
      } catch (error) {
        console.error(
          'Failed to delete some files from DigitalOcean Spaces:',
          error,
        );
        // Don't throw error for file cleanup failures
      }
    }

    return { message: 'Blog rejected and deleted successfully' };
  }

  throw new AppError(httpStatus.BAD_REQUEST, 'Invalid approval status');
};

export const AdminService = {
  ApprovedOrRejectMember,
  ApprovedOrRejectAgency,
  ApprovedOrRejectBlog,
};

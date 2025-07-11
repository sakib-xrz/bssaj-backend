import { AgencyStatus, Blog, MembershipStatus } from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';

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
  const result = await prisma.$transaction(async (tx) => {
    const existingAgency = await tx.agency.findUnique({
      where: { id },
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
    }

    if (status === AgencyStatus.REJECTED) {
      await tx.agency.delete({
        where: { id },
      });

      await tx.user.delete({
        where: { id: existingAgency.user_id },
      });

      return null;
    }
  });

  return result;
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

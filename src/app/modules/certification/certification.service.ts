/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from '@prisma/client';
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
import CertificationUtils from './certification.utils';

interface CertificationCreatePayload {
  name: string;
  date_of_birth: string;
  gender: string;
  father_name: string;
  mother_name: string;
  student_id: string;
  completed_hours: string;
  grade: string;
  course_duration: string;
  issued_at: string;
  institute_name: string;
  agency_id: string;
}

const CreateCertification = async (
  payload: CertificationCreatePayload,
  file?: Express.Multer.File,
) => {
  let certificateUrl: string | null = null;

  try {
    // Validate agency exists
    const agency = await prisma.agency.findUnique({
      where: { id: payload.agency_id },
    });

    if (!agency) {
      throw new AppError(httpStatus.NOT_FOUND, 'Agency not found');
    }

    // Generate unique sl_no
    const slNo = await CertificationUtils.generateSlNo(payload.agency_id);

    // Handle file upload if present
    if (file) {
      const uploadResult = await uploadToSpaces(file, {
        folder: 'certifications',
        filename: `certificate_${Date.now()}${path.extname(file.originalname)}`,
      });
      certificateUrl = uploadResult?.url || null;
    }

    // Convert date strings to Date objects
    const certificationData = {
      ...payload,
      sl_no: slNo,
      date_of_birth: new Date(payload.date_of_birth),
      issued_at: new Date(payload.issued_at),
      certificate_url: certificateUrl,
    };

    const result = await prisma.certification.create({
      data: certificationData,
      include: {
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return result;
  } catch (error) {
    // Clean up uploaded file on error
    if (certificateUrl) {
      const key = extractKeyFromUrl(certificateUrl);
      if (key) {
        await deleteFromSpaces(key).catch(() => {});
      }
    }
    throw error;
  }
};

const GetAllCertification = async (query: any, options: any) => {
  const { search, agency_id } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);

  const andCondition: Prisma.CertificationWhereInput[] = [];

  // Search only by sl_no
  if (search) {
    andCondition.push({
      sl_no: {
        contains: search,
        mode: 'insensitive',
      },
    });
  }

  // Filter by agency_id
  if (agency_id) {
    andCondition.push({ agency_id });
  }

  const whereCondition: Prisma.CertificationWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.certification.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sort_by && sort_order ? { [sort_by]: sort_order } : { issued_at: 'desc' },
    include: {
      agency: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const total = await prisma.certification.count({
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

const GetSingleCertification = async (id: string) => {
  const certification = await prisma.certification.findUnique({
    where: { id },
    include: {
      agency: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
    },
  });

  if (!certification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Certification not found');
  }

  return certification;
};

const UpdateCertification = async (
  id: string,
  payload: Partial<CertificationCreatePayload>,
  file?: Express.Multer.File,
) => {
  const certification = await prisma.certification.findUnique({
    where: { id },
  });

  if (!certification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Certification not found');
  }

  let certificateUrl: string | null = null;

  try {
    // Handle file upload
    if (file) {
      // Delete old certificate file if exists
      if (certification.certificate_url) {
        const oldKey = extractKeyFromUrl(certification.certificate_url);
        if (oldKey) {
          await deleteFromSpaces(oldKey).catch(() => {});
        }
      }

      const uploadResult = await uploadToSpaces(file, {
        folder: 'certifications',
        filename: `certificate_${Date.now()}${path.extname(file.originalname)}`,
      });
      certificateUrl = uploadResult?.url || null;
    }

    // Prepare update data
    const updateData: any = { ...payload };

    if (payload.date_of_birth) {
      updateData.date_of_birth = new Date(payload.date_of_birth);
    }

    if (payload.issued_at) {
      updateData.issued_at = new Date(payload.issued_at);
    }

    if (certificateUrl) {
      updateData.certificate_url = certificateUrl;
    }

    const result = await prisma.certification.update({
      where: { id },
      data: updateData,
      include: {
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return result;
  } catch (error) {
    // Clean up newly uploaded file on error
    if (certificateUrl) {
      const key = extractKeyFromUrl(certificateUrl);
      if (key) {
        await deleteFromSpaces(key).catch(() => {});
      }
    }
    throw error;
  }
};

const DeleteCertification = async (id: string) => {
  const certification = await prisma.certification.findUnique({
    where: { id },
  });

  if (!certification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Certification not found');
  }

  // Delete certificate file if exists
  if (certification.certificate_url) {
    const fileKey = extractKeyFromUrl(certification.certificate_url);
    if (fileKey) {
      await deleteFromSpaces(fileKey).catch(() => {});
    }
  }

  await prisma.certification.delete({
    where: { id },
  });

  return null;
};

const GetCertificationsByAgency = async (
  agencyId: string,
  query: any,
  options: any,
) => {
  const { search } = query;
  const { limit, page, sort_order, sort_by, skip } =
    calculatePagination(options);

  // Validate agency exists
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
  });

  if (!agency) {
    throw new AppError(httpStatus.NOT_FOUND, 'Agency not found');
  }

  const andCondition: Prisma.CertificationWhereInput[] = [
    { agency_id: agencyId },
  ];

  // Only search by sl_no
  if (search) {
    andCondition.push({
      sl_no: {
        contains: search,
        mode: 'insensitive',
      },
    });
  }

  const whereCondition: Prisma.CertificationWhereInput = { AND: andCondition };

  const result = await prisma.certification.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sort_by && sort_order ? { [sort_by]: sort_order } : { issued_at: 'desc' },
    include: {
      agency: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const total = await prisma.certification.count({
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

const VerifyCertification = async (slNo: string) => {
  const certification = await prisma.certification.findFirst({
    where: {
      sl_no: {
        equals: slNo,
        mode: 'insensitive',
      },
    },
    include: {
      agency: {
        select: {
          id: true,
          name: true,
          logo: true,
          contact_email: true,
          website: true,
        },
      },
    },
  });

  if (!certification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Certificate not found');
  }

  return certification;
};

export const CertificationService = {
  CreateCertification,
  GetAllCertification,
  GetSingleCertification,
  UpdateCertification,
  DeleteCertification,
  GetCertificationsByAgency,
  VerifyCertification,
};

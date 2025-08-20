import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pick';
import { CertificationService } from './certification.service';

const CreateCertification = catchAsync(async (req, res) => {
  const file = req.file;
  const result = await CertificationService.CreateCertification(req.body, file);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Certification created successfully',
    data: result,
  });
});

const GetAllCertification = catchAsync(async (req, res) => {
  const query = pick(req.query, ['search', 'agency_id']);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await CertificationService.GetAllCertification(query, options);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Certifications retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const GetSingleCertification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CertificationService.GetSingleCertification(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Certification retrieved successfully',
    data: result,
  });
});

const UpdateCertification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const file = req.file;
  const result = await CertificationService.UpdateCertification(
    id,
    req.body,
    file,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Certification updated successfully',
    data: result,
  });
});

const DeleteCertification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CertificationService.DeleteCertification(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Certification deleted successfully',
    data: result,
  });
});

const GetCertificationsByAgency = catchAsync(async (req, res) => {
  const { agency_id } = req.params;
  const query = pick(req.query, ['search']);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await CertificationService.GetCertificationsByAgency(
    agency_id,
    query,
    options,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Agency certifications retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const VerifyCertification = catchAsync(async (req, res) => {
  const { sl_no } = req.params;
  const result = await CertificationService.VerifyCertification(sl_no);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Certificate verified successfully',
    data: result,
  });
});

const GetMyAgenciesCertifications = catchAsync(async (req, res) => {
  const query = pick(req.query, ['search', 'agency_id']);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await CertificationService.GetMyAgenciesCertifications(
    req.user.id,
    query,
    options,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'My agencies certifications retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const CertificationController = {
  CreateCertification,
  GetAllCertification,
  GetSingleCertification,
  UpdateCertification,
  DeleteCertification,
  GetCertificationsByAgency,
  VerifyCertification,
  GetMyAgenciesCertifications,
};

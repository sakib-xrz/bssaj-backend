import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AgencyService } from './agency.services';
import pick from '../../utils/pick';

const CreateAgency = catchAsync(async (req, res) => {
  const files = req.files as Express.Multer.File[];
  const result = await AgencyService.CreateAgency(req.body, files);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Agency and user created successfully',
    data: result,
  });
});

const GetAllAgency = catchAsync(async (req, res) => {
  const query = pick(req.query, ['name', 'search', 'status']);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await AgencyService.GetAllAgency(query, options);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Agencies retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const GetAgencyStats = catchAsync(async (req, res) => {
  const result = await AgencyService.GetAgencyStats();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Agency statistics retrieved successfully',
    data: result,
  });
});

const GetSingleAgency = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await AgencyService.GetSingleAgency(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Agency retrieved successfully',
    data: result,
  });
});

const UpdateAgency = catchAsync(async (req, res) => {
  const id = req.params.id;
  const files = req.files as Express.Multer.File[];
  const result = await AgencyService.UpdateAgency(req.body, id, files);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Agency updated successfully',
    data: result,
  });
});

const DeleteAgency = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await AgencyService.DeleteAgency(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Agency deleted successfully',
    data: result,
  });
});

const GetMyAgency = catchAsync(async (req, res) => {
  const result = await AgencyService.GetMyAgency(req.user);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Agencies retrieved successfully',
    data: result,
  });
});

export const AgencyController = {
  CreateAgency,
  GetAllAgency,
  GetAgencyStats,
  GetSingleAgency,
  UpdateAgency,
  DeleteAgency,
  GetMyAgency,
};

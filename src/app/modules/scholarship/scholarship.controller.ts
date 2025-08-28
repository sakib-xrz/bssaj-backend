import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pick';
import { ScholarshipService } from './scholarship.services';

const CreateScholarship = catchAsync(async (req, res) => {
  const result = await ScholarshipService.CreateScholarship(req.body, req.user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Scholarship created successfully',
    data: result,
  });
});

const GetAllScholarships = catchAsync(async (req, res) => {
  const query = pick(req.query, ['search', 'title', 'provider', 'eligibility']);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await ScholarshipService.GetAllScholarships(query, options);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Scholarships retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const GetScholarshipById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ScholarshipService.GetScholarshipById(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Scholarship retrieved successfully',
    data: result,
  });
});

const UpdateScholarship = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const result = await ScholarshipService.UpdateScholarship(id, req.body, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Scholarship updated successfully',
    data: result,
  });
});

const DeleteScholarship = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const result = await ScholarshipService.DeleteScholarship(id, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Scholarship deleted successfully',
    data: result,
  });
});

export const ScholarshipController = {
  CreateScholarship,
  GetAllScholarships,
  GetScholarshipById,
  UpdateScholarship,
  DeleteScholarship,
};

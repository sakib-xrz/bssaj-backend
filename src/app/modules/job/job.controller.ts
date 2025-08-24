import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pick';
import { JobService } from './job.services';
import JobConstants from './job.constant';

const CreateJob = catchAsync(async (req, res) => {
  const file = req.file;
  const user = req.user;

  const result = await JobService.CreateJob(req.body, file, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Job created successfully',
    data: result,
  });
});

const GetAllJobs = catchAsync(async (req, res) => {
  const query = pick(req.query, JobConstants.filterableFields);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await JobService.GetAllJobs(query, options);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Jobs retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const GetSingleJob = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await JobService.GetSingleJob(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Job retrieved successfully',
    data: result,
  });
});

const UpdateJob = catchAsync(async (req, res) => {
  const { id } = req.params;
  const file = req.file;
  const user = req.user;
  const result = await JobService.UpdateJob(id, req.body, file, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Job updated successfully',
    data: result,
  });
});

const DeleteJob = catchAsync(async (req, res) => {
  const { id } = req.params;
  const isHardDelete = req.query?.hard_delete === 'true' ? true : false;
  const user = req.user;
  const result = await JobService.DeleteJob(id, isHardDelete, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Job deleted successfully',
    data: result,
  });
});

const GetMyJobs = catchAsync(async (req, res) => {
  const query = pick(req.query, ['search', 'kind', 'type', 'is_approved']);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await JobService.GetMyJobs(req.user.id, query, options);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'My jobs retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const JobController = {
  CreateJob,
  GetAllJobs,
  GetSingleJob,
  UpdateJob,
  DeleteJob,
  GetMyJobs,
};

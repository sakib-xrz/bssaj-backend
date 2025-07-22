import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import pick from '../../utils/pick';
import sendResponse from '../../utils/sendResponse';
import { MembersService } from './member.service';

const CreateMember = catchAsync(async (req, res) => {
  const result = await MembersService.CreateMember(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Member created successfully',
    data: result,
  });
});

const GetAllMember = catchAsync(async (req, res) => {
  const query = pick(req.query, ['name', 'email', 'search', 'phone']);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await MembersService.GetAllMember(query, options);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Members fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const SingleMember = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await MembersService.GetSingleMember(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Single Member fetched successfully',
    data: result,
  });
});

const GetMemberStats = catchAsync(async (req, res) => {
  const result = await MembersService.GetMemberStats();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Member stats fetched successfully',
    data: result,
  });
});

const GetMyMember = catchAsync(async (req, res) => {
  const result = await MembersService.GetMyMember(req.user);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'My member fetched successfully',
    data: result,
  });
});

const UpdateMember = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await MembersService.UpdateMember(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Member updated successfully',
    data: result,
  });
});

const DeleteMember = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await MembersService.DeleteMember(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Member deleted successfully',
    data: result,
  });
});

export const MembersController = {
  CreateMember,
  GetAllMember,
  SingleMember,
  GetMemberStats,
  GetMyMember,
  UpdateMember,
  DeleteMember,
};

import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import pick from '../../utils/pick';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.services';
import AppError from '../../errors/AppError';

const CreateUser = catchAsync(async (req, res) => {
  const result = await UserService.CreateUser(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User created successfully',
    data: result,
  });
});

const GetAllUser = catchAsync(async (req, res) => {
  const query = pick(req.query, ['name', 'email', 'search']);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await UserService.GetAllUser(query, options);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Users fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const GetUserById = catchAsync(async (req, res) => {
  const result = await UserService.GetUserById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User fetched successfully',
    data: result,
  });
});

const SearchUser = catchAsync(async (req, res) => {
  const result = await UserService.SearchUser(req.query.search as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Users fetched successfully',
    data: result,
  });
});

const UpdateUser = catchAsync(async (req, res) => {
  const result = await UserService.UpdateUser(req.user.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User updated successfully',
    data: result,
  });
});

const UpdateProfilePicture = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Image is required');
  }

  const result = await UserService.UpdateProfilePicture(req.user.id, req.file);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Profile picture updated successfully',
    data: result,
  });
});

const DeleteUser = catchAsync(async (req, res) => {
  await UserService.DeleteUser(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.NO_CONTENT,
    message: 'User deleted successfully',
  });
});

export const UserController = {
  CreateUser,
  GetAllUser,
  GetUserById,
  SearchUser,
  UpdateUser,
  UpdateProfilePicture,
  DeleteUser,
};

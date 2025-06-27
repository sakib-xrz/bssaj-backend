import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import pick from '../../utils/pick';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.services';

const GetAllUser = catchAsync(async (req, res) => {
  const query = pick(req.query, ['name', 'email', 'search']);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await UserService.GetAllUser(query, options);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'fetch all users',
    meta: result.meta,
    data: result.data,
  });
});

const GetSingleUser = catchAsync(async (req, res) => {
  const result = UserService.GetSingleUser(req.params?.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'fetch single users',
    data: await result,
  });
});

export const UserController = {
  GetAllUser,
  GetSingleUser,
};

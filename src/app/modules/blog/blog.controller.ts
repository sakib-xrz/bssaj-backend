import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pick';
import { BlogService } from './blog.services';

const CreateBlog = catchAsync(async (req, res) => {
  const file = req.file;
  const result = await BlogService.CreateBlog(req.body, file);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Blog created successfully',
    data: result,
  });
});

const GetAllBlog = catchAsync(async (req, res) => {
  const query = pick(req.query, [
    'search',
    'is_published',
    'is_approved',
    'author_id',
  ]);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await BlogService.GetAllBlog(query, options);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Blogs retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const GetSingleBlog = catchAsync(async (req, res) => {
  const { identifier } = req.params;
  const result = await BlogService.GetSingleBlog(identifier);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Blog retrieved successfully',
    data: result,
  });
});

const UpdateBlog = catchAsync(async (req, res) => {
  const { id } = req.params;
  const file = req.file;
  const user = req.user; // User is added by auth middleware
  const result = await BlogService.UpdateBlog(id, req.body, file, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Blog updated successfully',
    data: result,
  });
});

const DeleteBlog = catchAsync(async (req, res) => {
  const { id } = req.params;
  const isHardDelete = req.query?.hard_delete === 'true' ? true : false;
  const user = req.user; // User is added by auth middleware
  const result = await BlogService.DeleteBlog(id, isHardDelete, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Blog deleted successfully',
    data: result,
  });
});

export const BlogController = {
  CreateBlog,
  GetAllBlog,
  GetSingleBlog,
  UpdateBlog,
  DeleteBlog,
};

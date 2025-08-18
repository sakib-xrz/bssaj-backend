import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pick';
import { BannerService } from './banner.services';

const CreateBanner = catchAsync(async (req, res) => {
  const file = req.file;
  const user = req.user;

  const result = await BannerService.CreateBanner(req.body, file, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Banner created successfully',
    data: result,
  });
});

const GetAllBanner = catchAsync(async (req, res) => {
  const query = pick(req.query, ['search']);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await BannerService.GetAllBanner(query, options);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Banners retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const GetSingleBanner = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BannerService.GetSingleBanner(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Banner retrieved successfully',
    data: result,
  });
});

const UpdateBanner = catchAsync(async (req, res) => {
  const { id } = req.params;
  const file = req.file;
  const user = req.user;
  const result = await BannerService.UpdateBanner(id, req.body, file, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Banner updated successfully',
    data: result,
  });
});

const DeleteBanner = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const result = await BannerService.DeleteBanner(id, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Banner deleted successfully',
    data: result,
  });
});

export const BannerController = {
  CreateBanner,
  GetAllBanner,
  GetSingleBanner,
  UpdateBanner,
  DeleteBanner,
};

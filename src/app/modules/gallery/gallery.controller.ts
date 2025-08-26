import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pick';
import { GalleryService } from './gallery.services';

const CreateGallery = catchAsync(async (req, res) => {
  const file = req.file;
  const user = req.user;

  const result = await GalleryService.CreateGallery(req.body, file, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Gallery item created successfully',
    data: result,
  });
});

const GetAllGallery = catchAsync(async (req, res) => {
  const query = pick(req.query, ['search']);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await GalleryService.GetAllGallery(query, options);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Gallery items retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const GetSingleGallery = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await GalleryService.GetSingleGallery(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Gallery item retrieved successfully',
    data: result,
  });
});

const UpdateGallery = catchAsync(async (req, res) => {
  const { id } = req.params;
  const file = req.file;
  const user = req.user;
  const result = await GalleryService.UpdateGallery(id, req.body, file, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Gallery item updated successfully',
    data: result,
  });
});

const DeleteGallery = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const result = await GalleryService.DeleteGallery(id, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Gallery item deleted successfully',
    data: result,
  });
});

export const GalleryController = {
  CreateGallery,
  GetAllGallery,
  GetSingleGallery,
  UpdateGallery,
  DeleteGallery,
};

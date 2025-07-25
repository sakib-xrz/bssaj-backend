import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pick';
import { NewsService } from './news.services';

const CreateNews = catchAsync(async (req, res) => {
  const result = await NewsService.CreateNews(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'News created successfully',
    data: result,
  });
});

const GetAllNews = catchAsync(async (req, res) => {
  const query = pick(req.query, ['search']);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await NewsService.GetAllNews(query, options);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'News retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const GetSingleNews = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsService.GetSingleNews(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'News retrieved successfully',
    data: result,
  });
});

const UpdateNews = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsService.UpdateNews(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'News updated successfully',
    data: result,
  });
});

const DeleteNews = catchAsync(async (req, res) => {
  const { id } = req.params;
  const isHardDelete = req.query?.hard_delete === 'true' ? true : false;
  const result = await NewsService.DeleteNews(id, isHardDelete);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'News deleted successfully',
    data: result,
  });
});

export const NewsController = {
  CreateNews,
  GetAllNews,
  GetSingleNews,
  UpdateNews,
  DeleteNews,
};

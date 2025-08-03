import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pick';
import { EventService } from './event.services';

const CreateEvent = catchAsync(async (req, res) => {
  const file = req.file;
  const user = req.user;

  const result = await EventService.CreateEvent(req.body, file, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Event created successfully',
    data: result,
  });
});

const GetAllEvent = catchAsync(async (req, res) => {
  const query = pick(req.query, ['search', 'author_id']);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await EventService.GetAllEvent(query, options);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Events retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const GetSingleEvent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await EventService.GetSingleEvent(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Event retrieved successfully',
    data: result,
  });
});

const UpdateEvent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const file = req.file;
  const user = req.user; // User is added by auth middleware
  const result = await EventService.UpdateEvent(id, req.body, file, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Event updated successfully',
    data: result,
  });
});

const DeleteEvent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const isHardDelete = req.query?.hard_delete === 'true' ? true : false;
  const user = req.user; // User is added by auth middleware
  const result = await EventService.DeleteEvent(id, isHardDelete, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Event deleted successfully',
    data: result,
  });
});

export const EventController = {
  CreateEvent,
  GetAllEvent,
  GetSingleEvent,
  UpdateEvent,
  DeleteEvent,
};

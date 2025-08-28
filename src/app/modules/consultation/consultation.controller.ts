import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pick';
import { ConsultationService } from './consultation.services';

const CreateConsultation = catchAsync(async (req, res) => {
  const result = await ConsultationService.CreateConsultation(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Consultation created successfully',
    data: result,
  });
});

const GetAllConsultation = catchAsync(async (req, res) => {
  const query = pick(req.query, ['search', 'name', 'phone', 'email']);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await ConsultationService.GetAllConsultation(query, options);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Consultations retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const GetConsultationById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ConsultationService.GetConsultationById(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Consultation retrieved successfully',
    data: result,
  });
});

const UpdateConsultationStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const result = await ConsultationService.UpdateConsultationStatus(
    id,
    req.body,
    user,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Consultation status updated successfully',
    data: result,
  });
});

const DeleteConsultation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const result = await ConsultationService.DeleteConsultation(id, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Consultation deleted successfully',
    data: result,
  });
});

export const ConsultationController = {
  CreateConsultation,
  GetAllConsultation,
  GetConsultationById,
  UpdateConsultationStatus,
  DeleteConsultation,
};

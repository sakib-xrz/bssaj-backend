import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PaymentService } from './payment.services';
import pick from '../../utils/pick';

const CreatePayment = catchAsync(async (req, res) => {
  const result = await PaymentService.CreatePayment(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Payment created successfully',
    data: result,
  });
});

const GetAllPayments = catchAsync(async (req, res) => {
  const query = pick(req.query, [
    'search',
    'payment_status',
    'agency_id',
    'payment_month',
    'start_date',
    'end_date',
  ]);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await PaymentService.GetAllPayments(query, options);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payments retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const GetPaymentStats = catchAsync(async (req, res) => {
  const result = await PaymentService.GetPaymentStats();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment statistics retrieved successfully',
    data: result,
  });
});

const GetSinglePayment = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await PaymentService.GetSinglePayment(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment retrieved successfully',
    data: result,
  });
});

const UpdatePayment = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await PaymentService.UpdatePayment(req.body, id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment updated successfully',
    data: result,
  });
});

const ApprovePayment = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await PaymentService.ApprovePayment(id, req.body, req.user);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment approved successfully',
    data: result,
  });
});

const DeletePayment = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await PaymentService.DeletePayment(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment deleted successfully',
    data: result,
  });
});

const GetAgencyPayments = catchAsync(async (req, res) => {
  const agencyId = req.params.agencyId;
  const query = pick(req.query, ['payment_status', 'payment_month']);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await PaymentService.GetAgencyPayments(
    agencyId,
    query,
    options,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Agency payments retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const BulkCreatePayments = catchAsync(async (req, res) => {
  const result = await PaymentService.BulkCreatePayments(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Bulk payments created successfully',
    data: result,
  });
});

const MarkOverduePayments = catchAsync(async (req, res) => {
  const result = await PaymentService.MarkOverduePayments();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Overdue payments marked successfully',
    data: result,
  });
});

const GetAgencyPaymentSummary = catchAsync(async (req, res) => {
  const agencyId = req.params.agencyId;
  const result = await PaymentService.GetAgencyPaymentSummary(agencyId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Agency payment summary retrieved successfully',
    data: result,
  });
});

export const PaymentController = {
  CreatePayment,
  GetAllPayments,
  GetPaymentStats,
  GetSinglePayment,
  UpdatePayment,
  ApprovePayment,
  DeletePayment,
  GetAgencyPayments,
  GetAgencyPaymentSummary,
  BulkCreatePayments,
  MarkOverduePayments,
};

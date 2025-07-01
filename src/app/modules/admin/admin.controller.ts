import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AdminService } from './admin.services';

const ApprovedOrRejectMember = catchAsync(async (req, res) => {
  await AdminService.ApprovedOrRejectMember(
    req.params?.id,
    req.body.status,
    req.user?.id,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Member status updated successfully',
  });
});

const ApprovedOrRejectAgency = catchAsync(async (req, res) => {
  const result = await AdminService.ApprovedOrRejectAgency(
    req.params?.id,
    req.body.status,
    req.user?.id,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Successfully ${result.status.toLowerCase()} the agency.`,
    data: result,
  });
});

const ApprovedOrRejectBlog = catchAsync(async (req, res) => {
  const approvedId = req?.user?.id;
  const result = await AdminService.ApprovedOrRejectBlog(approvedId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Successfully approved the blog.`,
    data: result,
  });
});

export const AdminController = {
  ApprovedOrRejectMember,
  ApprovedOrRejectAgency,
  ApprovedOrRejectBlog,
};

import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import pick from '../../utils/pick';
import sendResponse from '../../utils/sendResponse';
import CommitteeService from './committee.service';

const CreateCommittee = catchAsync(async (req, res) => {
  const file = req.file;
  const result = await CommitteeService.CreateCommittee(req.body, file);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Committee member created successfully',
    data: result,
  });
});

const GetAllCommittee = catchAsync(async (req, res) => {
  const query = pick(req.query, [
    'designation',
    'term_start_year',
    'term_end_year',
    'name',
  ]);
  const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order']);
  const result = await CommitteeService.GetAllCommittee(query, options);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Committee members fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const SingleCommittee = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CommitteeService.GetSingleCommittee(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Single Committee member fetched successfully',
    data: result,
  });
});

const UpdateCommittee = catchAsync(async (req, res) => {
  const { id } = req.params;
  const file = req.file;
  const result = await CommitteeService.UpdateCommittee(id, req.body, file);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Committee member updated successfully',
    data: result,
  });
});

const DeleteCommittee = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CommitteeService.DeleteCommittee(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Committee member deleted successfully',
    data: result,
  });
});

const GetUniqueTermPairs = catchAsync(async (req, res) => {
  const result = await CommitteeService.GetUniqueTermPairs();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Unique term pairs fetched successfully',
    data: result,
  });
});

const CommitteeController = {
  CreateCommittee,
  GetAllCommittee,
  SingleCommittee,
  UpdateCommittee,
  DeleteCommittee,
  GetUniqueTermPairs,
};

export default CommitteeController;

import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { MembersService } from "./member.service";

const CreateMember = catchAsync(async (req, res) => {
    const result = await MembersService.CreateMember(req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Member created successfully",
        data: result,
    });
});

const GetAllMember = catchAsync(async (req, res) => {
    const result = await MembersService.GetAllMember();
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Members fetched successfully",
        data: result,
    });
});

const SingleMember = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await MembersService.SingleMember(id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Member fetched successfully",
        data: result,
    });
});

const UpdateMember = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await MembersService.UpdateMember(id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Member updated successfully",
        data: result,
    });
});

const DeleteMember = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await MembersService.DeleteMember(id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Member deleted successfully",
        data: result,
    });
});

export const MembersController = {
    CreateMember,
    GetAllMember,
    SingleMember,
    UpdateMember,
    DeleteMember,
};

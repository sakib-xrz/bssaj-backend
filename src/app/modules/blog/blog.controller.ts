import httpStatus from "http-status"
import catchAsync from "../../utils/catchAsync"
import sendResponse from "../../utils/sendResponse"
import pick from "../../utils/pick"
import { BlogService } from "./blog.services"

const CreateBlog = catchAsync(async (req, res) => {
    const result = await BlogService.CreateBlog(req.body)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Blog created successfully",
        data: result
    })
})

const GetAllBlog = catchAsync(async (req, res) => {
    const query = pick(req.query, ['name', 'search'])
    const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order'])
    const result = await BlogService.GetAllBlog(query, options)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Blogs retrieved successfully",
        data: result
    })
})

const GetSingleBlog = catchAsync(async (req, res) => {
    const result = await BlogService.GetSingleBlog(req.params?.id)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Blog retrieved successfully",
        data: result
    })
})

const UpdateBlog = catchAsync(async (req, res) => {
    const result = await BlogService.UpdateBlog(req.params?.id, req.body)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Blog updated successfully",
        data: result
    })
})

const DeleteBlog = catchAsync(async (req, res) => {
    const result = await BlogService.DeleteBlog(req.params?.id)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Blog deleted successfully",
        data: result
    })
})

export const BlogController = {
    CreateBlog,
    GetAllBlog,
    GetSingleBlog,
    UpdateBlog,
    DeleteBlog
}

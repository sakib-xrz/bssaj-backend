import httpStatus from "http-status"
import catchAsync from "../../utils/catchAsync"
import pick from "../../utils/pick"
import sendResponse from "../../utils/sendResponse"
import { EventService } from "./event.services"


const CreateEvent = catchAsync(async (req, res) => {
    const result = await EventService.CreateEvent(req.body)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'Event created successfully',
        data: result
    })
})

const GetAllEvent = catchAsync(async (req, res) => {
    const query = pick(req.query, ['search', 'title', 'description'])
    const options = pick(req.query, ['page', 'limit', 'sort_by', 'sort_order'])
    const result = await EventService.GetAllEvent(query, options)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Events retrieved successfully',
        data: result
    })
})

const GetSingleEvent = catchAsync(async (req, res) => {
    const result = await EventService.GetSingleEvent(req.params?.id)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Event retrieved successfully',
        data: result
    })
})

const UpdateEvent = catchAsync(async (req, res) => {
    const result = await EventService.UpdateEvent(req.params?.id, req.body)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Event updated successfully',
        data: result
    })
})

const DeleteEvent = catchAsync(async (req, res) => {
    const result = await EventService.DeleteEvent(req.params?.id)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Event deleted successfully',
        data: result
    })
})

export const EventController = {
    CreateEvent,
    GetAllEvent,
    GetSingleEvent,
    UpdateEvent,
    DeleteEvent
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Event, Prisma } from "@prisma/client"
import httpStatus from "http-status"
import AppError from "../../errors/AppError"
import calculatePagination from "../../utils/pagination"
import prisma from "../../utils/prisma"

const CreateEvent = async (payload: Event) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            id: payload.author_id
        }
    })

    if (!isExistUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found')
    }

    const reuslt = await prisma.event.create({
        data: payload
    })

    return reuslt
}

const GetAllEvent = async (query: any, options: any) => {
    const { search } = query
    const { limit, page, sort_order, sort_by, skip } = calculatePagination(options)

    const andCondition: Prisma.EventWhereInput[] = []

    if (search) {
        andCondition.push({
            OR: ['title', 'description'].map((field) => ({
                [field]: {
                    contains: search,
                    mode: 'insensitive',
                },
            })),
        })
    }

    const whereCondition: Prisma.EventWhereInput = { AND: andCondition }

    const result = await prisma.event.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sort_by && sort_order ? { [sort_by]: sort_order } : { created_at: 'desc' },
    })

    const total = await prisma.event.count({
        where: whereCondition,
    })

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    }
}

const GetSingleEvent = async (id: string) => {
    const result = await prisma.event.findUnique({
        where: {
            id
        }
    })

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Event not found')
    }

    return result
}

const UpdateEvent = async (id: string, payload: Partial<Event>) => {
    const isExistEvent = await prisma.event.findUnique({
        where: {
            id
        }
    })

    if (!isExistEvent) {
        throw new AppError(httpStatus.NOT_FOUND, 'Event not found')
    }

    const reuslt = await prisma.event.update({
        where: {
            id
        },
        data: payload
    })

    return reuslt
}

const DeleteEvent = async (id: string) => {
    const isExistEvent = await prisma.event.findUnique({
        where: {
            id
        }
    })

    if (!isExistEvent) {
        throw new AppError(httpStatus.NOT_FOUND, 'Event not found')
    }

    await prisma.event.delete({
        where: { id }
    })

    return null
}

export const EventService = {
    CreateEvent,
    GetAllEvent,
    GetSingleEvent,
    UpdateEvent,
    DeleteEvent
}

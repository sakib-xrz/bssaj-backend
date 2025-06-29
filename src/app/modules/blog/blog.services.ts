/* eslint-disable @typescript-eslint/no-explicit-any */
import { Blog, Prisma } from "@prisma/client"
import httpStatus from "http-status"
import AppError from "../../errors/AppError"
import calculatePagination from "../../utils/pagination"
import prisma from "../../utils/prisma"

const CreateBlog = async (payload: Blog) => {
    const isValidUser = await prisma.user.findUnique({
        where: {
            id: payload.author_id
        }
    })

    if (!isValidUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'Author not found')
    }

    const result = await prisma.blog.create({
        data: payload
    })
    return result
}

const GetAllBlog = async (query: any, options: any) => {
    const { search } = query
    const { limit, page, sort_order, sort_by, skip } = calculatePagination(options)

    const andCondition: Prisma.BlogWhereInput[] = []

    if (search) {
        andCondition.push({
            OR: ['title', 'content'].map((field) => ({
                [field]: {
                    contains: search,
                    mode: 'insensitive',
                },
            })),
        })
    }

    const whereCondition: Prisma.BlogWhereInput = { AND: andCondition }

    const result = await prisma.blog.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sort_by && sort_order ? { [sort_by]: sort_order } : { created_at: 'desc' },
    })

    const total = await prisma.blog.count({
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

const GetSingleBlog = async (id: string) => {
    const blog = await prisma.blog.findUnique({
        where: { id }
    })

    if (!blog) {
        throw new AppError(httpStatus.NOT_FOUND, 'Blog not found')
    }

    return blog
}

const UpdateBlog = async (id: string, payload: Partial<Blog>) => {
    const blog = await prisma.blog.findUnique({
        where: { id }
    })

    if (!blog) {
        throw new AppError(httpStatus.NOT_FOUND, 'Blog not found')
    }

    const result = await prisma.blog.update({
        where: { id },
        data: payload
    })

    return result
}

const DeleteBlog = async (id: string) => {
    const blog = await prisma.blog.findUnique({
        where: { id }
    })

    if (!blog) {
        throw new AppError(httpStatus.NOT_FOUND, 'Blog not found')
    }

    await prisma.blog.delete({
        where: { id }
    })

    return null
}

export const BlogService = {
    CreateBlog,
    GetAllBlog,
    GetSingleBlog,
    UpdateBlog,
    DeleteBlog
}

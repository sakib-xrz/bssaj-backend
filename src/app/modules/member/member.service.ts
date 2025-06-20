import { Member } from "@prisma/client";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import prisma from "../../utils/prisma";

const CreateMember = async (payload: Member) => {
    const user = await prisma.user.findUnique({
        where: {
            id: payload.user_id,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const information = {
        user_id: payload.user_id,
        name: user.name,
        email: user.email,
        phone: payload.phone,
        designation: payload.designation,
    };

    const result = await prisma.member.create({
        data: information,
    });

    return result;
};

const SingleMember = async (id: string) => {

    const existingMember = await prisma.member.findUnique(
        {
            where: {
                id: id
            }
        }
    )

    if (!existingMember) {
        throw new AppError(httpStatus.NOT_FOUND, "Invalid Member Id")
    }

    if (existingMember.is_deleted === true) {
        throw new AppError(httpStatus.NOT_FOUND, "This member is Deleted")
    }

    return existingMember
}

const GetAllMember = async () => {
    const reuslt = await prisma.member.findMany(
        {
            where: { is_deleted: true }
        }
    )
    return reuslt
}

const UpdateMember = async (id: string, payload: Partial<Member>) => {
    const member = await prisma.member.findUnique({
        where: {
            id
        },
    });

    if (!member) {
        throw new AppError(httpStatus.NOT_FOUND, 'Invalid member Id')
    }
    if (member.is_deleted === true) {
        throw new AppError(httpStatus.UNAUTHORIZED, "this member already Deleted!")
    }

    const reuslt = await prisma.member.update({
        where: {
            id: id
        },
        data: payload
    })

    return reuslt
}

const DeleteMember = async (id: string) => {
    const existingMember = await prisma.member.findUnique(
        {
            where: {
                id: id
            }
        }
    )

    if (existingMember?.is_deleted === true) {
        throw new AppError(httpStatus.UNAUTHORIZED, "this member already Deleted!")
    }

    const result = await prisma.member.update(
        {
            where: {
                id: id
            },
            data: {
                is_deleted: true
            }
        }
    )
    return result
}

export const MembersService = {
    CreateMember,
    SingleMember,
    GetAllMember,
    UpdateMember,
    DeleteMember
}



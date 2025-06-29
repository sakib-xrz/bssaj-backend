import { z } from "zod";

const blogValidation = z.object({
    body: z.object({
        title: z.string({ required_error: "Invalid user id" }),
        content: z.string({ required_error: 'Phone Number is Required' }),
        author_id: z.string({ required_error: "kind is Required" }),
        approved_by_id: z.string({ required_error: "kind is Required" }),
    })
});


const updateBlogValidation = z.object({
    body: z.object({
        title: z.string({ required_error: "Invalid user id" }).optional(),
        content: z.string({ required_error: 'Phone Number is Required' }).optional(),
        author_id: z.string({ required_error: "kind is Required" }).optional(),
    })
});


export const BlogValidatoin = {
    blogValidation,
    updateBlogValidation
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const CreateBlogSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ required_error: 'Title is required' }),
        content: zod_1.z.string({ required_error: 'Content is required' }),
    }),
});
const UpdateBlogSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        content: zod_1.z.string().optional(),
        author_id: zod_1.z.string().optional(),
        is_published: zod_1.z.boolean().optional(),
    }),
});
const BlogValidation = {
    CreateBlogSchema,
    UpdateBlogSchema,
};
exports.default = BlogValidation;

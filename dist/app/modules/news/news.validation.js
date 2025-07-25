"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const CreateNewsSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ required_error: 'Title is required' }),
        content: zod_1.z.string({ required_error: 'Content is required' }),
    }),
});
const UpdateNewsSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        content: zod_1.z.string().optional(),
    }),
});
const NewsValidation = {
    CreateNewsSchema,
    UpdateNewsSchema,
};
exports.default = NewsValidation;

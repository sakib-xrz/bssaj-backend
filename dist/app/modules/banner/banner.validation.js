"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const CreateBannerSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ required_error: 'Title is required' }),
        description: zod_1.z.string({ required_error: 'Description is required' }),
        link: zod_1.z
            .string({ required_error: 'Link is required' })
            .url('Invalid URL format'),
    }),
});
const UpdateBannerSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        link: zod_1.z.string().url('Invalid URL format').optional(),
    }),
});
const BannerValidation = {
    CreateBannerSchema,
    UpdateBannerSchema,
};
exports.default = BannerValidation;

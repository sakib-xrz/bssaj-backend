"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const CreateGallerySchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        link: zod_1.z.string().url('Invalid URL format').optional(),
    }),
});
const UpdateGallerySchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        link: zod_1.z.string().url('Invalid URL format').optional(),
    }),
});
const GalleryValidation = {
    CreateGallerySchema,
    UpdateGallerySchema,
};
exports.default = GalleryValidation;

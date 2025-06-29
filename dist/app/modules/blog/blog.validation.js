"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogValidatoin = void 0;
const zod_1 = require("zod");
const blogValidation = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ required_error: "Invalid user id" }),
        content: zod_1.z.string({ required_error: 'Phone Number is Required' }),
        author_id: zod_1.z.string({ required_error: "kind is Required" }),
        approved_by_id: zod_1.z.string({ required_error: "kind is Required" }),
    })
});
const updateBlogValidation = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ required_error: "Invalid user id" }).optional(),
        content: zod_1.z.string({ required_error: 'Phone Number is Required' }).optional(),
        author_id: zod_1.z.string({ required_error: "kind is Required" }).optional(),
    })
});
exports.BlogValidatoin = {
    blogValidation,
    updateBlogValidation
};

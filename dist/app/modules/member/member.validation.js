"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberUpdateSchema = exports.memberSchema = void 0;
const zod_1 = require("zod");
exports.memberSchema = zod_1.z.object({
    body: zod_1.z.object({
        user_id: zod_1.z.string({ required_error: "Invalid user id" }),
        phone: zod_1.z.string({ required_error: 'Phone Number is Required' }),
        kind: zod_1.z.string({ required_error: "kind is Required" })
    })
});
exports.memberUpdateSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        phone: zod_1.z.string({ required_error: 'Phone Number is Required' }).optional(),
        kind: zod_1.z.string({ required_error: "kind is Required" }).optional()
    })
});

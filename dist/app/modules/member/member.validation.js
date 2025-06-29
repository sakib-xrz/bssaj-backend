"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberValidation = exports.updateMemberValidation = exports.memberValidation = void 0;
const zod_1 = require("zod");
exports.memberValidation = zod_1.z.object({
    body: zod_1.z.object({
        user_id: zod_1.z.string({ required_error: "Invalid user id" }),
        phone: zod_1.z.string({ required_error: 'Phone Number is Required' }),
        kind: zod_1.z.string({ required_error: "kind is Required" })
    })
});
exports.updateMemberValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        phone: zod_1.z.string({ required_error: 'Phone Number is Required' }).optional(),
        kind: zod_1.z.string({ required_error: "kind is Required" }).optional()
    })
});
exports.MemberValidation = {
    memberValidation: exports.memberValidation,
    updateMemberValidation: exports.updateMemberValidation
};

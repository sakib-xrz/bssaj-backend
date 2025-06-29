"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agencySchema = void 0;
const zod_1 = require("zod");
exports.agencySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: "Agency name is required" }),
        description: zod_1.z.string().optional(),
        website: zod_1.z.string().url("Website must be a valid URL").optional(),
        contact_email: zod_1.z.string({ required_error: "Contact email is required" }).email("Must be a valid email"),
        contact_phone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        facebook_url: zod_1.z.string().url("Facebook URL must be valid").optional(),
        director_name: zod_1.z.string().optional(),
        message_from_director: zod_1.z.string().optional(),
        services_offered: zod_1.z.string().optional(),
        // established_year: z.string().optional(),
        success_stories: zod_1.z.array(zod_1.z.string()).optional(),
        is_deleted: zod_1.z.boolean().optional(),
        logo: zod_1.z.string().optional(),
        user_id: zod_1.z.string({ required_error: "user id is Required" }),
    }),
});

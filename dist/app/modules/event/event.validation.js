"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventValidation = void 0;
const zod_1 = require("zod");
const eventValidation = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ required_error: "title user id" }),
        description: zod_1.z.string({ required_error: "description is Required" }),
        location: zod_1.z.string({ required_error: "location is Required" }),
        event_date: zod_1.z.string({ required_error: "event_date is Required" }),
        author_id: zod_1.z.string({ required_error: "author_id is Required" }),
        approved_by_id: zod_1.z.string({ required_error: "approved_by_id is Required" }),
    })
});
const updateEventValidation = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ required_error: "title user id" }).optional(),
        description: zod_1.z.string({ required_error: "description is Required" }).optional(),
        location: zod_1.z.string({ required_error: "location is Required" }).optional(),
        event_date: zod_1.z.string({ required_error: "event_date is Required" }).optional(),
        author_id: zod_1.z.string({ required_error: "author_id is Required" }).optional(),
        approved_by_id: zod_1.z.string({ required_error: "approved_by_id is Required" }).optional(),
        status: zod_1.z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"])
    })
});
exports.EventValidation = {
    eventValidation,
    updateEventValidation
};

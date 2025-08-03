"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventValidation = void 0;
const zod_1 = require("zod");
const CreateEventSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ required_error: 'Title is required' }),
        description: zod_1.z.string({ required_error: 'Description is required' }),
        location: zod_1.z.string({ required_error: 'Location is required' }),
        event_date: zod_1.z.string({ required_error: 'Event date is required' }),
    }),
});
const UpdateEventSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        event_date: zod_1.z.string().optional(),
    }),
});
exports.EventValidation = {
    CreateEventSchema,
    UpdateEventSchema,
};

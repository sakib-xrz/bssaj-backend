import { z } from "zod";

const eventValidation = z.object({
    body: z.object({
        title: z.string({ required_error: "title user id" }),
        description: z.string({ required_error: "description is Required" }),
        location: z.string({ required_error: "location is Required" }),
        event_date: z.string({ required_error: "event_date is Required" }),
        author_id: z.string({ required_error: "author_id is Required" }),
        approved_by_id: z.string({ required_error: "approved_by_id is Required" }),
    })
});


const updateEventValidation = z.object({
    body: z.object({
        title: z.string({ required_error: "title user id" }).optional(),
        description: z.string({ required_error: "description is Required" }).optional(),
        location: z.string({ required_error: "location is Required" }).optional(),
        event_date: z.string({ required_error: "event_date is Required" }).optional(),
        author_id: z.string({ required_error: "author_id is Required" }).optional(),
        approved_by_id: z.string({ required_error: "approved_by_id is Required" }).optional(),
        status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"])
    })
});



export const EventValidation = {
    eventValidation,
    updateEventValidation
}



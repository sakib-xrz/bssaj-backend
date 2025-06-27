import { z } from "zod";

export const agencySchema = z.object({
    body: z.object({
        name: z.string({ required_error: "Agency name is required" }),
        description: z.string().optional(),
        website: z.string().url("Website must be a valid URL").optional(),
        contact_email: z.string({ required_error: "Contact email is required" }).email("Must be a valid email"),
        contact_phone: z.string().optional(),
        address: z.string().optional(),
        facebook_url: z.string().url("Facebook URL must be valid").optional(),
        director_name: z.string().optional(),
        message_from_director: z.string().optional(),
        services_offered: z.string().optional(),
        // established_year: z.string().optional(),
        success_stories: z.array(z.string()).optional(),
        is_deleted: z.boolean().optional(),
        logo: z.string().optional(),
        user_id:z.string({required_error:"user id is Required"}),
    }),
});


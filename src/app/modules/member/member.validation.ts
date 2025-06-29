import { z } from "zod";

export const memberValidation = z.object({
  body: z.object({
    user_id: z.string({ required_error: "Invalid user id" }),
    phone: z.string({ required_error: 'Phone Number is Required' }),
    kind: z.string({ required_error: "kind is Required" })
  })
});

export const updateMemberValidation = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string({ required_error: 'Phone Number is Required' }).optional(),
    kind: z.string({ required_error: "kind is Required" }).optional()
  })
});


export const MemberValidation = {
  memberValidation,
  updateMemberValidation
}
import { z } from 'zod';

const memberSchema = z.object({
    body: z.object({
        user_id: z.string({ required_error: "Invalid user id" }),
        designation: z.string({ required_error: 'Designation is required' }),
        phone:z.string({required_error:'Phone Number is Required'})
    })
})


export default memberSchema


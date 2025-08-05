import { z } from "zod";

export const ExampleSchema = z.object({
    name: z.string({
        message: "Name is required"
    }),
    description: z.string({
        message: "Description is required"
    }),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
        message: "Phone number isn't valid"
    }).optional()
})
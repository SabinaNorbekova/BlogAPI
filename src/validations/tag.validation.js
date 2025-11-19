import {z} from 'zod'

export const createTagSchema=z.object({
    name: z.string().min(2).max(30).transform(val=>val.toLowerCase().trim())
})

export const updateTagSchema=createTagSchema.partial()
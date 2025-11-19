import z, { decodeAsync } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

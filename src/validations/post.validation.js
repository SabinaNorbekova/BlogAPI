// src/validations/post.validation.js  
import { z } from 'zod';

const postStatusEnum = z.enum(['draft', 'published', 'archived']);

export const createPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  categoryId: z.string().uuid().nullable().optional(), 
  tagIds: z.array(z.string().uuid()).optional().default([]),
  status: postStatusEnum.optional().default('draft'),
});

export const updatePostSchema = createPostSchema.partial(); 
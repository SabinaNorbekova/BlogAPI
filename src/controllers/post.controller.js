// src/controllers/post.controller.js
import {
  createPostSchema,
  updatePostSchema,
} from '../validations/post.validation.js';
import { z } from 'zod';
import { PostService } from '../services/post.service.js';

export const PostController = {
  async create(req, res, next) {
    try {
      const data = createPostSchema.parse(req.body);
      const post = await PostService.create(req.user.id, data);
      return res.status(201).json({ message: 'Post created', post });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ errors: err.errors });
      next(err);
    }
  },

  async getMyPosts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await PostService.getMyPosts(req.user.id, { page, limit });
      return res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req,res,next){
    try{
      const post =await PostService.getPostById(req.params.id, req.user)
      return res.json(post)
    }catch(err){
      if(err.status){
        return res.status(err.status).json({message:err.message})
      }
      next(err)
    }
  },

  async update(req, res, next) {
    try {
      const data = updatePostSchema.parse(req.body);
      const post = await PostService.update(req.params.id, req.user.id, data);
      return res.json({ message: 'Post updated', post });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ errors: err.errors });
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await PostService.delete(req.params.id);
      return res.json({ message: 'Post deleted' });
    } catch (err) {
      next(err);
    }
  },
};

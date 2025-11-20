import {
  createTagSchema,
  updateTagSchema,
} from '../validations/tag.validation.js';
import { z } from 'zod';
import { TagService } from '../services/tag.service.js';
import { ca } from 'zod/locales';

export const TagController = {
  async create(req, res, next) {
    try {
      const { name } = createTagSchema.parse(req.body);
      const tag = await TagService.create({ name });
      return res.status(201).json({ message: 'Tag yaratildi', tag });
    } catch (err) {
      if (err.code === 'P2002') {
        return res.status(409).json({ message: 'Bu tag nomi allaqachon bor' });
      }
      if (err instanceof z.ZodError)
        return res.status(400).json({ errors: err.errors });
      next(err);
    }
  },

  async getAll(req, res, next) {
    try {
      const tags = await TagService.getAll();
      return res.json(tags);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const tag = await TagService.getById(req.params.id);
      return res.json(tag);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ message: err.message });
      }
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { name } = updateTagSchema.parse(req.body);
      const tag = await TagService.update(req.params.id, { name });
      return res.json({ message: 'Tag yangilandi', tag });
    } catch (err) {
      if (err.code === 'P2002') {
        return res.status(409).json({ message: 'Bu tag nomi allaqachon bor' });
      }
      if (err instanceof z.ZodError)
        return res.status(400).json({ errors: err.errors });
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const result = await TagService.delete(req.params.id);
      return res.json(result);
    } catch (err) {
      if (err.status)
        return res.status(err.status).json({ message: err.message });
      next(err);
    }
  },
};

import {
  createCategorySchema,
  updateCategorySchema,
} from '../validations/category.validation.js';
import { date, z } from 'zod';
import { CategoryService } from '../services/category.service.js';

export const CategoryController = {
  async create(req, res, next) {
    try {
      const data = createCategorySchema.parse(req.body);
      const category = await CategoryService.create(data);
      return res.status(201).json({ message: 'Category yaratildi', category });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ errors: err.errors });
      next(err);
    }
  },

  async getAll(req, res, next) {
    try {
      const categories = await CategoryService.getAll();
      return res.json(categories);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const data = updateCategorySchema.parse(req.body);
      const category = await CategoryService.update(req.params.id, data);
      return res.json({ message: 'Category yangilandi', category });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ errors: err.errors });
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const result = await CategoryService.delete(req.params.id);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  },
};

import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import ApiError from '../utils/ApiError';

// POST /api/categories
export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// GET /api/categories
export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Category.find();
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    next(err);
  }
};

// GET /api/categories/:id
export const getCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ApiError('Category not found.', 404));
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// PUT /api/categories/:id
export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return next(new ApiError('Category not found.', 404));
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/categories/:id
export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next(new ApiError('Category not found.', 404));
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};

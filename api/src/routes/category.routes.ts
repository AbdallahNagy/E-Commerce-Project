import { Router } from 'express';
import { body } from 'express-validator';
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
];

router
  .route('/')
  .get(getCategories)
  .post(protect, authorize('admin'), categoryValidation, validate, createCategory);

router
  .route('/:id')
  .get(getCategory)
  .put(protect, authorize('admin'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

export default router;

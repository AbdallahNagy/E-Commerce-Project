import { Router } from 'express';
import { body } from 'express-validator';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), productValidation, validate, createProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

export default router;

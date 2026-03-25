import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(getCart)
  .post(
    [
      body('productId').isMongoId().withMessage('Valid product ID is required'),
      body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    ],
    validate,
    addToCart
  )
  .delete(clearCart);

router
  .route('/:itemId')
  .put(
    [body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')],
    validate,
    updateCartItem
  )
  .delete(removeCartItem);

export default router;

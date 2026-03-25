import { Router } from 'express';
import { body } from 'express-validator';
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
} from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required'),
];

// Nested under products: GET|POST /api/products/:productId/reviews
router
  .route('/products/:productId/reviews')
  .get(getProductReviews)
  .post(protect, reviewValidation, validate, createReview);

// Standalone review management: PUT|DELETE /api/reviews/:id
router.route('/reviews/:id').put(protect, updateReview).delete(protect, deleteReview);

export default router;

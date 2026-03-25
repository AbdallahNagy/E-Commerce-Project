import { Request, Response, NextFunction } from 'express';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';

// POST /api/products/:productId/reviews
export const createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    // Verify user has purchased this product
    const hasPurchased = await Order.exists({
      user: req.user!._id,
      'items.product': productId,
      orderStatus: { $in: ['shipped', 'delivered'] },
    });

    if (!hasPurchased) {
      return next(new ApiError('You can only review products you have purchased.', 403));
    }

    const review = await Review.create({
      user: req.user!._id,
      product: productId as string,
      rating,
      comment,
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:productId/reviews
export const getProductReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    next(err);
  }
};

// PUT /api/reviews/:id
export const updateReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new ApiError('Review not found.', 404));
    if (String(review.user) !== String(req.user!._id)) {
      return next(new ApiError('Not authorized to update this review.', 403));
    }

    const { rating, comment } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();

    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reviews/:id
export const deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new ApiError('Review not found.', 404));

    const isOwner = String(review.user) === String(req.user!._id);
    if (!isOwner && req.user!.role !== 'admin') {
      return next(new ApiError('Not authorized to delete this review.', 403));
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};

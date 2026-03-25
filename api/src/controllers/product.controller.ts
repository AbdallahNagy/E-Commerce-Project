import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import ApiError from '../utils/ApiError';

// POST /api/products
export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// GET /api/products  — filter, search, sort, paginate
export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, minPrice, maxPrice, search, sort, page = '1', limit = '10' } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = {};

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {
        ...(minPrice ? { $gte: Number(minPrice) } : {}),
        ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
      };
    }
    if (search) filter.$text = { $search: search };

    const sortObj: Record<string, 1 | -1> =
      sort === 'price_asc'   ? { price: 1 }
      : sort === 'price_desc' ? { price: -1 }
      : sort === 'rating'     ? { averageRating: -1 }
      : { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name').sort(sortObj).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
export const getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) return next(new ApiError('Product not found.', 404));
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return next(new ApiError('Product not found.', 404));
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next(new ApiError('Product not found.', 404));
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};

import { Request, Response, NextFunction } from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import mongoose from 'mongoose';

// GET /api/cart
export const getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user!._id }).populate('items.product', 'name images price stock');
    if (!cart) {
      res.json({ success: true, data: { items: [], totalPrice: 0 } });
      return;
    }
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

// POST /api/cart  — add item
export const addToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) return next(new ApiError('Product not found.', 404));
    if (product.stock < quantity) return next(new ApiError('Insufficient stock.', 400));

    let cart = await Cart.findOne({ user: req.user!._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user!._id, items: [] });
    }

    const existingIndex = cart.items.findIndex((i) => String(i.product) === String(productId));

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ product: product._id as mongoose.Types.ObjectId, quantity, price: product.price, _id: new mongoose.Types.ObjectId() });
    }

    await cart.save();
    res.status(201).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

// PUT /api/cart/:itemId  — update quantity
export const updateCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user!._id });
    if (!cart) return next(new ApiError('Cart not found.', 404));

    const itemIndex = cart.items.findIndex((i) => String(i._id) === req.params.itemId);
    if (itemIndex === -1) return next(new ApiError('Cart item not found.', 404));

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/:itemId  — remove item
export const removeCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user!._id });
    if (!cart) return next(new ApiError('Cart not found.', 404));

    const itemIndex = cart.items.findIndex((i) => String(i._id) === req.params.itemId);
    if (itemIndex === -1) return next(new ApiError('Cart item not found.', 404));

    cart.items.splice(itemIndex, 1);
    await cart.save();
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart  — clear cart
export const clearCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Cart.findOneAndDelete({ user: req.user!._id });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};

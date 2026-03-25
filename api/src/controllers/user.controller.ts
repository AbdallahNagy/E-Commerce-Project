import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

// GET /api/users
export const getUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find();
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ApiError('User not found.', 404));
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { password, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!user) return next(new ApiError('User not found.', 404));
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new ApiError('User not found.', 404));
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};

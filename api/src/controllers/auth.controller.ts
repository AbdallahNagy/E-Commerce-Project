import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d';
  return jwt.sign({ id }, secret, { expiresIn } as jwt.SignOptions);
};

// POST /api/auth/register
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return next(new ApiError('Email already in use.', 400));

    const user = await User.create({ name, email, password });
    const token = signToken(String(user._id));

    res.status(201).json({ success: true, token, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new ApiError('Invalid email or password.', 401));
    }

    const token = signToken(String(user._id));
    res.json({ success: true, token, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({ success: true, data: req.user });
  } catch (err) {
    next(err);
  }
};

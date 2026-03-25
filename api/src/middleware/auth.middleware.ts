import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import ApiError from '../utils/ApiError';

interface JwtPayload {
  id: string;
}

export const protect = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new ApiError('Not authenticated. Please log in.', 401));
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, secret) as JwtPayload;
  } catch {
    return next(new ApiError('Invalid or expired token.', 401));
  }

  const user = await User.findById(decoded.id).select('+password');
  if (!user) {
    return next(new ApiError('User belonging to this token no longer exists.', 401));
  }

  req.user = user;
  next();
};

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

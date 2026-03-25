import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err instanceof ApiError ? err : new ApiError(err.message || 'Server Error', 500);

  // Mongoose bad ObjectId
  if (err instanceof mongoose.Error.CastError) {
    error = new ApiError(`Resource not found with id: ${(err as mongoose.Error.CastError).value}`, 404);
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message).join(', ');
    error = new ApiError(messages, 400);
  }

  // Mongoose duplicate key
  if ((err as NodeJS.ErrnoException).code === '11000') {
    const field = Object.keys((err as any).keyValue ?? {})[0] ?? 'field';
    error = new ApiError(`Duplicate value for ${field}. Please use a different value.`, 400);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

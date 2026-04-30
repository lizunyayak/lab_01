import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/api.js';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, 'NOT_FOUND', 'Route not found'));
}

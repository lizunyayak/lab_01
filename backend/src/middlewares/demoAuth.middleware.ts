/**
 * Demo authentication middleware (Lab 05 — IDOR scenario).
 *
 * Real apps use sessions / JWT. Here we simply read the caller's
 * identity from the X-Demo-UserId header so the demo works without
 * a login screen.
 *
 * Behaviour (consistent across all note endpoints):
 *   - Missing header            → 401 UNAUTHORIZED
 *   - Header present but user
 *     does not exist in DB      → 401 UNAUTHORIZED
 *   - Valid existing user       → sets req.demoUserId and calls next()
 *
 * Usage:
 *   router.use(demoAuth);
 */
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/api.js';
import { userRepository } from '../repositories/user.repository.js';

// Extend Express Request with demo user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      demoUserId?: string;
    }
  }
}

export function demoAuth(req: Request, res: Response, next: NextFunction): void {
  const userId = (req.headers['x-demo-userid'] as string | undefined)?.trim();

  if (!userId) {
    next(new AppError(401, 'UNAUTHORIZED', 'X-Demo-UserId header is required'));
    return;
  }

  // Validate that the user actually exists in the database
  const user = userRepository.findById(userId);
  if (!user) {
    next(new AppError(401, 'UNAUTHORIZED', `User "${userId}" not found`));
    return;
  }

  req.demoUserId = userId;
  next();
}

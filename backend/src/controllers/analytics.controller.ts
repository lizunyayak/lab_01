import type { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service.js';

export const analyticsController = {
  getPollDetails(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(analyticsService.getPollDetails(req.params['id']!));
    } catch (err) { next(err); }
  },

  getPollStats(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(analyticsService.getPollStats(req.params['id']!));
    } catch (err) { next(err); }
  },

  searchPolls(req: Request, res: Response, next: NextFunction): void {
    try {
      const q = (req.query['q'] as string) ?? '';
      const results = analyticsService.searchPollsUnsafe(q);
      res.json({ data: results, meta: { count: results.length, q } });
    } catch (err) { next(err); }
  }
};

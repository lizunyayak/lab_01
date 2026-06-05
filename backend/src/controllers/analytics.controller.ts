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

  // ⚠ SQLi-demo endpoint (intentionally vulnerable)
  searchPolls(req: Request, res: Response, next: NextFunction): void {
    try {
      const q = (req.query['q'] as string) ?? '';
      const results = analyticsService.searchPollsUnsafe(q);
      res.json({ data: results, meta: { count: results.length, q } });
    } catch (err) { next(err); }
  },

  // GET /polls/top?limit=5  — top N polls by response count with questions
  getTopPolls(req: Request, res: Response, next: NextFunction): void {
    try {
      const raw = req.query['limit'];
      const limit = raw !== undefined ? Number(raw) : 5;

      if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'limit must be an integer between 1 and 20',
          },
        });
        return;
      }

      const data = analyticsService.getTopPolls(limit);
      res.json({ data, meta: { limit, count: data.length } });
    } catch (err) { next(err); }
  },

  // ✅ Safe search endpoint using parameterized query
  searchPollsSafe(req: Request, res: Response, next: NextFunction): void {
    try {
      const q = (req.query['q'] as string) ?? '';
      const results = analyticsService.searchPollsSafe(q);
      res.json({ data: results, meta: { count: results.length, q } });
    } catch (err) { next(err); }
  }
};

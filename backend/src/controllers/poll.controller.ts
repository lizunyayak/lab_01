import type { Request, Response, NextFunction } from 'express';
import { pollService } from '../services/poll.service.js';
import { parsePagination, parseSortDir } from './helpers.js';
import type { Visibility, Poll } from '../types/models.js';

export const pollController = {
  list(req: Request, res: Response, next: NextFunction): void {
    try {
      const opts = parsePagination(req);
      const sortDir = parseSortDir(req);
      const sortBy = (req.query['sortBy'] as keyof Poll) ?? 'createdAt';
      const filters = {
        visibility: req.query['visibility'] as Visibility | undefined,
        authorId: req.query['authorId'] as string | undefined
      };
      res.json(pollService.list(opts, filters, sortBy, sortDir));
    } catch (err) { next(err); }
  },

  getById(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(pollService.getById(req.params['id']!));
    } catch (err) { next(err); }
  },

  create(req: Request, res: Response, next: NextFunction): void {
    try {
      res.status(201).json(pollService.create(req.body));
    } catch (err) { next(err); }
  },

  update(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(pollService.replace(req.params['id']!, req.body));
    } catch (err) { next(err); }
  },

  patch(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(pollService.update(req.params['id']!, req.body));
    } catch (err) { next(err); }
  },

  delete(req: Request, res: Response, next: NextFunction): void {
    try {
      pollService.delete(req.params['id']!);
      res.status(204).send();
    } catch (err) { next(err); }
  }
};

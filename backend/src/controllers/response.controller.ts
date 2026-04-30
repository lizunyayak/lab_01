import type { Request, Response, NextFunction } from 'express';
import { responseService } from '../services/response.service.js';
import { parsePagination, parseSortDir } from './helpers.js';

export const responseController = {
  list(req: Request, res: Response, next: NextFunction): void {
    try {
      const opts = parsePagination(req);
      const sortDir = parseSortDir(req);
      const filters = {
        pollId: req.query['pollId'] as string | undefined,
        userId: req.query['userId'] as string | undefined,
        questionId: req.query['questionId'] as string | undefined
      };
      res.json(responseService.list(opts, filters, sortDir));
    } catch (err) { next(err); }
  },

  getById(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(responseService.getById(req.params['id']!));
    } catch (err) { next(err); }
  },

  create(req: Request, res: Response, next: NextFunction): void {
    try {
      res.status(201).json(responseService.create(req.body));
    } catch (err) { next(err); }
  },

  update(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(responseService.update(req.params['id']!, req.body));
    } catch (err) { next(err); }
  },

  patch(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(responseService.update(req.params['id']!, req.body));
    } catch (err) { next(err); }
  },

  delete(req: Request, res: Response, next: NextFunction): void {
    try {
      responseService.delete(req.params['id']!);
      res.status(204).send();
    } catch (err) { next(err); }
  }
};

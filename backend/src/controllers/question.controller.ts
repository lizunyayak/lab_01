import type { Request, Response, NextFunction } from 'express';
import { questionService } from '../services/question.service.js';
import { parsePagination, parseSortDir } from './helpers.js';

export const questionController = {
  list(req: Request, res: Response, next: NextFunction): void {
    try {
      const opts = parsePagination(req);
      const sortDir = parseSortDir(req);
      const filters = { pollId: req.query['pollId'] as string | undefined };
      res.json(questionService.list(opts, filters, sortDir));
    } catch (err) { next(err); }
  },

  getById(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(questionService.getById(req.params['id']!));
    } catch (err) { next(err); }
  },

  create(req: Request, res: Response, next: NextFunction): void {
    try {
      res.status(201).json(questionService.create(req.body));
    } catch (err) { next(err); }
  },

  update(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(questionService.update(req.params['id']!, req.body));
    } catch (err) { next(err); }
  },

  patch(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(questionService.update(req.params['id']!, req.body));
    } catch (err) { next(err); }
  },

  delete(req: Request, res: Response, next: NextFunction): void {
    try {
      questionService.delete(req.params['id']!);
      res.status(204).send();
    } catch (err) { next(err); }
  }
};

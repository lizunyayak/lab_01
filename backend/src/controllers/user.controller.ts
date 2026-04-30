import type { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { parsePagination, parseSortDir } from './helpers.js';
import type { User } from '../types/models.js';

export const userController = {
  list(req: Request, res: Response, next: NextFunction): void {
    try {
      const opts = parsePagination(req);
      const sortDir = parseSortDir(req);
      const sortBy = (req.query['sortBy'] as keyof User) ?? 'createdAt';
      res.json(userService.list(opts, sortBy, sortDir));
    } catch (err) { next(err); }
  },

  getById(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(userService.getById(req.params['id']!));
    } catch (err) { next(err); }
  },

  create(req: Request, res: Response, next: NextFunction): void {
    try {
      res.status(201).json(userService.create(req.body));
    } catch (err) { next(err); }
  },

  update(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(userService.replace(req.params['id']!, req.body));
    } catch (err) { next(err); }
  },

  patch(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(userService.update(req.params['id']!, req.body));
    } catch (err) { next(err); }
  },

  delete(req: Request, res: Response, next: NextFunction): void {
    try {
      userService.delete(req.params['id']!);
      res.status(204).send();
    } catch (err) { next(err); }
  }
};

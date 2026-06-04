/**
 * Notes controller — two variants per read endpoint:
 *   GET /api/v1/notes/:id         → safe (ownership check)
 *   GET /api/v1/notes/:id/unsafe  → IDOR demo (no ownership check)
 */
import type { Request, Response, NextFunction } from 'express';
import { noteService } from '../services/note.service.js';

export const noteController = {
  list(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json({ items: noteService.list(req.demoUserId!) });
    } catch (err) { next(err); }
  },

  // ✅ Safe: ownership enforced
  getById(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(noteService.getById(req.params['id']!, req.demoUserId!));
    } catch (err) { next(err); }
  },

  // ⚠ IDOR demo: no ownership check — any authenticated user can read any note
  getByIdUnsafe(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(noteService.getByIdUnsafe(req.params['id']!));
    } catch (err) { next(err); }
  },

  create(req: Request, res: Response, next: NextFunction): void {
    try {
      const note = noteService.create(req.body, req.demoUserId!);
      res.status(201).json(note);
    } catch (err) { next(err); }
  },

  delete(req: Request, res: Response, next: NextFunction): void {
    try {
      noteService.delete(req.params['id']!, req.demoUserId!);
      res.status(204).send();
    } catch (err) { next(err); }
  }
};

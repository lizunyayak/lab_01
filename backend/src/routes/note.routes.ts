import { Router } from 'express';
import { noteController } from '../controllers/note.controller.js';
import { demoAuth } from '../middlewares/demoAuth.middleware.js';

const router = Router();

// All note endpoints require demo authentication via X-Demo-UserId header
router.use(demoAuth);

router.get('/',                noteController.list);
router.post('/',               noteController.create);
router.get('/:id',             noteController.getById);         // ✅ safe (ownership check)
router.get('/:id/unsafe',      noteController.getByIdUnsafe);   // ⚠ IDOR demo
router.delete('/:id',          noteController.delete);

export default router;

import { Router } from 'express';
import { questionController } from '../controllers/question.controller.js';

const router = Router();

router.get('/',         questionController.list);
router.get('/:id',      questionController.getById);
router.post('/',        questionController.create);
router.put('/:id',      questionController.update);
router.patch('/:id',    questionController.patch);
router.delete('/:id',   questionController.delete);

export default router;

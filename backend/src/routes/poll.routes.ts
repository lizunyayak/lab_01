import { Router } from 'express';
import { pollController } from '../controllers/poll.controller.js';

const router = Router();

router.get('/',         pollController.list);
router.get('/:id',      pollController.getById);
router.post('/',        pollController.create);
router.put('/:id',      pollController.update);
router.patch('/:id',    pollController.patch);
router.delete('/:id',   pollController.delete);

export default router;

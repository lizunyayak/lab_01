import { Router } from 'express';
import { responseController } from '../controllers/response.controller.js';

const router = Router();

router.get('/',         responseController.list);
router.get('/:id',      responseController.getById);
router.post('/',        responseController.create);
router.put('/:id',      responseController.update);
router.patch('/:id',    responseController.patch);
router.delete('/:id',   responseController.delete);

export default router;

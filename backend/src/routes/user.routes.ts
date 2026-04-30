import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';

const router = Router();

router.get('/',         userController.list);
router.get('/:id',      userController.getById);
router.post('/',        userController.create);
router.put('/:id',      userController.update);
router.patch('/:id',    userController.patch);
router.delete('/:id',   userController.delete);

export default router;

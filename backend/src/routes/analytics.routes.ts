import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';

const router = Router();

// IMPORTANT: /search must be registered before /:id to avoid shadowing
router.get('/polls/search',        analyticsController.searchPolls);
router.get('/polls/:id/details',   analyticsController.getPollDetails);
router.get('/polls/:id/stats',     analyticsController.getPollStats);

export default router;

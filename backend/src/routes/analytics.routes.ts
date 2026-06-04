import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';

const router = Router();

// IMPORTANT: static paths must be registered before /:id to avoid shadowing
router.get('/polls/search',        analyticsController.searchPolls);     // ⚠ SQLi demo
router.get('/polls/search-safe',   analyticsController.searchPollsSafe); // ✅ parameterized
router.get('/polls/:id/details',   analyticsController.getPollDetails);
router.get('/polls/:id/stats',     analyticsController.getPollStats);

export default router;

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import { requestLogger } from './middlewares/logger.middleware.js';
import { securityHeaders } from './middlewares/securityHeaders.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { notFoundHandler } from './middlewares/notfound.middleware.js';
import { swaggerSpec } from './swagger.js';

import userRoutes from './routes/user.routes.js';
import pollRoutes from './routes/poll.routes.js';
import questionRoutes from './routes/question.routes.js';
import responseRoutes from './routes/response.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import noteRoutes from './routes/note.routes.js';

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Demo-UserId']
}));

// ─── Security headers (Lab 05 — Misconfiguration fix) ───────────────────────
app.use(securityHeaders);

// ─── Global middleware ───────────────────────────────────────────────────────
app.use(express.json());
app.use(requestLogger);

// ─── Swagger UI ──────────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Poll System API',
  swaggerOptions: { persistAuthorization: true }
}));

// ─── Versioned routes /api/v1/ ───────────────────────────────────────────────
app.use('/api/v1/users',      userRoutes);
app.use('/api/v1/polls',      pollRoutes);
app.use('/api/v1/questions',  questionRoutes);
app.use('/api/v1/responses',  responseRoutes);
app.use('/api/v1/analytics',  analyticsRoutes);
app.use('/api/v1/notes',      noteRoutes);

// ─── Legacy routes /api/ (backward compat) ──────────────────────────────────
app.use('/api/users',      userRoutes);
app.use('/api/polls',      pollRoutes);
app.use('/api/questions',  questionRoutes);
app.use('/api/responses',  responseRoutes);
app.use('/api/analytics',  analyticsRoutes);
app.use('/api/notes',      noteRoutes);

// ─── 404 + Error handler (MUST be last) ─────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

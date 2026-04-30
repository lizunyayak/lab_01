import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { requestLogger } from './middlewares/logger.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { notFoundHandler } from './middlewares/notfound.middleware.js';
import { swaggerSpec } from './swagger.js';

import userRoutes from './routes/user.routes.js';
import pollRoutes from './routes/poll.routes.js';
import questionRoutes from './routes/question.routes.js';
import responseRoutes from './routes/response.routes.js';

const app = express();

// ─── Global middleware ───────────────────────────────────────────────────────
app.use(express.json());
app.use(requestLogger);

// ─── Swagger UI ──────────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Poll System API',
  swaggerOptions: { persistAuthorization: true }
}));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/users',     userRoutes);
app.use('/api/polls',     pollRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/responses', responseRoutes);

// ─── 404 + Error handler (MUST be last) ─────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

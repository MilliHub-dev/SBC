import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import { router as healthRouter } from './routes/health.js';
import { router as authRouter } from './routes/auth.js';
import { router as pointsRouter } from './routes/points.js';
import { router as sessionsRouter } from './routes/sessions.js';
import { router as tasksRouter } from './routes/tasks.js';
import { router as txRouter } from './routes/transactions.js';
import { router as miningRouter } from './routes/mining.js';
import { router as adminRouter } from './routes/admin.js';
import { generalLimiter } from './middleware/rateLimit.js';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/points', pointsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/transactions', txRouter);
app.use('/api/mining', miningRouter);
app.use('/api/admin', adminRouter);

// Not found
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'NOT_FOUND' });
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`SabiCash backend listening on http://localhost:${port}`);
});



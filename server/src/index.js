import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import winston from 'winston';
import path from 'path';

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
const isProduction = process.env.NODE_ENV === 'production';

// Configure Winston logger
const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'sabicash-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Add console transport for development
if (!isProduction) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Trust proxy in production (for services like Railway, Heroku, etc.)
if (isProduction) {
  app.set('trust proxy', 1);
}

// Enhanced security middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://tmp.sabirideweb.com.ng"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration for production
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !isProduction) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging middleware
if (isProduction) {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
  }));
} else {
  app.use(morgan('dev'));
}

// Apply rate limiting to all routes
app.use(generalLimiter);

// Health check endpoint (before other routes)
app.use('/api/health', healthRouter);

// API routes
app.use('/api/auth', authRouter);
app.use('/api/points', pointsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/transactions', txRouter);
app.use('/api/mining', miningRouter);
app.use('/api/admin', adminRouter);

// Serve static files in production
if (isProduction) {
  app.use(express.static('public'));
  
  // Catch-all handler for SPA
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND' });
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  logger.warn(`404 - API route not found: ${req.method} ${req.path}`);
  res.status(404).json({ success: false, error: 'NOT_FOUND' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Don't expose error details in production
  if (isProduction) {
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An internal server error occurred'
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: err.message,
      stack: err.stack
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  app.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const port = process.env.PORT || 8787;
const server = app.listen(port, () => {
  logger.info(`SabiCash backend listening on http://localhost:${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`CORS origins: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});

export default server;



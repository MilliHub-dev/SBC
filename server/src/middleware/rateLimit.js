import rateLimit from 'express-rate-limit';

// General API rate limiting
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'RATE_LIMITED',
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication rate limiting
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: {
    success: false,
    error: 'AUTH_RATE_LIMITED',
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Points conversion rate limiting
export const conversionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 conversions per hour
  message: {
    success: false,
    error: 'CONVERSION_RATE_LIMITED',
    message: 'Too many point conversions, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Task completion rate limiting
export const taskLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 task completions per hour
  message: {
    success: false,
    error: 'TASK_RATE_LIMITED',
    message: 'Too many task completions, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin operations rate limiting
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 admin operations per windowMs
  message: {
    success: false,
    error: 'ADMIN_RATE_LIMITED',
    message: 'Too many admin operations, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Web3 transaction rate limiting
export const web3Limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 web3 operations per 5 minutes
  message: {
    success: false,
    error: 'WEB3_RATE_LIMITED',
    message: 'Too many Web3 operations, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
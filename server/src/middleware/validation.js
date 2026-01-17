import { body, param, query as queryValidator, validationResult } from 'express-validator';

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: errors.array()
    });
  }
  next();
}

// Auth validation
export const validateLogin = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('walletAddress').optional().matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid wallet address format'),
  handleValidationErrors
];

export const validateRegister = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('firstName').optional().isLength({ min: 1 }).withMessage('First name required'),
  body('lastName').optional().isLength({ min: 1 }).withMessage('Last name required'),
  body('userType').isIn(['passenger', 'driver']).withMessage('User type must be passenger or driver'),
  body('walletAddress').optional().matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid wallet address format'),
  handleValidationErrors
];

// Points validation
export const validatePointsConversion = [
  body('points').isInt({ min: 1 }).withMessage('Points must be a positive integer'),
  body('walletAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Valid wallet address required'),
  handleValidationErrors
];

// Task validation
export const validateTaskCreation = [
  body('title').isLength({ min: 3 }).withMessage('Task title must be at least 3 characters'),
  body('description').optional().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('taskType').isIn(['social_media', 'referral', 'survey', 'app_usage']).withMessage('Invalid task type'),
  body('rewardPoints').isInt({ min: 0 }).withMessage('Reward points must be non-negative integer'),
  body('rewardSabiCash').isFloat({ min: 0 }).withMessage('Reward Sabi Cash must be non-negative number'),
  handleValidationErrors
];

export const validateTaskCompletion = [
  body('externalUserId').optional().isUUID().withMessage('Invalid external user ID'),
  body('walletAddress').optional().matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid wallet address'),
  body('verificationData').optional().isObject().withMessage('Verification data must be an object'),
  handleValidationErrors
];

// Web3 transaction validation
export const validateTransactionLog = [
  body('transactionHash').matches(/^0x[a-fA-F0-9]{64}$/).withMessage('Valid transaction hash required'),
  body('walletAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Valid wallet address required'),
  body('transactionType').isIn(['convert_points', 'buy_sabi_cash', 'stake', 'unstake', 'claim_mining', 'claim_staking', 'task_reward']).withMessage('Invalid transaction type'),
  body('sabiCashAmount').optional().isFloat({ min: 0 }).withMessage('Sabi Cash amount must be non-negative'),
  body('pointsConverted').optional().isInt({ min: 0 }).withMessage('Points converted must be non-negative integer'),
  handleValidationErrors
];

// Wallet validation
export const validateWalletUpdate = [
  body('walletAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Valid wallet address required'),
  handleValidationErrors
];

// UUID parameter validation
export const validateUUIDParam = (paramName) => [
  param(paramName).isUUID().withMessage(`Invalid ${paramName} format`),
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  queryValidator('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  handleValidationErrors
];

// Admin validation
export const validateAdminReward = [
  param('userId').isUUID().withMessage('Valid user ID required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('type').isIn(['points', 'sabi_cash']).withMessage('Type must be points or sabi_cash'),
  body('reason').isLength({ min: 5 }).withMessage('Reason must be at least 5 characters'),
  handleValidationErrors
];

// Mining validation
export const validateMiningStake = [
  body('planType').isIn(['basic', 'premium']).withMessage('Plan type must be basic or premium'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be non-negative'),
  body('walletAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Valid wallet address required'),
  handleValidationErrors
];

export const validateMiningClaim = [
  body('walletAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Valid wallet address required'),
  body('planType').optional().isIn(['free', 'basic', 'premium']).withMessage('Invalid plan type'),
  handleValidationErrors
];
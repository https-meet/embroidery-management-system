import type { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  attempts: number;
  resetTime: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window
const MAX_ATTEMPTS = 10; // Max 10 failed/successful login attempts per 15 mins per IP

export function loginRateLimiter(req: Request, res: Response, next: NextFunction): void {
  // Bypass rate limiting during automated test suite runs
  if (process.env['NODE_ENV'] === 'test') {
    return next();
  }

  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
  const now = Date.now();

  const record = loginAttempts.get(ip);

  if (!record || now > record.resetTime) {
    loginAttempts.set(ip, {
      attempts: 1,
      resetTime: now + WINDOW_MS,
    });
    return next();
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many authentication attempts. Please try again after 15 minutes for security.',
      },
    });
    return;
  }

  record.attempts += 1;
  loginAttempts.set(ip, record);
  next();
}

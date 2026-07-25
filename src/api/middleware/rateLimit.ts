import { Request, Response, NextFunction } from 'express';

interface RateLimitData {
  count: number;
  resetTime: number;
}

const ipRequestMap = new Map<string, RateLimitData>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 150;

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  let limitData = ipRequestMap.get(ip);

  if (!limitData) {
    limitData = { count: 1, resetTime: now + WINDOW_MS };
    ipRequestMap.set(ip, limitData);
    return next();
  }

  if (now > limitData.resetTime) {
    limitData.count = 1;
    limitData.resetTime = now + WINDOW_MS;
    return next();
  }

  limitData.count += 1;

  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - limitData.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(limitData.resetTime / 1000));

  if (limitData.count > MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests from this IP. Please try again after 15 minutes.'
    });
  }

  next();
}

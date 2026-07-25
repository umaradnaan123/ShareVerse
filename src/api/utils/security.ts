import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'shareverse-super-secret-key-12345';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'shareverse-refresh-secret-key-67890';

export interface UserPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(payload: UserPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}

export function generateShortId(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateUUID(): string {
  return uuidv4();
}

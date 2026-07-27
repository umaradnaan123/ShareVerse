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

/**
 * Creates a stateless, URL-safe self-contained Share Token.
 */
export function createShareToken(metadata: {
  id?: string;
  name: string;
  size: number;
  mimeType: string;
  path: string;
}): string {
  const payload = {
    i: metadata.id || uuidv4(),
    n: metadata.name,
    s: metadata.size,
    m: metadata.mimeType,
    p: metadata.path,
    c: new Date().toISOString()
  };
  return 'sv1_' + Buffer.from(JSON.stringify(payload)).toString('base64url');
}

/**
 * Decodes a self-contained Share Token into a full file database record.
 */
export function decodeShareToken(token: string): any | null {
  if (!token || typeof token !== 'string' || !token.startsWith('sv1_')) return null;
  try {
    const jsonStr = Buffer.from(token.slice(4), 'base64url').toString('utf-8');
    const payload = JSON.parse(jsonStr);
    return {
      id: token,
      name: payload.n,
      size: payload.s,
      mime_type: payload.m,
      path: payload.p,
      parent_folder_id: null,
      is_public: 1,
      password_hash: null,
      expires_at: null,
      download_limit: null,
      download_count: 0,
      is_starred: 0,
      is_trashed: 0,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Infers accurate MIME type from filename extension if providedMime is missing or application/octet-stream.
 */
export function detectMimeType(fileName: string, providedMime?: string): string {
  if (providedMime && providedMime !== 'application/octet-stream' && providedMime.includes('/')) {
    return providedMime;
  }
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    txt: 'text/plain',
    json: 'application/json',
    html: 'text/html',
    css: 'text/css',
    js: 'text/javascript',
    ts: 'text/javascript',
    md: 'text/markdown',
    csv: 'text/csv',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  };
  return map[ext] || providedMime || 'application/octet-stream';
}

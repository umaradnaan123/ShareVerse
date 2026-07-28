import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { getDb, saveDatabaseState } from '../db.js';
import { generateUUID, decodeShareToken } from '../utils/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const UPLOADS_DIR = isServerless 
  ? '/tmp/uploads' 
  : path.join(__dirname, '../../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const router = Router();

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const db = getDb();
    let file = await db.get(
      'SELECT id, name, size, mime_type, is_public, password_hash, expires_at, download_limit, download_count, created_at FROM files WHERE id = ? AND is_trashed = 0',
      id
    );

    if (!file && id.startsWith('sv1_')) {
      file = decodeShareToken(id);
    }

    if (!file) {
      return res.status(404).json({ error: 'Shared link not found or file has been deleted.' });
    }

    if (file.expires_at && new Date(file.expires_at) < new Date()) {
      return res.status(410).json({ error: 'This shareable link has expired.' });
    }

    if (file.download_limit !== null && file.download_count >= file.download_limit) {
      return res.status(410).json({ error: 'This file has reached its download limit.' });
    }

    const hasPassword = !!file.password_hash;
    const { password_hash, ...publicMeta } = file;

    const previewUrl = `/api/shares/${file.id}/preview`;
    const downloadUrl = `/api/shares/${file.id}/download`;

    res.json({
      ...publicMeta,
      hasPassword,
      previewUrl,
      downloadUrl
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Handles raw binary file preview streaming with Range Request support and preview headers.
 */
export async function streamFilePreview(req: Request, res: Response, file: any) {
  console.log(`[PREVIEW] Streaming id=${file.id}, name=${file.name}, mime=${file.mime_type}, range=${req.headers.range || 'full'}`);

  const etag = `"${file.id}-${file.size}"`;
  const lastModified = file.created_at ? new Date(file.created_at).toUTCString() : new Date().toUTCString();

  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('ETag', etag);
  res.setHeader('Last-Modified', lastModified);
  res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);

  // Handle Data URL Stream
  if (file.path.startsWith('data:')) {
    const commaIndex = file.path.indexOf(',');
    const base64Data = file.path.substring(commaIndex + 1);
    const buffer = Buffer.from(base64Data, 'base64');
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  }

  // Handle Cloud HTTP Stream
  if (file.path.startsWith('http://') || file.path.startsWith('https://')) {
    const fetchOptions: any = {};
    if (req.headers.range) {
      fetchOptions.headers = { range: req.headers.range };
    }
    const response = await fetch(file.path, fetchOptions);
    if (!response.ok) {
      return res.status(404).json({ error: 'Physical preview file not found on cloud storage server.' });
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  }

  // Handle Local Disk Stream with Range Support
  const filePath = path.join(UPLOADS_DIR, file.path);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Physical preview file not found on storage server.' });
  }

  const fileSize = file.size || fs.statSync(filePath).size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;

    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    res.setHeader('Content-Length', chunksize);

    const readStream = fs.createReadStream(filePath, { start, end });
    readStream.pipe(res);
    return;
  }

  res.setHeader('Content-Length', fileSize);
  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
}

router.get('/:id/preview', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { password } = req.query;

  try {
    const db = getDb();
    let file = await db.get('SELECT * FROM files WHERE id = ? AND is_trashed = 0', id);

    if (!file && id.startsWith('sv1_')) {
      file = decodeShareToken(id);
    }

    if (!file) {
      return res.status(404).json({ error: 'Preview asset not found.' });
    }

    if (file.expires_at && new Date(file.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Preview link has expired.' });
    }

    if (file.password_hash) {
      const isMatch = await bcrypt.compare((password as string) || '', file.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Password validation required for preview.' });
      }
    }

    await streamFilePreview(req, res, file);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/verify-password', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const db = getDb();
    let file = await db.get('SELECT password_hash FROM files WHERE id = ? AND is_trashed = 0', id);

    if (!file && id.startsWith('sv1_')) {
      file = decodeShareToken(id);
    }

    if (!file) {
      return res.status(404).json({ error: 'Shared link not found.' });
    }

    if (!file.password_hash) {
      return res.json({ verified: true });
    }

    const isMatch = await bcrypt.compare(password || '', file.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    res.json({ verified: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Ensures parent file record exists in SQLite and records download analytics safely inside a transaction.
 */
async function recordDownloadSafely(db: any, file: any, ipAddress: string, userAgent: string) {
  try {
    await db.run('BEGIN TRANSACTION');

    // 1. Ensure parent file record exists in files table before inserting into downloads
    const existing = await db.get('SELECT id FROM files WHERE id = ?', file.id);
    if (!existing) {
      await db.run(
        `INSERT INTO files (id, name, size, mime_type, path, parent_folder_id, is_public, password_hash, expires_at, download_limit, download_count, is_starred, is_trashed, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          file.id,
          file.name,
          file.size,
          file.mime_type,
          file.path,
          file.parent_folder_id || null,
          file.is_public ?? 1,
          file.password_hash || null,
          file.expires_at || null,
          file.download_limit || null,
          file.download_count || 0,
          file.is_starred || 0,
          file.is_trashed || 0,
          file.created_at || new Date().toISOString()
        ]
      );
    }

    // 2. Insert downloads tracking log with random sample country
    const countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'India', 'Japan', 'Australia'];
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];

    await db.run(
      'INSERT INTO downloads (id, file_id, downloaded_at, ip_address, user_agent, country) VALUES (?, ?, ?, ?, ?, ?)',
      [generateUUID(), file.id, new Date().toISOString(), ipAddress, userAgent, randomCountry]
    );

    // 3. Increment download counter
    await db.run('UPDATE files SET download_count = download_count + 1 WHERE id = ?', file.id);

    await db.run('COMMIT');
    await saveDatabaseState();
  } catch (err) {
    await db.run('ROLLBACK').catch(() => {});
    console.error('[DOWNLOAD] Analytics recording safely handled without failing request:', err);
  }
}

router.get('/:id/download', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { password } = req.query;

  try {
    const db = getDb();
    let file = await db.get('SELECT * FROM files WHERE id = ? AND is_trashed = 0', id);

    if (!file && id.startsWith('sv1_')) {
      file = decodeShareToken(id);
    }

    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    if (file.expires_at && new Date(file.expires_at) < new Date()) {
      return res.status(410).json({ error: 'This link has expired.' });
    }

    if (file.download_limit !== null && file.download_count >= file.download_limit) {
      return res.status(410).json({ error: 'Download limit exceeded.' });
    }

    if (file.password_hash) {
      const isMatch = await bcrypt.compare((password as string) || '', file.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Password validation required for download.' });
      }
    }

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';

    if (file.path.startsWith('data:')) {
      await recordDownloadSafely(db, file, ipAddress, userAgent);

      const commaIndex = file.path.indexOf(',');
      const base64Data = file.path.substring(commaIndex + 1);
      const meta = file.path.substring(5, commaIndex);
      const mimeType = meta.split(';')[0] || file.mime_type;

      const buffer = Buffer.from(base64Data, 'base64');
      const inline = req.query.inline === 'true';

      if (inline) {
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
      } else {
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
      }
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
      return;
    }

    if (file.path.startsWith('http://') || file.path.startsWith('https://')) {
      const downloadResponse = await fetch(file.path);
      if (!downloadResponse.ok) {
        return res.status(404).json({ error: 'Physical file not found on cloud storage server.' });
      }

      await recordDownloadSafely(db, file, ipAddress, userAgent);

      const arrayBuffer = await downloadResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const inline = req.query.inline === 'true';
      if (inline) {
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
      } else {
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
      }
      res.setHeader('Content-Type', file.mime_type);
      res.setHeader('Content-Length', buffer.length);
      
      res.send(buffer);
      return;
    }

    const filePath = path.join(UPLOADS_DIR, file.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Physical file not found on storage server.' });
    }

    await recordDownloadSafely(db, file, ipAddress, userAgent);

    const inline = req.query.inline === 'true';
    if (inline) {
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
    }
    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Content-Length', file.size);

    const readStream = fs.createReadStream(filePath);
    readStream.on('error', (err) => {
      console.error('Download read stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to read file from storage server.' });
      }
    });
    readStream.pipe(res);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

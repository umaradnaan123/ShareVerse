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

    res.json({
      ...publicMeta,
      hasPassword
    });
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

router.get('/:id/download', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { password } = req.query;

  try {
    const db = getDb();
    let file = await db.get('SELECT * FROM files WHERE id = ? AND is_trashed = 0', id);

    if (!file && id.startsWith('sv1_')) {
      file = decodeShareToken(id);
      if (file) {
        try {
          await db.run(
            `INSERT OR IGNORE INTO files (id, name, size, mime_type, path, parent_folder_id, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [file.id, file.name, file.size, file.mime_type, file.path, null, file.created_at]
          );
        } catch (e) {
          // ignore cache auto-heal errors
        }
      }
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

    if (file.path.startsWith('http://') || file.path.startsWith('https://')) {
      const downloadResponse = await fetch(file.path);
      if (!downloadResponse.ok) {
        return res.status(404).json({ error: 'Physical file not found on cloud storage server.' });
      }

      const userAgent = req.headers['user-agent'] || 'Unknown';
      const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
      const countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'India', 'Japan', 'Australia'];
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];

      await db.run(
        'INSERT INTO downloads (id, file_id, downloaded_at, ip_address, user_agent, country) VALUES (?, ?, ?, ?, ?, ?)',
        [generateUUID(), file.id, new Date().toISOString(), ipAddress, userAgent, randomCountry]
      );
      await db.run('UPDATE files SET download_count = download_count + 1 WHERE id = ?', file.id);
      await saveDatabaseState();

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

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
    
    const countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'India', 'Japan', 'Australia'];
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];

    await db.run(
      'INSERT INTO downloads (id, file_id, downloaded_at, ip_address, user_agent, country) VALUES (?, ?, ?, ?, ?, ?)',
      [generateUUID(), file.id, new Date().toISOString(), ipAddress, userAgent, randomCountry]
    );

    await db.run('UPDATE files SET download_count = download_count + 1 WHERE id = ?', file.id);
    await saveDatabaseState();

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

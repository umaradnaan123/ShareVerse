import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../db.js';
import { generateShortId, generateUUID } from '../utils/security.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const UPLOADS_DIR = path.join(__dirname, '../../../uploads');
const TEMP_DIR = path.join(UPLOADS_DIR, 'temp');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const upload = multer({ dest: TEMP_DIR });

function cleanTempFolderAsync(dirPath: string) {
  setTimeout(async () => {
    const retries = 5;
    const delay = 500;
    for (let i = 0; i < retries; i++) {
      try {
        if (fs.existsSync(dirPath)) {
          await fs.promises.rm(dirPath, { recursive: true, force: true });
          console.log(`Background clean successful for ${dirPath}`);
        }
        return;
      } catch (err: any) {
        if (i === retries - 1) {
          console.error(`Background cleanup failed permanently for ${dirPath}:`, err);
        } else {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }, 1000);
}

router.get('/', async (req: Request, res: Response) => {
  const parentId = req.query.parentId || null;
  const isTrashed = req.query.trashed === 'true' ? 1 : 0;
  const isStarred = req.query.starred === 'true' ? 1 : null;
  const searchQuery = req.query.search || '';

  try {
    const db = getDb();
    let query = 'SELECT * FROM files WHERE is_trashed = ?';
    const params: any[] = [isTrashed];

    if (isStarred !== null) {
      query += ' AND is_starred = ?';
      params.push(isStarred);
    } else if (searchQuery) {
      query += ' AND name LIKE ?';
      params.push(`%${searchQuery}%`);
    } else {
      if (parentId === 'root') {
        query += ' AND parent_folder_id IS NULL';
      } else if (parentId) {
        query += ' AND parent_folder_id = ?';
        params.push(parentId);
      }
    }

    query += ' ORDER BY created_at DESC';
    const files = await db.all(query, params);
    res.json(files);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/upload/chunk', upload.single('chunk'), async (req: Request, res: Response) => {
  const {
    fileId,
    chunkIndex,
    totalChunks,
    fileName,
    mimeType,
    fileSize,
    parentFolderId
  } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No chunk file uploaded' });
  }

  const index = parseInt(chunkIndex, 10);
  const total = parseInt(totalChunks, 10);
  const size = parseInt(fileSize, 10);
  const fileFolder = path.join(TEMP_DIR, fileId);

  try {
    if (!fs.existsSync(fileFolder)) {
      fs.mkdirSync(fileFolder, { recursive: true });
    }

    const chunkPath = path.join(fileFolder, `chunk-${index}`);
    fs.renameSync(req.file.path, chunkPath);

    const filesInFolder = fs.readdirSync(fileFolder);
    if (filesInFolder.length === total) {
      const finalFileName = `${generateUUID()}-${fileName}`;
      const finalFilePath = path.join(UPLOADS_DIR, finalFileName);
      
      fs.writeFileSync(finalFilePath, '');

      for (let i = 0; i < total; i++) {
        const partPath = path.join(fileFolder, `chunk-${i}`);
        const buffer = fs.readFileSync(partPath);
        fs.appendFileSync(finalFilePath, buffer);
      }

      cleanTempFolderAsync(fileFolder);

      const db = getDb();
      const newFileId = generateUUID();
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO files (id, name, size, mime_type, path, parent_folder_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          newFileId,
          fileName,
          size,
          mimeType || 'application/octet-stream',
          finalFileName,
          parentFolderId === 'root' || !parentFolderId ? null : parentFolderId,
          now
        ]
      );

      const fileRecord = await db.get('SELECT * FROM files WHERE id = ?', newFileId);
      return res.status(201).json({ completed: true, file: fileRecord });
    }

    res.json({ completed: false, message: `Chunk ${index} uploaded successfully` });
  } catch (err: any) {
    console.error('Error handling chunk upload:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    parentFolderId,
    isStarred,
    isTrashed,
    isPublic,
    password,
    expiresAt,
    downloadLimit
  } = req.body;

  try {
    const db = getDb();
    const file = await db.get('SELECT * FROM files WHERE id = ?', id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    let query = 'UPDATE files SET';
    const params: any[] = [];
    const updates: string[] = [];

    if (name !== undefined) {
      updates.push(' name = ?');
      params.push(name);
    }
    if (parentFolderId !== undefined) {
      updates.push(' parent_folder_id = ?');
      params.push(parentFolderId === 'root' ? null : parentFolderId);
    }
    if (isStarred !== undefined) {
      updates.push(' is_starred = ?');
      params.push(isStarred ? 1 : 0);
    }
    if (isTrashed !== undefined) {
      updates.push(' is_trashed = ?');
      params.push(isTrashed ? 1 : 0);
    }
    if (isPublic !== undefined) {
      updates.push(' is_public = ?');
      params.push(isPublic ? 1 : 0);
    }
    if (password !== undefined) {
      updates.push(' password_hash = ?');
      params.push(password ? await bcrypt.hash(password, 10) : null);
    }
    if (expiresAt !== undefined) {
      updates.push(' expires_at = ?');
      params.push(expiresAt || null);
    }
    if (downloadLimit !== undefined) {
      updates.push(' download_limit = ?');
      params.push(downloadLimit !== null ? parseInt(downloadLimit, 10) : null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    query += updates.join(',') + ' WHERE id = ?';
    params.push(id);

    await db.run(query, params);
    const updatedFile = await db.get('SELECT * FROM files WHERE id = ?', id);
    res.json(updatedFile);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bulk-trash', async (req: Request, res: Response) => {
  const { fileIds, folderIds } = req.body;

  try {
    const db = getDb();
    if (fileIds && fileIds.length > 0) {
      const placeholders = fileIds.map(() => '?').join(',');
      await db.run(`UPDATE files SET is_trashed = 1 WHERE id IN (${placeholders})`, [...fileIds]);
    }
    if (folderIds && folderIds.length > 0) {
      const placeholders = folderIds.map(() => '?').join(',');
      await db.run(`UPDATE folders SET is_trashed = 1 WHERE id IN (${placeholders})`, [...folderIds]);
      for (const folderId of folderIds) {
        await db.run('UPDATE files SET is_trashed = 1 WHERE parent_folder_id = ?', folderId);
      }
    }
    res.json({ message: 'Items trashed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bulk-restore', async (req: Request, res: Response) => {
  const { fileIds, folderIds } = req.body;

  try {
    const db = getDb();
    if (fileIds && fileIds.length > 0) {
      const placeholders = fileIds.map(() => '?').join(',');
      await db.run(`UPDATE files SET is_trashed = 0 WHERE id IN (${placeholders})`, [...fileIds]);
    }
    if (folderIds && folderIds.length > 0) {
      const placeholders = folderIds.map(() => '?').join(',');
      await db.run(`UPDATE folders SET is_trashed = 0 WHERE id IN (${placeholders})`, [...folderIds]);
      for (const folderId of folderIds) {
        await db.run('UPDATE files SET is_trashed = 0 WHERE parent_folder_id = ?', folderId);
      }
    }
    res.json({ message: 'Items restored successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bulk-delete', async (req: Request, res: Response) => {
  const { fileIds, folderIds } = req.body;

  try {
    const db = getDb();
    if (fileIds && fileIds.length > 0) {
      const placeholders = fileIds.map(() => '?').join(',');
      const files = await db.all(`SELECT path FROM files WHERE id IN (${placeholders})`, [...fileIds]);
      for (const f of files) {
        const fp = path.join(UPLOADS_DIR, f.path);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      }
      await db.run(`DELETE FROM files WHERE id IN (${placeholders})`, [...fileIds]);
    }
    
    if (folderIds && folderIds.length > 0) {
      for (const folderId of folderIds) {
        const files = await db.all('SELECT path FROM files WHERE parent_folder_id = ?', [folderId]);
        for (const f of files) {
          const fp = path.join(UPLOADS_DIR, f.path);
          if (fs.existsSync(fp)) fs.unlinkSync(fp);
        }
        await db.run('DELETE FROM files WHERE parent_folder_id = ?', folderId);
      }
      const placeholders = folderIds.map(() => '?').join(',');
      await db.run(`DELETE FROM folders WHERE id IN (${placeholders})`, [...folderIds]);
    }
    res.json({ message: 'Items deleted permanently' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const db = getDb();
    const file = await db.get('SELECT * FROM files WHERE id = ?', id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(UPLOADS_DIR, file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await db.run('DELETE FROM files WHERE id = ?', id);
    res.json({ message: 'File deleted permanently' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

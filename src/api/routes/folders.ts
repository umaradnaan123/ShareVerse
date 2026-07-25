import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';
import { generateUUID } from '../utils/security.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const parentId = req.query.parentId || null;
  const isTrashed = req.query.trashed === 'true' ? 1 : 0;
  const isStarred = req.query.starred === 'true' ? 1 : null;

  try {
    const db = getDb();
    let query = 'SELECT * FROM folders WHERE is_trashed = ?';
    const params: any[] = [isTrashed];

    if (isStarred !== null) {
      query += ' AND is_starred = ?';
      params.push(isStarred);
    } else {
      if (parentId === 'root') {
        query += ' AND parent_folder_id IS NULL';
      } else if (parentId) {
        query += ' AND parent_folder_id = ?';
        params.push(parentId);
      }
    }

    query += ' ORDER BY name ASC';
    const folders = await db.all(query, params);
    res.json(folders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { name, parentFolderId } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  try {
    const db = getDb();
    const folderId = generateUUID();
    const now = new Date().toISOString();

    await db.run(
      'INSERT INTO folders (id, name, parent_folder_id, created_at) VALUES (?, ?, ?, ?)',
      [folderId, name, parentFolderId || null, now]
    );

    const folder = await db.get('SELECT * FROM folders WHERE id = ?', folderId);
    res.status(201).json(folder);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, parentFolderId, isStarred, isTrashed } = req.body;

  try {
    const db = getDb();
    const folder = await db.get('SELECT * FROM folders WHERE id = ?', id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    let query = 'UPDATE folders SET';
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
      
      if (isTrashed) {
        await db.run('UPDATE files SET is_trashed = 1 WHERE parent_folder_id = ?', id);
      } else {
        await db.run('UPDATE files SET is_trashed = 0 WHERE parent_folder_id = ?', id);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    query += updates.join(',') + ' WHERE id = ?';
    params.push(id);

    await db.run(query, params);
    const updatedFolder = await db.get('SELECT * FROM folders WHERE id = ?', id);
    res.json(updatedFolder);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const db = getDb();
    const folder = await db.get('SELECT * FROM folders WHERE id = ?', id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    await db.run('DELETE FROM folders WHERE id = ?', id);
    res.json({ message: 'Folder deleted permanently' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

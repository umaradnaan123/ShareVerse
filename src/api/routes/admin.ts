import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../../uploads');

const router = Router();

router.get('/stats', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    
    const storageResult = await db.get('SELECT SUM(size) as totalSize FROM files WHERE is_trashed = 0');
    const totalStorage = storageResult?.totalSize || 0;

    const filesCount = await db.get('SELECT COUNT(*) as count FROM files');
    const foldersCount = await db.get('SELECT COUNT(*) as count FROM folders');
    const usersCount = await db.get('SELECT COUNT(*) as count FROM users');
    const downloadsCount = await db.get('SELECT COUNT(*) as count FROM downloads');

    const countryStats = await db.all(
      'SELECT country, COUNT(*) as count FROM downloads GROUP BY country ORDER BY count DESC LIMIT 5'
    );

    const activityLogs = await db.all(
      'SELECT al.*, u.email as user_email FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT 50'
    );

    const filesList = await db.all(
      'SELECT f.*, u.email as owner_email FROM files f JOIN users u ON f.owner_id = u.id ORDER BY f.created_at DESC LIMIT 100'
    );

    const usersList = await db.all(
      'SELECT id, email, role, is_verified, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      stats: {
        totalStorage,
        files: filesCount?.count || 0,
        folders: foldersCount?.count || 0,
        users: usersCount?.count || 0,
        downloads: downloadsCount?.count || 0
      },
      countryStats,
      activityLogs,
      filesList,
      usersList
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id/role', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (role !== 'user' && role !== 'admin') {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const db = getDb();
    await db.run('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: 'User role updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const db = getDb();
    
    const files = await db.all('SELECT path FROM files WHERE owner_id = ?', id);
    for (const f of files) {
      const fp = path.join(UPLOADS_DIR, f.path);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }

    await db.run('DELETE FROM users WHERE id = ?', id);
    res.json({ message: 'User and all associated data deleted permanently' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

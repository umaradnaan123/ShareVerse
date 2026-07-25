import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db.js';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken, 
  generateUUID,
  UserPayload 
} from '../utils/security.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

async function logActivity(userId: string | null, action: string, details: string) {
  try {
    const db = getDb();
    await db.run(
      'INSERT INTO activity_logs (id, user_id, action, details, created_at) VALUES (?, ?, ?, ?, ?)',
      [generateUUID(), userId, action, details, new Date().toISOString()]
    );
  } catch (err) {
    console.error('Error logging activity:', err);
  }
}

router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const db = getDb();
    const existing = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = generateUUID();
    const now = new Date().toISOString();

    await db.run(
      'INSERT INTO users (id, email, password_hash, role, is_verified, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, email, passwordHash, 'user', 0, now]
    );

    await logActivity(userId, 'USER_REGISTER', `Created user account with email ${email}`);

    res.status(201).json({ message: 'User registered successfully. Please verify your email.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const db = getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload: UserPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await logActivity(user.id, 'USER_LOGIN', `Logged in successfully`);

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    return res.status(403).json({ error: 'Invalid or expired refresh token' });
  }

  const newPayload: UserPayload = { userId: payload.userId, email: payload.email, role: payload.role };
  const accessToken = generateAccessToken(newPayload);

  res.json({ accessToken });
});

router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const db = getDb();
    const user = await db.get('SELECT id, email, role, is_verified, created_at FROM users WHERE id = ?', req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/oauth-login', async (req: Request, res: Response) => {
  const { provider, email, name } = req.body;

  if (!provider || !email) {
    return res.status(400).json({ error: 'Provider and email are required' });
  }

  try {
    const db = getDb();
    let user = await db.get('SELECT * FROM users WHERE email = ?', email);

    if (!user) {
      const userId = generateUUID();
      const passwordHash = await bcrypt.hash(generateUUID() + Math.random(), 10);
      const now = new Date().toISOString();

      await db.run(
        'INSERT INTO users (id, email, password_hash, role, is_verified, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, email, passwordHash, 'user', 1, now]
      );
      
      user = await db.get('SELECT * FROM users WHERE id = ?', userId);
    }

    const payload: UserPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await logActivity(user.id, 'USER_OAUTH_LOGIN', `Logged in via OAuth provider: ${provider}`);

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const db = getDb();
    const user = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (!user) {
      return res.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    await logActivity(user.id, 'FORGOT_PASSWORD_REQUEST', `Requested password reset link`);
    res.json({ message: 'Password reset link sent (simulated). Check your system logs.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ error: 'Email and new password are required' });

  try {
    const db = getDb();
    const user = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, user.id]);

    await logActivity(user.id, 'RESET_PASSWORD_COMPLETE', `Password reset successfully`);
    res.json({ message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

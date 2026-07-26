import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: Database<sqlite3.Database, sqlite3.Statement>;

export async function initDb() {
  const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  const dbPath = isServerless 
    ? '/tmp/shareverse.db' 
    : path.join(__dirname, '../../database/shareverse.db');

  if (isServerless && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      if (!fs.existsSync(dbPath)) {
        console.log('Restoring SQLite database state from Vercel Blob...');
        const { list } = await import('@vercel/blob');
        const { blobs } = await list({ prefix: 'shareverse_db_' });
        
        if (blobs.length > 0) {
          // Sort by upload date descending
          blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
          const latestBlob = blobs[0];
          console.log(`Downloading latest database backup from Vercel Blob: ${latestBlob.url}`);
          
          const fetch = (await import('node-fetch')).default;
          const response = await fetch(latestBlob.url);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            fs.writeFileSync(dbPath, buffer);
            console.log('SQLite Database state restored successfully.');
          } else {
            console.error('Failed to download database backup from URL:', latestBlob.url);
          }
        } else {
          console.log('No database backup found in Vercel Blob. Starting fresh DB.');
        }
      }
    } catch (err) {
      console.error('Failed to restore database from Vercel Blob:', err);
    }
  } else if (!isServerless) {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.run('PRAGMA foreign_keys = ON');

  // Create Folders
  await db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_folder_id TEXT,
      is_starred INTEGER NOT NULL DEFAULT 0,
      is_trashed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (parent_folder_id) REFERENCES folders(id) ON DELETE CASCADE
    )
  `);

  // Create Files
  await db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      path TEXT NOT NULL,
      parent_folder_id TEXT,
      is_public INTEGER NOT NULL DEFAULT 1,
      password_hash TEXT,
      expires_at TEXT,
      download_limit INTEGER,
      download_count INTEGER NOT NULL DEFAULT 0,
      is_starred INTEGER NOT NULL DEFAULT 0,
      is_trashed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (parent_folder_id) REFERENCES folders(id) ON DELETE SET NULL
    )
  `);

  // Create Downloads
  await db.exec(`
    CREATE TABLE IF NOT EXISTS downloads (
      id TEXT PRIMARY KEY,
      file_id TEXT NOT NULL,
      downloaded_at TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      country TEXT,
      FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
    )
  `);

  console.log('SQLite Database Initialized.');
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

/**
 * Backs up the SQLite database to Vercel Blob (Background sync).
 */
export async function saveDatabaseState() {
  const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  if (!isServerless || !process.env.BLOB_READ_WRITE_TOKEN) return;

  try {
    const dbPath = '/tmp/shareverse.db';
    if (!fs.existsSync(dbPath)) return;

    const fileBuffer = fs.readFileSync(dbPath);
    const { put, list, del } = await import('@vercel/blob');
    
    const newDbName = `shareverse_db_${Date.now()}.db`;
    const blob = await put(newDbName, fileBuffer, {
      contentType: 'application/x-sqlite3',
      access: 'public',
    });

    console.log(`Database state successfully backed up to Vercel Blob: ${blob.url}`);

    // Clean up older backups
    const { blobs } = await list({ prefix: 'shareverse_db_' });
    const oldBlobs = blobs
      .filter(b => b.pathname !== newDbName)
      .map(b => b.url);

    if (oldBlobs.length > 0) {
      await del(oldBlobs);
      console.log(`Cleaned up ${oldBlobs.length} stale database backups.`);
    }
  } catch (err) {
    console.error('Failed to backup database state to Vercel Blob:', err);
  }
}

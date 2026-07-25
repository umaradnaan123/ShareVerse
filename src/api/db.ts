import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: Database<sqlite3.Database, sqlite3.Statement>;

export async function initDb() {
  const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  const dbPath = isServerless 
    ? '/tmp/shareverse.db' 
    : path.join(__dirname, '../../database/shareverse.db');

  if (!isServerless) {
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

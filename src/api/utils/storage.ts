import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const UPLOADS_DIR = isServerless 
  ? '/tmp/uploads' 
  : path.join(__dirname, '../../../uploads');

export interface UploadResult {
  path: string; // Storage path or identifier
  url: string;  // Public URL to access the file
}

/**
 * Uploads a local file to the active storage provider.
 */
export async function uploadToStorage(localPath: string, fileName: string, mimeType: string): Promise<UploadResult> {
  // 1. Check for Vercel Blob Storage
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob');
      const fileBuffer = fs.readFileSync(localPath);
      const blob = await put(fileName, fileBuffer, {
        contentType: mimeType,
        access: 'public',
      });
      return {
        path: blob.url,
        url: blob.url
      };
    } catch (err) {
      console.error('Vercel Blob upload failed, falling back:', err);
    }
  }

  // 2. Anonymous Public Cloud Storage Fallback (for zero-config Vercel)
  if (isServerless) {
    try {
      const FormData = (await import('form-data')).default;
      const fetch = (await import('node-fetch')).default;
      
      const form = new FormData();
      form.append('file', fs.createReadStream(localPath), fileName);

      // Upload to tmpfiles.org
      const response = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: form as any,
        headers: form.getHeaders(),
      });

      if (response.ok) {
        const json = await response.json() as any;
        if (json.status === 'success' && json.data?.url) {
          // Direct download link substitution
          const directUrl = json.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
          return {
            path: directUrl,
            url: directUrl
          };
        }
      }
    } catch (err) {
      console.error('Anonymous cloud upload failed, falling back:', err);
    }
  }

  // 3. Local disk fallback
  const finalFileName = `${Date.now()}-${fileName}`;
  const finalPath = path.join(UPLOADS_DIR, finalFileName);
  
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  fs.copyFileSync(localPath, finalPath);
  return {
    path: finalFileName,
    url: `/api/shares/local/${finalFileName}`
  };
}

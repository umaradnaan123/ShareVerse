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
  // 1. Check for Vercel Blob Storage (Premium Production)
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

  // 2. Serverless Cloud Fallbacks
  if (isServerless) {
    const FormData = (await import('form-data')).default;
    const fetch = (await import('node-fetch')).default;

    // Fallback A: Catbox.moe (Indefinite lifecycle anonymous storage)
    try {
      const catboxForm = new FormData();
      catboxForm.append('reqtype', 'fileupload');
      catboxForm.append('fileToUpload', fs.createReadStream(localPath), fileName);

      const catboxResponse = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: catboxForm as any,
        headers: catboxForm.getHeaders(),
      });

      if (catboxResponse.ok) {
        const fileUrl = await catboxResponse.text();
        if (fileUrl && fileUrl.trim().startsWith('http')) {
          return {
            path: fileUrl.trim(),
            url: fileUrl.trim()
          };
        }
      }
    } catch (err) {
      console.error('Primary Catbox cloud upload failed, trying Tmpfiles:', err);
    }

    // Fallback B: Tmpfiles.org (48-hour max lifecycle fallback)
    try {
      const tmpfilesForm = new FormData();
      tmpfilesForm.append('file', fs.createReadStream(localPath), fileName);
      tmpfilesForm.append('expire', '172800'); // Store for 48 hours instead of default 1 hour

      const tmpfilesResponse = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: tmpfilesForm as any,
        headers: tmpfilesForm.getHeaders(),
      });

      if (tmpfilesResponse.ok) {
        const json = await tmpfilesResponse.json() as any;
        if (json.status === 'success' && json.data?.url) {
          const directUrl = json.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
          return {
            path: directUrl,
            url: directUrl
          };
        }
      }
    } catch (err) {
      console.error('Secondary Tmpfiles cloud upload failed:', err);
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

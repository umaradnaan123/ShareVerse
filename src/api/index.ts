import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initDb } from './db.js';
import foldersRouter from './routes/folders.js';
import filesRouter from './routes/files.js';
import sharesRouter from './routes/shares.js';
import { rateLimiter } from './middleware/rateLimit.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Attach security response headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Enable CORS with support for frontend dev server
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Apply rate limiting to API routes
app.use('/api', rateLimiter);

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Setup api routers
app.use('/api/folders', foldersRouter);
app.use('/api/files', filesRouter);
app.use('/api/shares', sharesRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const isProd = process.env.NODE_ENV === 'production';
const rootDir = path.join(__dirname, '../..');

// Serve robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Allow: /features
Allow: /faq
Allow: /security
Allow: /blog
Disallow: /dashboard
Disallow: /share/
Disallow: /api/

Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`);
});

// Serve sitemap index
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  const host = `${req.protocol}://${req.get('host')}`;
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${host}/sitemap-pages.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${host}/sitemap-blog.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${host}/sitemap-images.xml</loc>
  </sitemap>
</sitemapindex>`);
});

// Serve sitemap pages
app.get('/sitemap-pages.xml', (req, res) => {
  res.type('application/xml');
  const host = `${req.protocol}://${req.get('host')}`;
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${host}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${host}/features</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${host}/security</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${host}/faq</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${host}/dashboard</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`);
});

// Serve sitemap blog
app.get('/sitemap-blog.xml', (req, res) => {
  res.type('application/xml');
  const host = `${req.protocol}://${req.get('host')}`;
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${host}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`);
});

// Serve sitemap images
app.get('/sitemap-images.xml', (req, res) => {
  res.type('application/xml');
  const host = `${req.protocol}://${req.get('host')}`;
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${host}/</loc>
    <image:image>
      <image:loc>${host}/vite.svg</image:loc>
      <image:title>ShareVerse Logo</image:title>
    </image:image>
  </url>
</urlset>`);
});

if (isProd) {
  // Serve production compiled files from dist/ folder
  const distPath = path.join(rootDir, 'dist');
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start server
async function startServer() {
  const bootStart = Date.now();
  try {
    const initTasks: Promise<any>[] = [initDb()];

    if (!isProd) {
      console.log('Loading Vite dev server middleware concurrently...');
      const vitePromise = import('vite').then(async ({ createServer }) => {
        console.log('Creating Vite dev server...');
        const vite = await createServer({
          server: { middlewareMode: true },
          appType: 'custom',
          root: rootDir
        });
        console.log('Vite dev server created. Registering dev middlewares...');
        app.use(vite.middlewares);

        app.use('*', async (req, res, next) => {
          const url = req.originalUrl;
          try {
            let template = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
            template = await vite.transformIndexHtml(url, template);
            res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
          } catch (e: any) {
            vite.ssrFixStacktrace(e);
            next(e);
          }
        });
        console.log('Vite middleware successfully registered!');
      });
      initTasks.push(vitePromise);
    }

    await Promise.all(initTasks);

    app.listen(PORT, () => {
      console.log(`Integrated ShareVerse booted in ${Date.now() - bootStart}ms and listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
export default app;

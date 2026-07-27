import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VERCEL_URL = 'https://share-verse-nu.vercel.app';
const LAST_MOD = new Date().toISOString();

const distPath = path.join(__dirname, '../dist');

if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

// Generate robots.txt
const robots = `User-agent: *
Allow: /
Allow: /upload
Allow: /features
Allow: /security
Allow: /faq
Allow: /blog
Allow: /privacy
Allow: /terms
Allow: /contact
Allow: /help
Allow: /share-pdf-online
Allow: /share-images-securely
Allow: /share-zip-files
Allow: /share-videos-online
Allow: /password-protected-file-sharing
Disallow: /dashboard
Disallow: /share/
Disallow: /api/

Sitemap: ${VERCEL_URL}/sitemap.xml`;

// Generate sitemap.xml (index)
const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${VERCEL_URL}/sitemap-pages.xml</loc>
    <lastmod>${LAST_MOD}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${VERCEL_URL}/sitemap-blog.xml</loc>
    <lastmod>${LAST_MOD}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${VERCEL_URL}/sitemap-images.xml</loc>
    <lastmod>${LAST_MOD}</lastmod>
  </sitemap>
</sitemapindex>`;

const mainPages = [
  { path: '/', priority: '1.0', freq: 'daily' },
  { path: '/upload', priority: '0.9', freq: 'daily' },
  { path: '/features', priority: '0.8', freq: 'weekly' },
  { path: '/security', priority: '0.8', freq: 'weekly' },
  { path: '/faq', priority: '0.8', freq: 'weekly' },
  { path: '/privacy', priority: '0.5', freq: 'monthly' },
  { path: '/terms', priority: '0.5', freq: 'monthly' },
  { path: '/contact', priority: '0.6', freq: 'monthly' },
  { path: '/help', priority: '0.7', freq: 'weekly' },
  { path: '/share-pdf-online', priority: '0.9', freq: 'weekly' },
  { path: '/share-images-securely', priority: '0.9', freq: 'weekly' },
  { path: '/share-zip-files', priority: '0.9', freq: 'weekly' },
  { path: '/share-videos-online', priority: '0.9', freq: 'weekly' },
  { path: '/password-protected-file-sharing', priority: '0.9', freq: 'weekly' }
];

const blogSlugs = [
  'how-to-securely-share-large-files',
  'how-password-protection-works',
  'cloud-storage-vs-file-sharing',
  'google-drive-vs-shareverse',
  'dropbox-alternatives-guide',
  'file-sharing-for-students',
  'password-protected-downloads-explained',
  'best-free-file-sharing-platforms-2026'
];

// Generate sitemap-pages.xml
const sitemapPages = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${mainPages.map(p => `  <url>
    <loc>${VERCEL_URL}${p.path}</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

// Generate sitemap-blog.xml
const sitemapBlog = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${VERCEL_URL}/blog</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
${blogSlugs.map(slug => `  <url>
    <loc>${VERCEL_URL}/blog/${slug}</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

// Generate sitemap-images.xml
const sitemapImages = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${VERCEL_URL}/</loc>
    <image:image>
      <image:loc>${VERCEL_URL}/vite.svg</image:loc>
      <image:title>ShareVerse Logo - Free Secure File Sharing</image:title>
      <image:caption>Secure Anonymous File and Folder Sharing Platform</image:caption>
    </image:image>
  </url>
</urlset>`;

fs.writeFileSync(path.join(distPath, 'robots.txt'), robots);
fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemapIndex);
fs.writeFileSync(path.join(distPath, 'sitemap-pages.xml'), sitemapPages);
fs.writeFileSync(path.join(distPath, 'sitemap-blog.xml'), sitemapBlog);
fs.writeFileSync(path.join(distPath, 'sitemap-images.xml'), sitemapImages);

console.log('Production Sitemaps (Index, Pages, Blog, Images) & robots.txt built successfully for:', VERCEL_URL);

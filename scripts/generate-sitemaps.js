import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VERCEL_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'https://shareverse.app';

const distPath = path.join(__dirname, '../dist');

if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

// Generate robots.txt
const robots = `User-agent: *
Allow: /
Allow: /features
Allow: /faq
Allow: /security
Allow: /blog
Disallow: /dashboard
Disallow: /share/
Disallow: /api/

Sitemap: ${VERCEL_URL}/sitemap.xml`;

// Generate sitemap.xml (index)
const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${VERCEL_URL}/sitemap-pages.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${VERCEL_URL}/sitemap-blog.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${VERCEL_URL}/sitemap-images.xml</loc>
  </sitemap>
</sitemapindex>`;

// Generate sitemap-pages.xml
const sitemapPages = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${VERCEL_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${VERCEL_URL}/features</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${VERCEL_URL}/security</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${VERCEL_URL}/faq</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${VERCEL_URL}/dashboard</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

// Generate sitemap-blog.xml
const sitemapBlog = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${VERCEL_URL}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

// Generate sitemap-images.xml
const sitemapImages = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${VERCEL_URL}/</loc>
    <image:image>
      <image:loc>${VERCEL_URL}/vite.svg</image:loc>
      <image:title>ShareVerse Logo</image:title>
    </image:image>
  </url>
</urlset>`;

fs.writeFileSync(path.join(distPath, 'robots.txt'), robots);
fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemapIndex);
fs.writeFileSync(path.join(distPath, 'sitemap-pages.xml'), sitemapPages);
fs.writeFileSync(path.join(distPath, 'sitemap-blog.xml'), sitemapBlog);
fs.writeFileSync(path.join(distPath, 'sitemap-images.xml'), sitemapImages);

console.log('Static sitemaps and robots.txt built successfully in dist/ for domain:', VERCEL_URL);

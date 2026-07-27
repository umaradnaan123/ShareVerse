import React, { useEffect } from 'react';

export interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  noIndex?: boolean;
  jsonLd?: object | object[];
}

const DEFAULT_DOMAIN = 'https://share-verse-nu.vercel.app';
const DEFAULT_IMAGE = `${DEFAULT_DOMAIN}/vite.svg`;

export default function SEO({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  noIndex = false,
  jsonLd
}: SEOProps) {
  const fullTitle = `${title} | ShareVerse`;
  const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : DEFAULT_DOMAIN);

  useEffect(() => {
    // 1. Update Document Title
    document.title = fullTitle;

    // Helper to create or update meta/link tags
    const setMetaTag = (selector: string, attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const setLinkTag = (rel: string, href: string, hreflang?: string) => {
      const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`;
      let element = document.querySelector(selector) as HTMLLinkElement;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        if (hreflang) element.setAttribute('hreflang', hreflang);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Standard Meta Tags
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('meta[name="theme-color"]', 'name', 'theme-color', '#8b5cf6');

    // 3. Open Graph Metadata
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'ShareVerse');
    setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'en_US');

    // 4. Twitter Card Metadata
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

    // 5. Canonical & Hreflang Tags
    setLinkTag('canonical', currentUrl);
    setLinkTag('alternate', currentUrl, 'en');
    setLinkTag('alternate', currentUrl, 'x-default');

    // 6. JSON-LD Structured Data Injection
    const schemaId = 'dynamic-jsonld';
    let scriptTag = document.getElementById(schemaId) as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    if (jsonLd) {
      const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      scriptTag.textContent = JSON.stringify(schemas);
    } else {
      // Default WebSite + Organization Schema
      scriptTag.textContent = JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': 'ShareVerse',
          'url': DEFAULT_DOMAIN,
          'description': 'Free secure anonymous file and folder sharing platform.',
          'potentialAction': {
            '@type': 'SearchAction',
            'target': `${DEFAULT_DOMAIN}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          'name': 'ShareVerse',
          'url': DEFAULT_DOMAIN,
          'logo': `${DEFAULT_DOMAIN}/vite.svg`,
          'sameAs': [
            'https://twitter.com/shareverse',
            'https://github.com/umaradnaan123/ShareVerse'
          ]
        }
      ]);
    }

    return () => {
      // Cleanup dynamically added script on unmount
      const script = document.getElementById(schemaId);
      if (script) script.remove();
    };
  }, [fullTitle, description, currentUrl, ogType, ogImage, noIndex, jsonLd]);

  return null;
}

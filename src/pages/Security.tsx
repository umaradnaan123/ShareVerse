import React from 'react';
import { ShieldCheck, Key, Globe, Database, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

export default function Security() {
  const securitySchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Platform Security Standards - ShareVerse',
      'description': 'Learn how ShareVerse keeps your files, shared links, and network transactions secure with bcrypt password hashing and TLS encryption.',
      'url': 'https://share-verse-nu.vercel.app/security'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://share-verse-nu.vercel.app/'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Security',
          'item': 'https://share-verse-nu.vercel.app/security'
        }
      ]
    }
  ];

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 min-h-[calc(100vh-16rem)] py-16 animate-fade-in">
      <SEO
        title="Platform Security Standards – Cryptographic Encryption & Privacy"
        description="Discover ShareVerse security architecture: 256-bit TLS transit encryption, bcrypt password gates, zero raw password storage, and cryptographically random Share tokens."
        canonicalUrl="https://share-verse-nu.vercel.app/security"
        jsonLd={securitySchema}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 text-brand-500 rounded-full text-sm font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Cybersecurity Standards</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-neutral-900 dark:text-white">Enterprise Grade Security</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Learn how ShareVerse keeps your assets, links, and transactions safe and encrypted.
          </p>
        </div>

        <div className="space-y-8">
          <div className="flex gap-6 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-955 items-start shadow-sm">
            <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 rounded-2xl shrink-0">
              <Key className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Cryptographic Password Protection</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Shared file password inputs are hashed on the server side using the industry-standard bcrypt algorithm with 10 salt rounds. We store no raw password bytes in our databases.
              </p>
            </div>
          </div>

          <div className="flex gap-6 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-955 items-start shadow-sm">
            <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 rounded-2xl shrink-0">
              <Globe className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Encrypted Transit & Headers</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Every API call is secured over TLS/HTTPS tunnels. We enforce strong HSTS policies, content-security headers, XSS filters, and secure CORS permissions to eliminate unauthorized access.
              </p>
            </div>
          </div>

          <div className="flex gap-6 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-955 items-start shadow-sm">
            <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 rounded-2xl shrink-0">
              <Database className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Secure Link Anonymization</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                To prevent direct indexing of sharing metadata, link identifiers are generated via a cryptographically random, non-sequential string resolver, making URL enumeration practically impossible.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-8">
          <Link to="/password-protected-file-sharing" className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-brand-500/20">
            <span>Explore Password Lock Hub</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

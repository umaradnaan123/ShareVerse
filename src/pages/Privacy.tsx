import React from 'react';
import SEO from '../components/SEO';
import { ShieldCheck, Lock, EyeOff, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  const privacySchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Privacy Policy - ShareVerse',
      'description': 'Understand how ShareVerse protects your data, enforces zero-retention defaults, and encrypts transfers.',
      'url': 'https://share-verse-nu.vercel.app/privacy'
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
          'name': 'Privacy Policy',
          'item': 'https://share-verse-nu.vercel.app/privacy'
        }
      ]
    }
  ];

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 py-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <SEO
        title="Privacy Policy – Zero Data Tracking & Encrypted Transfers"
        description="Read the ShareVerse Privacy Policy. We prioritize anonymous file transfers, HTTPS transit encryption, zero tracking cookies, and automatic asset deletion."
        canonicalUrl="https://share-verse-nu.vercel.app/privacy"
        jsonLd={privacySchema}
      />

      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 text-brand-500 rounded-full text-sm font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Data Privacy Commitment</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-neutral-900 dark:text-white">
            ShareVerse Privacy Policy
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Effective Date: July 2026. We believe file sharing should be private by default. Learn how we handle file uploads, metadata, and encryption without invasive tracking.
          </p>
        </header>

        <section className="bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8 text-neutral-700 dark:text-neutral-300 leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Lock className="h-6 w-6 text-brand-500" />
              <span>1. Zero-Account Anonymous Sharing</span>
            </h2>
            <p>
              ShareVerse allows users to upload and transfer files without creating an account. When you upload a file as a guest, we do not require your name, credit card details, or personal contact information. Files are associated only with a secure, random Share ID token (`sv1_...`).
            </p>
          </div>

          <div className="space-y-4 border-t border-neutral-100 dark:border-neutral-900 pt-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <EyeOff className="h-6 w-6 text-brand-500" />
              <span>2. Information We Collect & Transit Encryption</span>
            </h2>
            <p>
              To maintain system performance and security, our servers collect minimal operational data during file transfer:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>File Metadata:</strong> Original file name, file size (bytes), MIME type, and creation timestamp required for link generation and browser rendering.</li>
              <li><strong>Transfer Logs:</strong> IP address, user agent, and approximate country geolocation for rate limiting and download counter analytics.</li>
              <li><strong>Transit Security:</strong> All data in transit is encrypted using 256-bit TLS/HTTPS protocols.</li>
            </ul>
          </div>

          <div className="space-y-4 border-t border-neutral-100 dark:border-neutral-900 pt-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-brand-500" />
              <span>3. Data Retention & Expiration Policies</span>
            </h2>
            <p>
              Files uploaded to ShareVerse are retained according to the parameters set by the uploader or our default server cleanup routines:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Expiration Dates:</strong> Uploaders can specify link lifetimes (e.g. 1 hour, 24 hours, 7 days). Expired files return HTTP 410 status and are permanently purged.</li>
              <li><strong>Download Limits:</strong> Once a link reaches its maximum configured download count, access is revoked automatically.</li>
              <li><strong>No Data Monetization:</strong> We never sell, rent, or trade uploader file contents or recipient metadata to third-party ad networks.</li>
            </ul>
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-neutral-500">Have privacy questions or abuse reports?</span>
            <Link to="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors">
              <span>Contact Support</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

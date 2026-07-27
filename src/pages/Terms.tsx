import React from 'react';
import SEO from '../components/SEO';
import { FileCheck, ShieldAlert, Scale, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
  const termsSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Terms of Service - ShareVerse',
      'description': 'Review the Terms of Service for ShareVerse secure file sharing platform.',
      'url': 'https://share-verse-nu.vercel.app/terms'
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
          'name': 'Terms of Service',
          'item': 'https://share-verse-nu.vercel.app/terms'
        }
      ]
    }
  ];

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 py-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <SEO
        title="Terms of Service – Acceptable Use & Fair Usage Policy"
        description="ShareVerse Terms of Service. Learn about acceptable file transfer policies, copyright protection, DMCA compliance, fair use limits, and system terms."
        canonicalUrl="https://share-verse-nu.vercel.app/terms"
        jsonLd={termsSchema}
      />

      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 text-brand-500 rounded-full text-sm font-semibold">
            <Scale className="h-4 w-4" />
            <span>Legal Framework</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-neutral-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            By accessing or uploading files to ShareVerse, you agree to comply with our acceptable use policies, copyright protection rules, and security guidelines.
          </p>
        </header>

        <section className="bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8 text-neutral-700 dark:text-neutral-300 leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-brand-500" />
              <span>1. Acceptable Use Policy</span>
            </h2>
            <p>
              ShareVerse is designed for legitimate file sharing, collaboration, and personal asset transfers. Users must not use our infrastructure to upload or transmit:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Malicious software, viruses, ransomware, trojans, or executable exploits.</li>
              <li>Unauthorized copyrighted materials, pirated media, or intellectual property without uploader ownership.</li>
              <li>Illegal content, malware distribution packages, or phishing materials.</li>
            </ul>
          </div>

          <div className="space-y-4 border-t border-neutral-100 dark:border-neutral-900 pt-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-brand-500" />
              <span>2. DMCA & Copyright Abuse Reporting</span>
            </h2>
            <p>
              We respect intellectual property rights. If you believe a file hosted on ShareVerse infringes your copyright, please submit a notice to our abuse team via the <Link to="/contact" className="text-brand-500 underline">Contact Page</Link>. Infringing content will be promptly deleted upon validation.
            </p>
          </div>

          <div className="space-y-4 border-t border-neutral-100 dark:border-neutral-900 pt-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-brand-500" />
              <span>3. Limitation of Liability & Service Availability</span>
            </h2>
            <p>
              ShareVerse provides file hosting and link resolution "as is" without warranty of uninterrupted availability. Users are encouraged to maintain backups of essential files.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

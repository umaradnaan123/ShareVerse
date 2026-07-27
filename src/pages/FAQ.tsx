import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Search, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

export default function FAQ() {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      q: 'How does the chunked file upload mechanism work?',
      a: 'When you drop a file onto ShareVerse, our client divides it into multiple 2MB slices. Chunks are uploaded sequentially over HTTPS. If one chunk fails due to network instability, the system retries that specific chunk without restarting the entire file upload.',
      category: 'Uploads'
    },
    {
      q: 'Can I set limits on how many times a file can be downloaded?',
      a: 'Yes! In the share configuration settings for any file, you can set a maximum download cap. Once the download count meets or exceeds this threshold, access is automatically revoked with an HTTP 410 status.',
      category: 'Sharing'
    },
    {
      q: 'Are my uploaded files encrypted?',
      a: 'All transfers are secured in transit over 256-bit TLS/HTTPS. You can also apply custom password protection to download links. Passwords are hashed using bcrypt with 10 salt rounds before being stored on the server.',
      category: 'Security'
    },
    {
      q: 'How do I upload entire folders?',
      a: 'Click "Upload Files" or drag a directory folder directly into the upload area. ShareVerse automatically recursively extracts files while preserving folder associations upon upload.',
      category: 'Uploads'
    },
    {
      q: 'Can I restore files that have been deleted?',
      a: 'Yes, items are moved to your Workspace Trash bin first. You can access the Trash menu from your dashboard sidebar to restore items or permanently purge them.',
      category: 'Management'
    },
    {
      q: 'How long do shared links remain active?',
      a: 'Shared links remain active indefinitely by default unless you set a custom expiration timestamp (e.g. 1 hour, 24 hours, 7 days) or max download limit.',
      category: 'Sharing'
    }
  ];

  const faqSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map(f => ({
        '@type': 'Question',
        'name': f.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': f.a
        }
      }))
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
          'name': 'FAQ',
          'item': 'https://share-verse-nu.vercel.app/faq'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.filter(
    (f) => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 min-h-[calc(100vh-16rem)] py-16 animate-fade-in">
      <SEO
        title="Help Center & FAQ – Answers to File Sharing Questions"
        description="Find answers to common questions about chunked uploads, password protection, link expiration, folder transfer, data retention, and file restoration."
        canonicalUrl="https://share-verse-nu.vercel.app/faq"
        jsonLd={faqSchema}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 text-brand-500 rounded-full text-sm font-semibold">
            <HelpCircle className="h-4 w-4" />
            <span>Support & FAQ</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-neutral-900 dark:text-white">Help Center & FAQ</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Find answers to common questions about uploading, sharing, security, and link management.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search help topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-2xl outline-none focus:border-brand-500 text-neutral-800 dark:text-neutral-100 shadow-sm text-sm"
          />
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const contentId = `faq-content-${idx}`;
            return (
              <div
                key={idx}
                className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-955 shadow-sm transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-neutral-800 dark:text-neutral-200"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isOpen && (
                  <div
                    id={contentId}
                    role="region"
                    className="px-6 pb-6 pt-1 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-900 space-y-3"
                  >
                    <p>{faq.a}</p>
                    <span className="inline-block text-xs px-2.5 py-0.5 bg-brand-500/10 text-brand-500 rounded-full font-medium">
                      Category: {faq.category}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <p className="text-center text-neutral-500 dark:text-neutral-400 py-10">
              No matching help topics found.
            </p>
          )}
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-neutral-500">Need personal assistance or customized help?</span>
          <Link to="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors">
            <span>Contact Support</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

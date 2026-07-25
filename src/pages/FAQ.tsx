import React, { useEffect, useState } from 'react';
import { HelpCircle, ChevronDown, Search } from 'lucide-react';

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
      a: 'When you drop a file onto ShareVerse, our client divides it into multiple 2MB slices. Chunks are uploaded sequentially. If one chunk fails due to network instability, the system retries that specific chunk without restarting the entire file.',
      category: 'Uploads'
    },
    {
      q: 'Can I set limits on how many times a file can be downloaded?',
      a: 'Yes, in the sharing settings of any file, you can define a maximum download cap. Once the file download count meets or exceeds this threshold, the sharing page will return an expired status.',
      category: 'Sharing'
    },
    {
      q: 'Are my uploaded files encrypted?',
      a: 'We secure files in transit via HTTPS and provide options to password-protect the download links. The actual files are stored on server volumes, which can be encrypted at the OS level.',
      category: 'Security'
    },
    {
      q: 'How do I upload entire folders?',
      a: 'By clicking the "Upload Folder" button on your dashboard, you can select a directory. The client automatically reads the recursive file list and preserves folder associations upon uploading.',
      category: 'Uploads'
    },
    {
      q: 'Can I restore files that have been deleted?',
      a: 'Yes, files are moved to the Trash bin first. You can access the Trash menu from your dashboard sidebar to restore items or permanently delete them.',
      category: 'Management'
    }
  ];

  useEffect(() => {
    document.title = 'ShareVerse Help Center & FAQ - Free File Sharing Support';

    // Inject canonical link
    const canonicalId = 'canonical-faq';
    let link = document.getElementById(canonicalId) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = canonicalId;
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}/faq`;

    const scriptId = 'jsonld-faq';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const mainEntity = faqs.map((f) => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.a
      }
    }));

    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': mainEntity
    });

    return () => {
      document.getElementById(scriptId)?.remove();
      document.getElementById(canonicalId)?.remove();
    };
  }, []);

  const filteredFaqs = faqs.filter(
    (f) => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 min-h-[calc(100vh-16rem)] py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-2">
            <HelpCircle className="h-9 w-9 text-brand-500" />
            <span>Help Center & FAQ</span>
          </h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400">
            Find answers to common questions about uploading, sharing, and account configurations.
          </p>
        </div>

        <div className="relative mb-10">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search help topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl outline-none focus:border-brand-500 text-neutral-800 dark:text-neutral-100 shadow-sm"
          />
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const contentId = `faq-content-${idx}`;
            return (
              <div
                key={idx}
                className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-950 transition-all duration-200"
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
                    className="px-6 pb-6 pt-1 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-900"
                  >
                    <p className="mb-2">{faq.a}</p>
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
      </div>
    </div>
  );
}

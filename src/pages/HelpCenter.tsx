import React, { useState } from 'react';
import SEO from '../components/SEO';
import { HelpCircle, Search, FileText, Lock, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');

  const articles = [
    {
      category: 'Getting Started',
      icon: FileText,
      title: 'How to Upload & Share Your First File',
      description: 'Step-by-step guide to dragging and dropping files or folders and retrieving share links.',
      slug: 'upload-guide'
    },
    {
      category: 'Security & Access',
      icon: Lock,
      title: 'Configuring Password Protection',
      description: 'Learn how to apply custom access passwords before sharing confidential media.',
      slug: 'password-protection'
    },
    {
      category: 'Expiration & Limits',
      icon: Clock,
      title: 'Setting Auto-Expiration Lifetimes & Download Caps',
      description: 'Control how long files remain accessible or restrict total download counts.',
      slug: 'expiration-limits'
    },
    {
      category: 'Privacy & Retention',
      icon: ShieldCheck,
      title: 'Understanding Data Retention Policies',
      description: 'How ShareVerse purges expired links and manages container data persistence.',
      slug: 'data-retention'
    }
  ];

  const filteredArticles = articles.filter(art =>
    art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    art.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const helpSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Help Center & Documentation - ShareVerse',
      'description': 'Find answers, tutorials, and technical support guides for ShareVerse file sharing platform.',
      'url': 'https://share-verse-nu.vercel.app/help'
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
          'name': 'Help Center',
          'item': 'https://share-verse-nu.vercel.app/help'
        }
      ]
    }
  ];

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 py-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <SEO
        title="Help Center – Knowledge Base & User Guides"
        description="ShareVerse Help Center. Search knowledge base articles, step-by-step upload guides, password security tutorials, and download troubleshooting tips."
        canonicalUrl="https://share-verse-nu.vercel.app/help"
        jsonLd={helpSchema}
      />

      <div className="max-w-5xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 text-brand-500 rounded-full text-sm font-semibold">
            <HelpCircle className="h-4 w-4" />
            <span>Knowledge Base & Support</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-neutral-900 dark:text-white">
            How can we help you today?
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Search our user documentation, architectural guides, and security answers.
          </p>

          <div className="max-w-xl mx-auto relative pt-4">
            <Search className="h-5 w-5 text-neutral-400 absolute left-4 top-8" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search help guides (e.g. password, expiration, upload)..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-2xl outline-none focus:border-brand-500 shadow-sm text-sm"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((art, idx) => {
            const Icon = art.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-500/10 text-brand-500 rounded-2xl">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-brand-500">{art.category}</span>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{art.title}</h2>
                  </div>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {art.description}
                </p>
                <Link
                  to="/faq"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-500 hover:text-brand-600 group"
                >
                  <span>Learn more in FAQ</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Still need assistance?</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            If you cannot find an answer to your inquiry in our documentation, reach out to our dedicated support team.
          </p>
          <Link
            to="/contact"
            className="inline-block py-3 px-8 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-brand-500/20"
          >
            Contact Support Team
          </Link>
        </div>
      </div>
    </div>
  );
}

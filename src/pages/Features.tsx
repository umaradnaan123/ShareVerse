import React from 'react';
import { Shield, Cpu, RefreshCcw, Eye, QrCode, Share, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

export default function Features() {
  const featuresSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'ShareVerse',
      'operatingSystem': 'All',
      'applicationCategory': 'FileSharingApplication',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'featureList': 'Chunked Upload Engine, Automatic Retry, Secure Access controls, Rich Previews, QR Code Generation, Web Share API integration'
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
          'name': 'Features',
          'item': 'https://share-verse-nu.vercel.app/features'
        }
      ]
    }
  ];

  const features = [
    {
      icon: <Cpu className="h-6 w-6 text-brand-500" />,
      title: 'Chunked Upload Engine',
      desc: 'Files are sliced into chunks of 2MB to bypass standard gateway limits. Upload progress tracks individual slices, giving instant pause and resume control.'
    },
    {
      icon: <RefreshCcw className="h-6 w-6 text-brand-500" />,
      title: 'Automatic Retry',
      desc: 'Got disconnected on the subway? The system automatically caches chunks locally and retries the upload as soon as your connection is re-established.'
    },
    {
      icon: <Shield className="h-6 w-6 text-brand-500" />,
      title: 'Secure Access Controls',
      desc: 'Define custom access rules: set passwords, cap link usages, and schedule expirations to delete link access on specific dates.'
    },
    {
      icon: <Eye className="h-6 w-6 text-brand-500" />,
      title: 'Rich Browser Previews',
      desc: 'Inspect media files directly. Support for PDFs, videos, music, images, and source code files with full styling and syntax highlighting.'
    },
    {
      icon: <QrCode className="h-6 w-6 text-brand-500" />,
      title: 'QR Code Generation',
      desc: 'Instantly download high-quality QR codes for your shared files. Convenient for transferring files to smartphones and tablets.'
    },
    {
      icon: <Share className="h-6 w-6 text-brand-500" />,
      title: 'Web Share API Integration',
      desc: 'Seamlessly share links through native chat and email application selectors on iOS, Android, and macOS device browsers.'
    }
  ];

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 min-h-[calc(100vh-16rem)] py-16 animate-fade-in">
      <SEO
        title="ShareVerse Features – Chunked Uploads & Custom Share Links"
        description="Discover ShareVerse features: resumable chunked uploads, bcrypt password protection, QR code generation, HTML5 video streaming, and PDF preview engine."
        canonicalUrl="https://share-verse-nu.vercel.app/features"
        jsonLd={featuresSchema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">Product Features</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            A comprehensive overview of tools engineered for high-performance file sharing and asset distribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-955 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 rounded-2xl w-fit">
                {f.icon}
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{f.title}</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center pt-8">
          <Link to="/upload" className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-brand-500/20">
            <span>Try Upload Engine Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import { Shield, Cpu, RefreshCcw, Eye, QrCode, Share } from 'lucide-react';

export default function Features() {
  useEffect(() => {
    document.title = 'ShareVerse Features - Chunked Uploads & Custom Shared Links';
    
    // Inject canonical link
    const canonicalId = 'canonical-features';
    let link = document.getElementById(canonicalId) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = canonicalId;
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}/features`;

    // Inject JSON-LD Schema
    const scriptId = 'schema-features';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
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
    });

    return () => {
      document.getElementById(canonicalId)?.remove();
      document.getElementById(scriptId)?.remove();
    };
  }, []);

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
      title: 'Secure Access controls',
      desc: 'Define custom access rules: set passwords, cap link usages, and schedule expirations to delete link access on specific dates.'
    },
    {
      icon: <Eye className="h-6 w-6 text-brand-500" />,
      title: 'Rich Previews',
      desc: 'Inspect media files directly. Support for PDFs, videos, music, images, and source code files with full styling and syntax highlighting.'
    },
    {
      icon: <QrCode className="h-6 w-6 text-brand-500" />,
      title: 'QR Code Generation',
      desc: 'Instantly download high-quality QR codes for your shared files. Convenient for transferring files to smartphones and tablets.'
    },
    {
      icon: <Share className="h-6 w-6 text-brand-500" />,
      title: 'Web Share API integration',
      desc: 'Seamlessly share links through native chat and email application selectors on iOS, Android, and macOS device browsers.'
    }
  ];

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 min-h-[calc(100vh-16rem)] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Product Features</h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400">
            A comprehensive list of features built for high-performance file sharing and asset distribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-955 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 rounded-2xl w-fit mb-6">
                {f.icon}
              </div>
              <h2 className="text-xl font-bold mb-2">{f.title}</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

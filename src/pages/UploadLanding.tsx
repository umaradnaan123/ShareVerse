import React from 'react';
import SEO from '../components/SEO';
import { Upload, FolderPlus, ShieldCheck, Zap, Lock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useUploadStore } from '../store/uploadStore';

export default function UploadLanding() {
  const { addUploadTasks } = useUploadStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addUploadTasks(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addUploadTasks(Array.from(e.dataTransfer.files));
    }
  };

  const uploadSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Upload Files & Folders - ShareVerse',
      'description': 'Upload large files and complete directory folders using ShareVerse chunked upload engine.',
      'url': 'https://share-verse-nu.vercel.app/upload'
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
          'name': 'Upload Files',
          'item': 'https://share-verse-nu.vercel.app/upload'
        }
      ]
    }
  ];

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 py-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <SEO
        title="Upload Files & Folders Online – Free Fast Transfer Hub"
        description="Upload large files, videos, documents, PDFs, ZIP archives, and entire folders to ShareVerse. Chunked parallel transfer, zero account required, 100% free."
        canonicalUrl="https://share-verse-nu.vercel.app/upload"
        jsonLd={uploadSchema}
      />

      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 text-brand-500 rounded-full text-sm font-semibold">
            <Zap className="h-4 w-4" />
            <span>High-Speed Upload Engine</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-neutral-900 dark:text-white">
            Upload & Share Files Securely
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Drag and drop your files or select folders below to instantly generate encrypted share links.
          </p>
        </header>

        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-brand-500 dark:hover:border-brand-500 bg-white dark:bg-neutral-955 rounded-3xl p-12 text-center transition-all shadow-sm hover:shadow-md group relative cursor-pointer"
        >
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />

          <div className="p-5 bg-brand-500/10 text-brand-500 rounded-3xl inline-block mb-6 group-hover:scale-110 transition-transform">
            <Upload className="h-12 w-12" />
          </div>

          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Drag & Drop Files Here
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-8">
            Select high-resolution media, PDFs, ZIP archives, codebase folders, or document packages up to multi-gigabyte limits.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="py-3 px-8 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-brand-500/20 pointer-events-none">
              Browse Local Files
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl text-center space-y-2">
            <ShieldCheck className="h-8 w-8 text-brand-500 mx-auto" />
            <h3 className="font-bold text-neutral-900 dark:text-white">Transit Security</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">256-bit TLS HTTPS end-to-end network transfer protection.</p>
          </div>

          <div className="p-6 bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl text-center space-y-2">
            <Lock className="h-8 w-8 text-brand-500 mx-auto" />
            <h3 className="font-bold text-neutral-900 dark:text-white">Custom Protection</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">Apply passwords and link expiration lifespans anytime.</p>
          </div>

          <div className="p-6 bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl text-center space-y-2">
            <RefreshCw className="h-8 w-8 text-brand-500 mx-auto" />
            <h3 className="font-bold text-neutral-900 dark:text-white">Stateless Reliability</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">Guaranteed link resolution across serverless global instances.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

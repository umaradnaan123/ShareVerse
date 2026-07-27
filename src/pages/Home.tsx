import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Share2, Sparkles, HardDrive, CheckCircle2, FileText, Image, Archive, Film, Lock, BookOpen, HelpCircle } from 'lucide-react';
import SEO from '../components/SEO';

export default function Home() {
  const homeSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'ShareVerse',
      'url': 'https://share-verse-nu.vercel.app',
      'description': 'Free, anonymous secure file and folder sharing platform with chunked uploading, password protection, and custom links.'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'ShareVerse',
      'url': 'https://share-verse-nu.vercel.app',
      'logo': 'https://share-verse-nu.vercel.app/vite.svg'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'ShareVerse Web Application',
      'operatingSystem': 'All',
      'applicationCategory': 'UtilitiesApplication',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      }
    }
  ];

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 min-h-[calc(100vh-16rem)] animate-fade-in">
      <SEO
        title="ShareVerse – Free Secure File Sharing Platform | Upload & Share Files Online"
        description="Upload, preview, and securely share files, documents, images, videos, PDFs, ZIP archives, and folders using ShareVerse. Fast, secure, free, and accessible from any device."
        canonicalUrl="https://share-verse-nu.vercel.app/"
        jsonLd={homeSchemas}
      />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            <span>100% Free Forever • No Account Required</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] text-neutral-900 dark:text-white">
            Secure Anonymous File Sharing <span className="text-brand-500">Made Simple</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Upload large files, videos, documents, PDFs, ZIP archives, and complete folder hierarchies in seconds. Protected by password locks, expiration timers, and zero data tracking.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link
              to="/upload"
              className="flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-2xl shadow-xl shadow-brand-500/30 transition-all hover:scale-[1.02]"
            >
              <span>Upload & Share Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/features"
              className="px-8 py-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-semibold rounded-2xl transition-all hover:bg-neutral-100 dark:hover:bg-neutral-750"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="py-16 bg-white dark:bg-neutral-955 border-t border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Engineered for Speed, Privacy, and Scalability
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-base">
              Transfer files with zero bandwidth throttling or intrusive registration walls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 rounded-2xl w-fit">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Chunked Resumable Transfer</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Large file uploads are divided into parallel chunks. Pause, resume, or auto-retry uploads whenever connectivity drops.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 rounded-2xl w-fit">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Password & Expiration Locks</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Keep assets confidential. Configure maximum download caps, custom link expiration timers, and bcrypt cryptographic passwords.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 rounded-2xl w-fit">
                <Share2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Full Folder Hierarchy Sharing</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Upload complete directory trees from your computer. Share unique token URLs (`sv1_...`) with inline browser preview capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Topic Hubs / Internal Linking Section */}
      <section className="py-16 bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">Specialized File Sharing Hubs</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              Explore dedicated solutions optimized for specific asset types and security needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <Link to="/share-pdf-online" className="p-6 bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-brand-500 transition-all text-center space-y-3 group shadow-sm">
              <FileText className="h-8 w-8 text-brand-500 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Share PDF Online</h3>
              <p className="text-xs text-neutral-500">Inline browser viewing for PDF reports & books.</p>
            </Link>

            <Link to="/share-images-securely" className="p-6 bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-brand-500 transition-all text-center space-y-3 group shadow-sm">
              <Image className="h-8 w-8 text-brand-500 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Share Images</h3>
              <p className="text-xs text-neutral-500">Lossless RAW, PNG, JPG & WEBP photo transfer.</p>
            </Link>

            <Link to="/share-zip-files" className="p-6 bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-brand-500 transition-all text-center space-y-3 group shadow-sm">
              <Archive className="h-8 w-8 text-brand-500 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Share ZIP Files</h3>
              <p className="text-xs text-neutral-500">High-speed compressed archive distribution.</p>
            </Link>

            <Link to="/share-videos-online" className="p-6 bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-brand-500 transition-all text-center space-y-3 group shadow-sm">
              <Film className="h-8 w-8 text-brand-500 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Share Videos</h3>
              <p className="text-xs text-neutral-500">HTML5 player streaming for MP4 & WEBM.</p>
            </Link>

            <Link to="/password-protected-file-sharing" className="p-6 bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-brand-500 transition-all text-center space-y-3 group shadow-sm">
              <Lock className="h-8 w-8 text-brand-500 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Password Locks</h3>
              <p className="text-xs text-neutral-500">Bcrypt password gate security for downloads.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Security & Educational Resources Banner */}
      <section className="py-16 bg-white dark:bg-neutral-955 border-t border-neutral-200/50 dark:border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
                Learn Best Practices in Cybersecurity & File Transfer
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">Clean workspace dashboard to organize files & folders</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">In-browser previews for PDFs, audio, video, code, and CSV data</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">Detailed download tracking logs & geolocational statistics</span>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-500 hover:text-brand-600">
                  <BookOpen className="h-4 w-4" />
                  <span>Read Educational Guides</span>
                </Link>
                <Link to="/help" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                  <HelpCircle className="h-4 w-4" />
                  <span>Visit Help Center</span>
                </Link>
              </div>
            </div>
            
            <div className="p-8 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 text-center space-y-3">
              <HardDrive className="h-12 w-12 text-brand-500 mx-auto animate-pulse" />
              <div className="text-5xl font-extrabold text-brand-500">100%</div>
              <div className="text-lg font-bold text-neutral-800 dark:text-neutral-200">Anonymous & Private</div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Zero signups, zero credit cards, zero invasive cookies. Transfers are processed with privacy by default.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Share2, Sparkles, HardDrive, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const scriptId = 'jsonld-home';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'ShareVerse',
      'url': window.location.origin,
      'description': 'Secure, high-performance file and folder sharing platform with chunked uploading, password protection, and custom links.',
      'applicationCategory': 'FileSharingApplication',
      'operatingSystem': 'All',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      }
    });

    document.title = 'ShareVerse - Secure File Sharing & Cloud Storage Solutions';
    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, []);

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 min-h-[calc(100vh-16rem)]">
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
            <Sparkles className="h-3 w-3 animate-spin" />
            <span>Next-Gen File Distribution</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6 animate-fade-in">
            Secure, Instant File Distribution <span className="text-brand-500">Without Bounds</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto mb-10 animate-fade-in">
            Upload large files and folders instantly. Control access with customizable passwords, download limits, expiration links, and granular analytics dashboard.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-2xl shadow-xl shadow-brand-500/30 transition-all hover:scale-[1.02]"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-2xl shadow-xl shadow-brand-500/30 transition-all hover:scale-[1.02]"
                >
                  <span>Start Sharing Free</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/features"
                  className="px-8 py-4 bg-white/70 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-semibold rounded-2xl transition-all hover:bg-white dark:hover:bg-neutral-750"
                >
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-neutral-950 border-t border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Engineered for Speed, Security, and Scalability
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400">
              Why use traditional clouds when you can transfer files with high reliability and zero speed throttling?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 rounded-2xl w-fit mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Chunked Resume Upload</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Large file uploads are divided into small pieces. Pause, resume, or auto-retry upload whenever connectivity breaks.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 rounded-2xl w-fit mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Password & Expiry Locks</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Keep files confidential. Set download caps, custom link timers, and strong cryptographic passwords before sharing.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 rounded-2xl w-fit mb-6">
                <Share2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Unified Folder Sharing</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Upload entire folder hierarchies from your local system. Generate secure unique keys to distribute lists seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Create customizable links to represent your business.</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">Custom branded dashboard to view uploads & folders</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">In-browser previews for PDFs, audio, video, code, and text</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">Detailed download tracking logs & geolocational analytics</span>
                </div>
              </div>
            </div>
            
            <div className="p-8 glass-panel rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 text-center">
              <HardDrive className="h-12 w-12 text-brand-500 mx-auto mb-4 animate-pulse" />
              <div className="text-5xl font-extrabold text-brand-500 mb-2">100%</div>
              <div className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mb-1">Local & Cloud Integration</div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Self-host on SQLite local storage, or link bucket providers like S3/MinIO for large cloud distribution networks.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

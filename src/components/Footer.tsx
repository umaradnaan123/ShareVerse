import React from 'react';
import { Link } from 'react-router-dom';
import { HardDrive, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-neutral-955 border-t border-neutral-200/60 dark:border-neutral-800/60">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white" aria-label="ShareVerse Home">
              <HardDrive className="h-5 w-5 text-brand-500" />
              <span>Share<span className="text-brand-500">Verse</span></span>
            </Link>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
              Fast, secure, and completely free file and folder sharing platform with chunked uploading, password locks, auto-expiration, and analytics.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>256-bit TLS Encrypted Transfers</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">Product Hubs</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/upload" className="text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500 transition-colors">
                  Upload Hub
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500 transition-colors">
                  Product Features
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500 transition-colors">
                  Security Standards
                </Link>
              </li>
              <li>
                <Link to="/share-pdf-online" className="text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500 transition-colors">
                  Share PDF Online
                </Link>
              </li>
              <li>
                <Link to="/share-images-securely" className="text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500 transition-colors">
                  Share Images Securely
                </Link>
              </li>
              <li>
                <Link to="/share-zip-files" className="text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500 transition-colors">
                  Share ZIP Archives
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/blog" className="text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500 transition-colors">
                  Educational Blog
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500 transition-colors">
                  Support & FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">Legal & Compliance</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500 transition-colors">
                  DMCA Abuse Notice
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-neutral-100 dark:border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <p>&copy; {new Date().getFullYear()} ShareVerse, Inc. 100% Free Anonymous File Sharing Platform.</p>
          <div className="flex items-center gap-1">
            <span>Engineered for privacy and performance with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}

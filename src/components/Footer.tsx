import React from 'react';
import { Link } from 'react-router-dom';
import { HardDrive } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-50 dark:bg-neutral-955 border-t border-neutral-200/50 dark:border-neutral-800/50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
              <HardDrive className="h-5 w-5 text-brand-500" />
              <span>Share<span className="text-brand-500">Verse</span></span>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Secure, fast, and completely free chunked file and folder sharing platform with link customization, passwords, and analytics.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">Product</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/features" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500">
                  Security
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/blog" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500">
                  Help Center & FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/privacy" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-500">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-center">
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            &copy; {new Date().getFullYear()} ShareVerse, Inc. All files hosted are 100% Free Forever.
          </p>
        </div>
      </div>
    </footer>
  );
}

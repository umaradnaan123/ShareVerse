import React, { useEffect } from 'react';
import { ShieldAlert, Key, Globe, Database, Server } from 'lucide-react';

export default function Security() {
  useEffect(() => {
    document.title = 'ShareVerse - Platform Security Standards';
  }, []);

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 min-h-[calc(100vh-16rem)] py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Enterprise Grade Security</h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400">
            Learn how ShareVerse keeps your assets, links, and transactions safe and encrypted.
          </p>
        </div>

        <div className="space-y-12">
          <div className="flex gap-6 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 items-start">
            <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 rounded-2xl shrink-0">
              <Key className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Cryptographic Password Protection</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Shared file password inputs are hashed on the server side using the industry-standard bcrypt algorithm with 10 salt rounds. We store no raw password bytes in our databases.
              </p>
            </div>
          </div>

          <div className="flex gap-6 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 items-start">
            <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 rounded-2xl shrink-0">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Encrypted Transit & Headers</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Every API call is secured over TLS/HTTPS tunnels. We enforce strong HSTS policies, content-security headers, XSS filters, and secure CORS permissions to eliminate unauthorized access.
              </p>
            </div>
          </div>

          <div className="flex gap-6 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 items-start">
            <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 rounded-2xl shrink-0">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Secure Link Anonymization</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                To prevent direct indexing of sharing metadata, link identifiers are generated via a cryptographically random, non-sequential string resolver, making url enumeration practically impossible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

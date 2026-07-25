import React, { useEffect, useState } from 'react';
import { BookOpen, Calendar, User, ArrowLeft } from 'lucide-react';

interface Article {
  slug: string;
  title: string;
  author: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
}

export default function Blog() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const articles: Article[] = [
    {
      slug: 'how-to-securely-share-large-files',
      title: 'How to Securely Share Large Files Online',
      author: 'Security Team',
      date: 'July 24, 2026',
      readTime: '6 min read',
      excerpt: 'Sharing large assets does not mean you have to sacrifice privacy. Discover best practices for online sharing, transit encryption, and links safety.',
      content: `
### Why Secure Sharing Matters
When sharing high-resolution videos, corporate archives, or codebase folders, traditional email falls short. The files are too large, and mail transfer agents rarely enforce full end-to-end security policies. 

### Essential Security Measures
1. **Enforce Transit Encryption**: Always use tools that force HTTPS transfers to block man-in-the-middle snooping.
2. **Apply Short Link Lifetimes**: Set link expirations (e.g. 24 hours). The shorter the time window, the lower the exposure risk.
3. **Use Cryptographic Passwords**: Never share critical files without setting access passwords. Transfer the password to the recipient via a separate chat platform.
      `
    },
    {
      slug: 'how-password-protection-works',
      title: 'How Password-Protected File Sharing Works',
      author: 'Engineering Dept',
      date: 'July 20, 2026',
      readTime: '5 min read',
      excerpt: 'Learn the underlying computer science: how secure hashing functions safeguard download links without storing plaintext passwords on disk.',
      content: `
### Hashing vs Encryption
When you apply a password to a ShareVerse file, the server does not store the password directly. Instead, we use **bcrypt**, a salted cryptographic hashing function. 

### The Verification Workflow
1. The user inputs their desired password in their ShareVerse Share Settings.
2. The server hashes the password with 10 random salt rounds and stores the output hash.
3. When a recipient opens the link, the server compares the entered input with the database hash.
4. Access is granted only on successful matches. Even if the database is breached, the attacker cannot reverse the hash.
      `
    },
    {
      slug: 'cloud-storage-vs-file-sharing',
      title: 'Differences Between Cloud Storage and File Sharing',
      author: 'Product Mgmt',
      date: 'July 15, 2026',
      readTime: '4 min read',
      excerpt: 'Understand when to use sync clients like Dropbox or Google Drive, versus dedicated sharing utilities like ShareVerse.',
      content: `
### Cloud Storage Services
Cloud storage (like Drive or OneDrive) focuses on **synchronization and active collaboration**. It is designed to mirror your folders in the cloud, letting you edit spreadsheets or documents in real time.

### File Sharing Services
Dedicated file-sharing platforms (like ShareVerse) focus on **distribution, lifecycle control, and security**. Instead of giving a recipient persistent access to a folder, you send an isolated package that has a clear expiration timer and download limits.
      `
    }
  ];

  useEffect(() => {
    // Dynamic page title
    if (selectedArticle) {
      document.title = `${selectedArticle.title} - ShareVerse Blog`;
    } else {
      document.title = 'ShareVerse Blog - Free File Sharing Guides & Insights';
    }

    // Dynamic canonical link
    const canonicalId = 'canonical-blog';
    let link = document.getElementById(canonicalId) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = canonicalId;
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    const slugQuery = selectedArticle ? `?article=${selectedArticle.slug}` : '';
    link.href = `${window.location.origin}/blog${slugQuery}`;

    // Schema injection
    const scriptId = 'schema-blog';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    if (selectedArticle) {
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': selectedArticle.title,
        'description': selectedArticle.excerpt,
        'author': {
          '@type': 'Organization',
          'name': 'ShareVerse'
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'ShareVerse',
          'logo': {
            '@type': 'ImageObject',
            'url': `${window.location.origin}/vite.svg`
          }
        },
        'datePublished': new Date(selectedArticle.date).toISOString(),
        'mainEntityOfPage': link.href
      });
    } else {
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Blog',
        'name': 'ShareVerse Blog',
        'description': 'Expert guides and cybersecurity articles for online file assets sharing.',
        'publisher': {
          '@type': 'Organization',
          'name': 'ShareVerse'
        }
      });
    }

    return () => {
      document.getElementById(canonicalId)?.remove();
      document.getElementById(scriptId)?.remove();
    };
  }, [selectedArticle]);

  if (selectedArticle) {
    return (
      <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 min-h-[calc(100vh-16rem)] py-16 animate-fade-in">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 mb-8"
            aria-label="Return to Blog List"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to articles</span>
          </button>

          <article className="bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-sm">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 leading-tight text-neutral-900 dark:text-white">
              {selectedArticle.title}
            </h1>
            
            <div className="flex items-center gap-6 text-sm text-neutral-500 dark:text-neutral-400 mb-8 border-b border-neutral-100 dark:border-neutral-900 pb-4">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{selectedArticle.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{selectedArticle.date}</span>
              </div>
              <span>•</span>
              <span>{selectedArticle.readTime}</span>
            </div>

            <div className="prose dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-350 space-y-4">
              {selectedArticle.content.trim().split('\n\n').map((para, i) => {
                if (para.startsWith('###')) {
                  return (
                    <h2 key={i} className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mt-6 mb-2">
                      {para.replace('###', '').trim()}
                    </h2>
                  );
                }
                if (para.startsWith('1.') || para.startsWith('-')) {
                  return (
                    <ul key={i} className="list-disc pl-5 space-y-1">
                      {para.split('\n').map((item, j) => (
                        <li key={j}>{item.replace(/^[0-9-.\s]*/, '')}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={i}>{para}</p>;
              })}
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 min-h-[calc(100vh-16rem)] py-16 animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-2">
            <BookOpen className="h-9 w-9 text-brand-500" />
            <span>ShareVerse Educational Blog</span>
          </h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400">
            Expert guides, architectural insights, and security tips for online file assets delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((art, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedArticle(art)}
              className="group cursor-pointer p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-955 shadow-sm hover:shadow-md hover:border-brand-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                  <Calendar className="h-3 w-3" />
                  <span>{art.date}</span>
                  <span>•</span>
                  <span>{art.readTime}</span>
                </div>
                <h2 className="text-xl font-bold mb-3 group-hover:text-brand-500 transition-colors">
                  {art.title}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                  {art.excerpt}
                </p>
              </div>
              <span className="text-sm font-semibold text-brand-500 flex items-center gap-1 group-hover:underline">
                Read guide →
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

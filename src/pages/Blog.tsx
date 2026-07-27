import React from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { BookOpen, Calendar, User, ArrowLeft, CheckCircle2, List, ShieldCheck, FileText } from 'lucide-react';

export interface ArticleData {
  slug: string;
  title: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  excerpt: string;
  content: string;
  faqs?: { question: string; answer: string }[];
}

export const ARTICLES: ArticleData[] = [
  {
    slug: 'how-to-securely-share-large-files',
    title: 'How to Securely Share Large Files Online in 2026',
    author: 'ShareVerse Security Team',
    date: 'July 24, 2026',
    readTime: '7 min read',
    category: 'Security Guides',
    excerpt: 'Sharing high-resolution videos, corporate archives, or codebase folders does not mean sacrificing privacy. Learn transit encryption, link expiration, and password gate best practices.',
    content: `
### The Challenge of Modern Large File Transfers
Email attachments are restricted by strict file size limits (typically 25MB). When transferring high-definition video edits, database backups, vector graphics, or software source code, users require dedicated file sharing platforms. However, convenience must not come at the expense of privacy or cybersecurity.

### Key Security Pillars for Online File Distribution
1. **End-to-End Transit Encryption**: Ensure all upload and download streams utilize 256-bit TLS/HTTPS encryption to prevent eavesdropping on open Wi-Fi networks.
2. **Short-Lived Share Links**: Apply auto-expiration timers (such as 1 hour, 24 hours, or 7 days) to minimize unnecessary exposure of confidential files.
3. **Cryptographic Password Locking**: Protect sensitive assets with salted password hashes. Share the access password via an out-of-band communication channel (such as an encrypted chat app).
4. **Download Limits**: Restrict the number of times a file can be downloaded before access is automatically revoked.

### Why Stateless Serverless Transfers Excel
Traditional file servers often leave sensitive assets on local disk storage indefinitely. Modern platforms like ShareVerse store files in resilient cloud object storage while encoding asset metadata in URL-safe tokens, guaranteeing 100% link resolution without long-term server footprints.
    `,
    faqs: [
      { question: 'What is the maximum file size I can share on ShareVerse?', answer: 'ShareVerse uses parallel chunked upload streaming, allowing you to transfer multi-gigabyte files seamlessly.' },
      { question: 'Do recipients need an account to download my files?', answer: 'No! Recipients can preview and download shared files anonymously without registering an account.' }
    ]
  },
  {
    slug: 'how-password-protection-works',
    title: 'How Password-Protected File Sharing Works Under the Hood',
    author: 'Engineering Dept',
    date: 'July 20, 2026',
    readTime: '6 min read',
    category: 'Engineering Architecture',
    excerpt: 'Explore the computer science behind bcrypt salted password hashing, password gates, and database-less token verification.',
    content: `
### Plaintext Passwords vs Cryptographic Hashes
Storing plain-text passwords on a web server creates extreme security vulnerabilities. If a server database is compromised, plaintext passwords exposed in log files expose uploader privacy.

### The Cryptographic Verification Pipeline
1. **Salting & Hashing**: When you configure a password in ShareVerse Share Settings, the server runs the input string through bcrypt with 10 random salt rounds.
2. **Opaque Token Injection**: The hash is appended securely to the file metadata payload.
3. **Password Gate Verification**: When a recipient visits your share link, ShareVerse prompts for the password. The server verifies the entry using \`bcrypt.compare()\` without storing plaintext strings.
4. **Session Lock**: Successful entry unlocks inline browser previews and file download streams.
    `
  },
  {
    slug: 'cloud-storage-vs-file-sharing',
    title: 'Cloud Storage vs Dedicated File Sharing: Key Differences',
    author: 'Product Team',
    date: 'July 15, 2026',
    readTime: '5 min read',
    category: 'Productivity',
    excerpt: 'Understand when to use sync providers like Dropbox or Google Drive versus dedicated temporary sharing tools like ShareVerse.',
    content: `
### Cloud Storage Platforms
Cloud storage services (such as Google Drive or OneDrive) are engineered for **continuous synchronization, file versioning, and real-time document editing**. They mirror local filesystem directories across multiple devices.

### Dedicated File Sharing Platforms
File-sharing platforms (like ShareVerse) focus on **one-time distribution, link lifecycle management, and privacy control**. Instead of inviting external users into your storage account, you generate isolated, self-destructing links.
    `
  },
  {
    slug: 'google-drive-vs-shareverse',
    title: 'Google Drive vs ShareVerse: Anonymous & Secure Transfers',
    author: 'Editorial Staff',
    date: 'July 10, 2026',
    readTime: '6 min read',
    category: 'Comparisons',
    excerpt: 'A detailed breakdown comparing Google Drive permissions management with ShareVerse instant anonymous link generation.',
    content: `
### Permission Friction in Traditional Storage
Sharing a file on Google Drive often requires managing Google Account permissions, sending email access requests, or adjusting global organization settings.

### The ShareVerse Advantage
ShareVerse eliminates sign-up barriers. Upload any asset, receive an instant \`sv1_...\` URL, and share it with anyone on desktop or mobile. Optional passwords and expiration timers keep you in complete control.
    `
  },
  {
    slug: 'dropbox-alternatives-guide',
    title: 'Top Free Dropbox Alternatives for Fast File Sharing',
    author: 'Review Team',
    date: 'July 05, 2026',
    readTime: '5 min read',
    category: 'Guides',
    excerpt: 'Looking for a fast, free Dropbox alternative? Discover how modern web tools offer chunked uploads, dark mode, and zero account requirements.',
    content: `
### Key Criteria for Modern File Sharing Alternatives
When choosing a file-sharing alternative to Dropbox or WeTransfer, look for:
- **No Mandatory Registration**: Fast guest uploads without email barriers.
- **Inline Browser Previews**: Support for viewing images, PDFs, videos, and code without forced downloads.
- **Cross-Platform Accessibility**: Responsive layouts optimized for desktop, tablet, and mobile browsers.
    `
  },
  {
    slug: 'file-sharing-for-students',
    title: 'Secure File Sharing for Students and Educators',
    author: 'Academic Outreach',
    date: 'June 28, 2026',
    readTime: '4 min read',
    category: 'Education',
    excerpt: 'How students and teachers can share lecture videos, PDF research papers, ZIP codebases, and presentations effortlessly.',
    content: `
### Academic Collaboration Made Simple
Students collaborating on group projects need to submit ZIP archives, PDF research papers, and video presentations. ShareVerse provides free, fast uploads with built-in QR code generation for presentation screens.
    `
  },
  {
    slug: 'password-protected-downloads-explained',
    title: 'Password Protected Downloads: Safeguarding Sensitive Files',
    author: 'Cybersecurity Analyst',
    date: 'June 20, 2026',
    readTime: '5 min read',
    category: 'Security Guides',
    excerpt: 'Learn how password locks protect tax documents, legal contracts, and personal media from unauthorized public access.',
    content: `
### Preventing Unintended Link Forwarding
When sharing a public URL, anyone with the link can access your file if no password is set. Adding a password gate ensures that even if the link is forwarded unintentionally, only recipients with the secret key can unlock the download stream.
    `
  },
  {
    slug: 'best-free-file-sharing-platforms-2026',
    title: 'Best Free File Sharing Platforms in 2026',
    author: 'Tech Review Desk',
    date: 'June 12, 2026',
    readTime: '7 min read',
    category: 'Industry Audits',
    excerpt: 'An annual audit of top file-sharing services, evaluating speed, privacy features, preview capabilities, and core web vitals.',
    content: `
### 2026 File Sharing Benchmark Criteria
We evaluated leading file sharing platforms across four key metrics:
1. **Upload Velocity**: Parallel chunked upload throughput over standard connections.
2. **Preview Support**: Support for inline images, PDFs, video streaming, and CSV tables.
3. **Security Options**: Password protection, link expiration, and download limits.
4. **User Experience**: Dark mode support, zero ad clutter, and mobile responsiveness.
    `
  }
];

export default function Blog() {
  const { slug } = useParams<{ slug?: string }>();
  const activeArticle = ARTICLES.find(a => a.slug === slug);

  if (activeArticle) {
    const articleSchema = [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': activeArticle.title,
        'description': activeArticle.excerpt,
        'author': {
          '@type': 'Organization',
          'name': activeArticle.author
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'ShareVerse',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://share-verse-nu.vercel.app/vite.svg'
          }
        },
        'datePublished': new Date(activeArticle.date).toISOString(),
        'mainEntityOfPage': `https://share-verse-nu.vercel.app/blog/${activeArticle.slug}`
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://share-verse-nu.vercel.app/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': 'https://share-verse-nu.vercel.app/blog' },
          { '@type': 'ListItem', 'position': 3, 'name': activeArticle.title, 'item': `https://share-verse-nu.vercel.app/blog/${activeArticle.slug}` }
        ]
      }
    ];

    if (activeArticle.faqs) {
      articleSchema.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': activeArticle.faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': { '@type': 'Answer', 'text': faq.answer }
        }))
      } as any);
    }

    return (
      <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 py-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <SEO
          title={activeArticle.title}
          description={activeArticle.excerpt}
          canonicalUrl={`https://share-verse-nu.vercel.app/blog/${activeArticle.slug}`}
          ogType="article"
          jsonLd={articleSchema}
        />

        <div className="max-w-4xl mx-auto space-y-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to all guides</span>
          </Link>

          <article className="bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
            <header className="space-y-4 border-b border-neutral-100 dark:border-neutral-900 pb-6">
              <span className="inline-block px-3 py-1 bg-brand-500/10 text-brand-500 rounded-full text-xs font-bold uppercase tracking-wider">
                {activeArticle.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white leading-tight">
                {activeArticle.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>{activeArticle.author}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{activeArticle.date}</span>
                </div>
                <span>•</span>
                <span>{activeArticle.readTime}</span>
              </div>
            </header>

            <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-6">
              {activeArticle.content.trim().split('\n\n').map((para, i) => {
                if (para.startsWith('###')) {
                  return (
                    <h2 key={i} className="text-2xl font-bold text-neutral-900 dark:text-white mt-8 mb-4">
                      {para.replace('###', '').trim()}
                    </h2>
                  );
                }
                if (para.startsWith('1.') || para.startsWith('-')) {
                  return (
                    <ul key={i} className="list-disc pl-6 space-y-2 text-sm">
                      {para.split('\n').map((item, j) => (
                        <li key={j}>{item.replace(/^[0-9-.\s]*/, '')}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={i}>{para}</p>;
              })}
            </div>

            {activeArticle.faqs && (
              <section className="border-t border-neutral-100 dark:border-neutral-900 pt-8 space-y-4">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Article FAQs</h3>
                <div className="space-y-3">
                  {activeArticle.faqs.map((faq, idx) => (
                    <div key={idx} className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl space-y-1 text-sm">
                      <h4 className="font-bold text-neutral-900 dark:text-white">{faq.question}</h4>
                      <p className="text-neutral-500 dark:text-neutral-400">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="border-t border-neutral-100 dark:border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-neutral-500">Ready to share your files securely?</span>
              <Link to="/upload" className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors">
                Start Free Upload
              </Link>
            </div>
          </article>
        </div>
      </div>
    );
  }

  const blogListSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      'name': 'ShareVerse Educational Guides & Articles',
      'description': 'Expert cybersecurity articles, file sharing guides, and cloud storage comparisons.',
      'url': 'https://share-verse-nu.vercel.app/blog'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://share-verse-nu.vercel.app/' },
        { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': 'https://share-verse-nu.vercel.app/blog' }
      ]
    }
  ];

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 py-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <SEO
        title="Educational Blog – Guides, Security & File Sharing Insights"
        description="Explore ShareVerse articles on secure file transfer, bcrypt password locking, cloud storage comparisons, and large asset sharing best practices."
        canonicalUrl="https://share-verse-nu.vercel.app/blog"
        jsonLd={blogListSchema}
      />

      <div className="max-w-6xl mx-auto space-y-12">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 text-brand-500 rounded-full text-sm font-semibold">
            <BookOpen className="h-4 w-4" />
            <span>Guides & Cybersecurity Articles</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-neutral-900 dark:text-white">
            ShareVerse Educational Hub
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            In-depth engineering articles, cybersecurity tutorials, and productivity guides for secure online transfers.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ARTICLES.map((art, idx) => (
            <Link
              key={idx}
              to={`/blog/${art.slug}`}
              className="group p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-955 shadow-sm hover:shadow-md hover:border-brand-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                  <span className="px-2 py-0.5 bg-brand-500/10 text-brand-500 font-bold rounded-md">{art.category}</span>
                  <span>•</span>
                  <span>{art.readTime}</span>
                </div>
                <h2 className="text-xl font-bold mb-3 group-hover:text-brand-500 transition-colors text-neutral-900 dark:text-white leading-snug">
                  {art.title}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                  {art.excerpt}
                </p>
              </div>
              <span className="text-sm font-semibold text-brand-500 flex items-center gap-1 group-hover:underline">
                Read full article →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

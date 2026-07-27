import React from 'react';
import SEO from '../components/SEO';
import { ShieldCheck, FileText, Upload, CheckCircle2, Lock, HelpCircle, ArrowRight } from 'lucide-react';
import { useUploadStore } from '../store/uploadStore';
import { Link } from 'react-router-dom';

export interface LandingConfig {
  slug: string;
  topic: string;
  title: string;
  description: string;
  heroHeading: string;
  heroSubheading: string;
  icon: React.ElementType;
  faqs: { question: string; answer: string }[];
  useCases: { title: string; desc: string }[];
  contentSections: { heading: string; body: string }[];
}

const LANDING_DATA: Record<string, LandingConfig> = {
  'share-pdf-online': {
    slug: 'share-pdf-online',
    topic: 'PDF Sharing',
    title: 'Share PDF Online Free – Fast, Secure PDF File Transfer',
    description: 'Share PDF documents online securely with zero registration. Features inline PDF browser viewing, optional password lock, expiration timers, and chunked transfer.',
    heroHeading: 'Share PDF Documents Online Free',
    heroSubheading: 'Upload large PDF contracts, ebooks, presentations, and reports. Instant shareable links with inline browser viewing.',
    icon: FileText,
    useCases: [
      { title: 'Business Contracts & Legal Reviews', desc: 'Send PDF contracts to clients with custom access passwords and auto-expiring links.' },
      { title: 'Academic Research & Papers', desc: 'Distribute research documents, dissertations, and study guides seamlessly without file size limits.' },
      { title: 'Design Portfolios & Presentations', desc: 'Share high-resolution vector PDF portfolios with interactive inline viewing.' }
    ],
    contentSections: [
      {
        heading: 'Why ShareVerse is the Best Choice for PDF File Sharing',
        body: 'Portable Document Format (PDF) files are the universal standard for corporate documents, financial statements, academic papers, and digital books. Traditional email attachments frequently reject PDFs exceeding 20MB. ShareVerse removes these limitations through our chunked parallel transfer engine. Upload multi-gigabyte PDF files instantly and receive a secure URL (`sv1_...`) that allows recipients to view the PDF directly inside their web browser without downloading third-party software.'
      },
      {
        heading: 'End-to-End Security & Access Protection for PDFs',
        body: 'Security is paramount when distributing confidential PDF documents. ShareVerse equips every link with optional 256-bit password hashing (powered by bcrypt), configurable download limits, and strict link expiration timers (e.g. 1 hour, 24 hours, 7 days). Once an expiration timer is reached, the PDF link returns a 410 status and the document is purged from edge memory.'
      }
    ],
    faqs: [
      { question: 'Can recipients preview the PDF inline without downloading?', answer: 'Yes! ShareVerse features an embedded inline PDF renderer so recipients can scroll through pages, zoom, and read the document directly in their web browser.' },
      { question: 'Is there a file size limit for PDF uploads?', answer: 'ShareVerse uses chunked parallel uploads, allowing you to transfer multi-gigabyte PDF assets seamlessly.' },
      { question: 'How do I add a password to my PDF share link?', answer: 'After uploading your PDF, click "Share Settings" in your Dashboard to toggle Password Protection and set a custom security password.' }
    ]
  },
  'share-images-securely': {
    slug: 'share-images-securely',
    topic: 'Image Sharing',
    title: 'Share Images Securely – High Resolution Photo & Graphic Transfer',
    description: 'Upload and share RAW, PNG, JPG, WEBP, and SVG images in full resolution. Includes photo lightbox preview, zoom, rotation, and privacy controls.',
    heroHeading: 'Share High-Res Images & Photos Securely',
    heroSubheading: 'Transfer RAW photography, graphic design assets, and screenshots without compression or quality loss.',
    icon: ShieldCheck,
    useCases: [
      { title: 'Professional Photography Packages', desc: 'Deliver uncompressed RAW, TIFF, and high-res JPEG photo shoots to clients.' },
      { title: 'UI/UX & Graphic Assets', desc: 'Share SVG vectors, WEBP graphics, and Photoshop PSD mocks with web previews.' },
      { title: 'Privacy-Sensitive Screenshots', desc: 'Send sensitive proof screenshots protected by password gates and short expiration timers.' }
    ],
    contentSections: [
      {
        heading: 'Lossless Image Sharing Without Compression',
        body: 'Popular messaging apps and social media networks compress images aggressively, destroying pixel detail and metadata. ShareVerse transfers your image assets byte-for-byte in their original resolution. Whether you are uploading JPG, PNG, WEBP, GIF, SVG, or TIFF graphics, our platform preserves full fidelity.'
      },
      {
        heading: 'Interactive Image Viewer with Lightbox & Zoom Controls',
        body: 'When your recipient opens a ShareVerse image link, they are greeted by an interactive image preview panel. They can zoom in up to 300%, rotate the asset, trigger full-screen lightbox viewing, or download the original file with a single click.'
      }
    ],
    faqs: [
      { question: 'Does ShareVerse compress uploaded photos?', answer: 'No. All image files are uploaded and served in 100% full original quality without compression.' },
      { question: 'Which image formats are supported for inline preview?', answer: 'We support inline browser previews for JPG, JPEG, PNG, WEBP, GIF, and SVG formats.' }
    ]
  },
  'share-zip-files': {
    slug: 'share-zip-files',
    topic: 'ZIP & Archive Sharing',
    title: 'Share ZIP Files Online – Fast Compressed Archive Transfer',
    description: 'Upload and share ZIP, RAR, 7Z, and TAR archives. High-speed chunked transfers, password protection, and instant URL generation.',
    heroHeading: 'Share ZIP & Compressed Archives Online',
    heroSubheading: 'Package multiple files or codebases into ZIP archives and send them securely with custom download limits.',
    icon: Upload,
    useCases: [
      { title: 'Code Repositories & Build Bundles', desc: 'Send compressed codebase backups and distribution packages to development teams.' },
      { title: 'Bulk Project Deliverables', desc: 'Combine hundreds of assets into a single ZIP file for client handover.' }
    ],
    contentSections: [
      {
        heading: 'Streamlined Archive Distribution for Technical Teams',
        body: 'Managing compressed archives like ZIP, RAR, 7Z, and TAR requires reliable storage and fast throughput. ShareVerse provides chunked multi-threaded transfers so large archives upload rapidly without timing out.'
      }
    ],
    faqs: [
      { question: 'Can I password-protect a ZIP share link?', answer: 'Yes! You can add a ShareVerse password gate to require verification before downloading the ZIP archive.' }
    ]
  },
  'share-videos-online': {
    slug: 'share-videos-online',
    topic: 'Video Transfer',
    title: 'Share Videos Online Free – Fast Video Upload & Inline Player',
    description: 'Upload and stream MP4, WEBM, MOV, and AVI videos online. Features an HTML5 video player, responsive playback, and security controls.',
    heroHeading: 'Share & Stream Videos Online Free',
    heroSubheading: 'Upload high-definition video files and stream them directly in browser players with zero buffering.',
    icon: Lock,
    useCases: [
      { title: 'Video Production Reviews', desc: 'Send video edits and commercial cuts to clients for instant inline review.' },
      { title: 'Educational Video Materials', desc: 'Distribute webinar recordings and lecture videos with password protection.' }
    ],
    contentSections: [
      {
        heading: 'Fast HTML5 Inline Video Streaming',
        body: 'ShareVerse automatically enables HTML5 video playback for MP4 and WEBM video assets. Recipients can play, seek, control volume, and view videos in full-screen directly on desktop or mobile devices.'
      }
    ],
    faqs: [
      { question: 'Can recipients stream the video without downloading?', answer: 'Yes! Supported MP4 and WEBM videos stream inline using native browser players.' }
    ]
  },
  'password-protected-file-sharing': {
    slug: 'password-protected-file-sharing',
    topic: 'Password Security',
    title: 'Password Protected File Sharing – Encrypted Access Control',
    description: 'Protect shared links with cryptographic bcrypt passwords. Ensure only authorized users unlock your file transfers.',
    heroHeading: 'Password Protected Secure File Sharing',
    heroSubheading: 'Add a cryptographic security layer to your shared files. Hashed passwords prevent unauthorized access.',
    icon: Lock,
    useCases: [
      { title: 'Confidential Client Data', desc: 'Protect financial statements, tax records, and client NDAs with password locks.' },
      { title: 'Internal Operations', desc: 'Share sensitive operational scripts and database dumps with team passwords.' }
    ],
    contentSections: [
      {
        heading: 'How Cryptographic Password Protection Works',
        body: 'When you enable Password Protection in ShareVerse, the password is never saved in plain text. We hash the password using bcrypt with 10 salted rounds. When a recipient opens the share link, they must enter the password to unlock both the preview stream and the download button.'
      }
    ],
    faqs: [
      { question: 'Is the password stored on disk?', answer: 'No. Passwords are salted and hashed using bcrypt. Plaintext passwords are never stored.' }
    ]
  }
};

export default function SeoLandingPage({ pageSlug }: { pageSlug: string }) {
  const config = LANDING_DATA[pageSlug] || LANDING_DATA['share-pdf-online'];
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

  const IconComponent = config.icon;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': config.faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };

  const landingSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': config.title,
      'description': config.description,
      'url': `https://share-verse-nu.vercel.app/${config.slug}`
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
          'name': config.topic,
          'item': `https://share-verse-nu.vercel.app/${config.slug}`
        }
      ]
    },
    faqSchema
  ];

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 py-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <SEO
        title={config.title}
        description={config.description}
        canonicalUrl={`https://share-verse-nu.vercel.app/${config.slug}`}
        jsonLd={landingSchema}
      />

      <div className="max-w-4xl mx-auto space-y-16">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 text-brand-500 rounded-full text-sm font-semibold">
            <IconComponent className="h-4 w-4" />
            <span>{config.topic} Hub</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-neutral-900 dark:text-white leading-tight">
            {config.heroHeading}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            {config.heroSubheading}
          </p>
        </header>

        {/* Embedded Drag & Drop Upload Widget */}
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-brand-500 bg-white dark:bg-neutral-955 rounded-3xl p-10 text-center transition-all shadow-sm group relative cursor-pointer"
        >
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />

          <div className="p-4 bg-brand-500/10 text-brand-500 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform">
            <Upload className="h-10 w-10" />
          </div>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            Upload {config.topic} Files
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
            Drag and drop assets here or click to browse files from your computer.
          </p>

          <button className="py-2.5 px-6 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-brand-500/20 pointer-events-none">
            Choose Files
          </button>
        </div>

        {/* Use Cases Grid */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white text-center">
            Common Use Cases for {config.topic}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {config.useCases.map((uc, i) => (
              <div key={i} className="p-6 bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-2 shadow-sm">
                <CheckCircle2 className="h-6 w-6 text-brand-500" />
                <h3 className="font-bold text-neutral-900 dark:text-white">{uc.title}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Rich Content Sections */}
        <section className="bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8 leading-relaxed text-neutral-700 dark:text-neutral-300">
          {config.contentSections.map((sec, idx) => (
            <div key={idx} className={idx > 0 ? 'border-t border-neutral-100 dark:border-neutral-900 pt-8 space-y-4' : 'space-y-4'}>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{sec.heading}</h2>
              <p>{sec.body}</p>
            </div>
          ))}
        </section>

        {/* FAQ Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-center gap-2 text-center">
            <HelpCircle className="h-6 w-6 text-brand-500" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {config.faqs.map((faq, idx) => (
              <div key={idx} className="p-6 bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-2 shadow-sm">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">{faq.question}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center pt-8">
          <Link to="/upload" className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-brand-500/20">
            <span>Start Uploading Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

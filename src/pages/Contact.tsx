import React, { useState } from 'react';
import SEO from '../components/SEO';
import { Mail, MessageSquare, ShieldAlert, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  });

  const contactSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      'name': 'Contact & Abuse Reporting - ShareVerse',
      'description': 'Get in touch with ShareVerse customer support or report abuse/copyright infringement.',
      'url': 'https://share-verse-nu.vercel.app/contact'
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
          'name': 'Contact Us',
          'item': 'https://share-verse-nu.vercel.app/contact'
        }
      ]
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 py-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <SEO
        title="Contact Us – Support & Abuse Reporting"
        description="Contact the ShareVerse engineering and support team. Submit general feedback, feature inquiries, technical questions, or copyright abuse notices."
        canonicalUrl="https://share-verse-nu.vercel.app/contact"
        jsonLd={contactSchema}
      />

      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 text-brand-500 rounded-full text-sm font-semibold">
            <Mail className="h-4 w-4" />
            <span>Support & Communications</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-neutral-900 dark:text-white">
            Get in Touch with ShareVerse
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Have questions about file sharing limits, technical integrations, or security policy? We are here to help.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="p-6 bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-3">
              <div className="p-3 bg-brand-500/10 text-brand-500 rounded-2xl inline-block">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h2 className="font-bold text-lg text-neutral-900 dark:text-white">General Inquiries</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Questions about our features, chunked upload engine, or API capabilities.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-3">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl inline-block">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Report DMCA / Abuse</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Submit copyright infringement complaints or flag inappropriate uploaded links.
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-sm">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto animate-bounce" />
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Message Delivered</h2>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-md mx-auto">
                    Thank you for reaching out. Our support team will review your message and respond shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="py-2.5 px-6 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-850 text-sm font-semibold rounded-xl transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:border-brand-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:border-brand-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                      Subject Type
                    </label>
                    <select
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:border-brand-500 text-sm"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="abuse">Report Abuse / DMCA Violation</option>
                      <option value="bug">Technical Bug Report</option>
                      <option value="feature">Feature Suggestion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                      Message Details
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your question or include the ShareVerse URL you wish to report..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:border-brand-500 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit Request</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

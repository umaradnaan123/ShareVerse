import React, { useEffect } from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  useEffect(() => {
    document.title = 'ShareVerse - Simple, transparent pricing';
  }, []);

  const plans = [
    {
      name: 'Community Edition',
      price: '$0',
      period: 'forever',
      desc: 'Great for individuals self-hosting on local servers or SQLite environments.',
      features: [
        'Unlimited local storage config',
        'Max 100MB chunk size uploads',
        'Password locked links',
        'Basic local downloads stats',
        'Community forum support'
      ],
      action: 'Deploy Now',
      link: '/register',
      popular: false
    },
    {
      name: 'ShareVerse Pro',
      price: '$9',
      period: 'per month',
      desc: 'Ideal for small businesses requiring cloud storage backends, analytics and multi-user configurations.',
      features: [
        'Everything in Community Edition',
        'S3/MinIO bucket integration',
        'Max 5GB large uploads chunking',
        'Geolocational download tracking charts',
        'Priority administrative helpdesk support',
        'Email confirmation verification templates'
      ],
      action: 'Get Started Pro',
      link: '/register',
      popular: true
    }
  ];

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 min-h-[calc(100vh-16rem)] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400">
            Host your own files or utilize our cloud hosting to share documents securely.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-3xl border flex flex-col justify-between transition-all duration-200 relative ${
                p.popular
                  ? 'border-brand-500 bg-white dark:bg-neutral-950 shadow-xl shadow-brand-500/5 ring-1 ring-brand-500'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                  Highly Recommended
                </span>
              )}

              <div>
                <h3 className="text-2xl font-bold mb-2">{p.name}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">{p.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-extrabold tracking-tight">{p.price}</span>
                  <span className="text-neutral-500 dark:text-neutral-400 text-sm">/{p.period}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                      <Check className="h-5 w-5 text-green-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to={p.link}
                className={`w-full py-3 text-center font-medium rounded-xl text-sm transition-colors ${
                  p.popular
                    ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/10'
                    : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                {p.action}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

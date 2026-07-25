import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, LogIn, Github, Chrome } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, oauthLogin, error, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleOAuth = async (provider: string) => {
    const mockEmails: Record<string, string> = {
      google: 'google.partner@gmail.com',
      github: 'github.dev@github.com'
    };
    const success = await oauthLogin(provider, mockEmails[provider], `OAuth User`);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-xl animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold mb-2">Welcome Back</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Sign in to access your file workspace.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium border border-red-500/20 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:border-brand-500 text-sm text-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:border-brand-500 text-sm text-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-brand-500/10"
          >
            <LogIn className="h-4 w-4" />
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="relative my-6 text-center">
          <span className="absolute inset-x-0 top-3 h-px bg-neutral-200 dark:bg-neutral-850" />
          <span className="relative bg-white dark:bg-neutral-950 px-3 text-xs text-neutral-400 font-semibold uppercase tracking-wider">
            Or Connect With
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => handleOAuth('google')}
            className="flex items-center justify-center gap-2 py-2.5 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-sm font-semibold"
          >
            <Chrome className="h-4 w-4 text-red-500" />
            <span>Google</span>
          </button>
          <button
            onClick={() => handleOAuth('github')}
            className="flex items-center justify-center gap-2 py-2.5 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-sm font-semibold"
          >
            <Github className="h-4 w-4 text-neutral-800 dark:text-neutral-250" />
            <span>GitHub</span>
          </button>
        </div>

        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

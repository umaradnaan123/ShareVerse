import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Share2, Shield, Calendar, Download, Eye, EyeOff, Check } from 'lucide-react';

interface ShareModalProps {
  file: {
    id: string;
    name: string;
    is_public: number;
    expires_at: string | null;
    download_limit: number | null;
    password_hash?: string | null;
  };
  onClose: () => void;
}

export default function ShareModal({ file, onClose }: ShareModalProps) {
  const shareUrl = `${window.location.origin}/share/${file.id}`;
  const [copied, setCopied] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  
  const [isPublic, setIsPublic] = useState(file.is_public === 1);
  const [enablePassword, setEnablePassword] = useState(!!file.password_hash);
  const [password, setPassword] = useState('');
  const [enableExpiration, setEnableExpiration] = useState(!!file.expires_at);
  const [expiresAt, setExpiresAt] = useState(file.expires_at ? file.expires_at.substring(0, 16) : '');
  const [enableDownloadLimit, setEnableDownloadLimit] = useState(!!file.download_limit);
  const [downloadLimit, setDownloadLimit] = useState(file.download_limit ? file.download_limit.toString() : '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(shareUrl, { width: 200, margin: 2 }, (err, url) => {
      if (!err) setQrCodeData(url);
    });
  }, [shareUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `ShareVerse - ${file.name}`,
          text: `Download ${file.name} securely from ShareVerse.`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    // Client-side validations
    if (enablePassword && !password && !file.password_hash) {
      setError('Please enter a password.');
      setSaving(false);
      return;
    }

    if (enableExpiration && !expiresAt) {
      setError('Please select a valid expiration date.');
      setSaving(false);
      return;
    }

    if (enableDownloadLimit && (!downloadLimit || parseInt(downloadLimit, 10) < 1)) {
      setError('Please enter a valid download limit (minimum 1).');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/files/${file.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isPublic: isPublic ? 1 : 0,
          password: enablePassword ? (password || undefined) : null,
          expiresAt: enableExpiration ? (expiresAt || null) : null,
          downloadLimit: enableDownloadLimit ? (downloadLimit ? parseInt(downloadLimit, 10) : null) : null
        })
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        window.dispatchEvent(new CustomEvent('sv-file-updated'));
      } else {
        const errData = await response.json();
        setError(errData.error || 'Failed to save configuration settings.');
      }
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError('Network error: Failed to connect to server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white truncate max-w-[85%]">
            Share "{file.name}"
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-500 hover:text-neutral-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 pb-6 md:pb-0 md:pr-6">
            {qrCodeData && (
              <img
                src={qrCodeData}
                alt="QR Code Link"
                className="w-40 h-40 object-contain bg-white p-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 mb-4 shadow-sm"
              />
            )}
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 text-center">
              Scan this QR code to download directly on mobile devices
            </p>

            <div className="w-full flex items-center gap-2 bg-neutral-100 dark:bg-neutral-950 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="bg-transparent text-sm w-full outline-none select-all text-neutral-800 dark:text-neutral-200 px-2"
              />
              <button
                onClick={handleCopy}
                className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
                title="Copy Link"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            {typeof navigator.share === 'function' && (
              <button
                onClick={handleNativeShare}
                className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-200/50 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg w-full justify-center transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Share via Device API</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-brand-500" />
              <span>Link Configuration Settings</span>
            </h3>

            {/* Public Listing Toggle */}
            <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800/60 pb-3">
              <div>
                <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Public Listing
                </label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Allow search engines and directories to index this file
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                  isPublic ? 'bg-brand-500 justify-end' : 'bg-neutral-350 dark:bg-neutral-800 justify-start'
                }`}
                aria-label="Toggle Public Listing"
              >
                <span className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200" />
              </button>
            </div>

            {/* Password Protection Toggle & Input */}
            <div className="py-2 border-b border-neutral-100 dark:border-neutral-800/60 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Password Protection
                  </label>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Require visitors to enter a password to download
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnablePassword(!enablePassword)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                    enablePassword ? 'bg-brand-500 justify-end' : 'bg-neutral-350 dark:bg-neutral-800 justify-start'
                  }`}
                  aria-label="Toggle Password Protection"
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200" />
                </button>
              </div>
              {enablePassword && (
                <div className="mt-3 animate-fade-in">
                  <input
                    type="password"
                    placeholder={file.password_hash ? "•••••••• (Enter new password to change)" : "Enter password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-500 text-neutral-800 dark:text-neutral-100"
                  />
                </div>
              )}
            </div>

            {/* Expiration Date Toggle & Input */}
            <div className="py-2 border-b border-neutral-100 dark:border-neutral-800/60 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Expiration Date
                  </label>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Automatically disable link access after a specific time
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableExpiration(!enableExpiration)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                    enableExpiration ? 'bg-brand-500 justify-end' : 'bg-neutral-350 dark:bg-neutral-800 justify-start'
                  }`}
                  aria-label="Toggle Expiration Date"
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200" />
                </button>
              </div>
              {enableExpiration && (
                <div className="mt-3 animate-fade-in">
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-500 text-neutral-800 dark:text-neutral-100"
                  />
                </div>
              )}
            </div>

            {/* Download Limit Toggle & Input */}
            <div className="py-2 border-b border-neutral-100 dark:border-neutral-800/60 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Limit Download Count
                  </label>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Limit maximum number of download file resolutions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableDownloadLimit(!enableDownloadLimit)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                    enableDownloadLimit ? 'bg-brand-500 justify-end' : 'bg-neutral-350 dark:bg-neutral-800 justify-start'
                  }`}
                  aria-label="Toggle Download Limit"
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200" />
                </button>
              </div>
              {enableDownloadLimit && (
                <div className="mt-3 animate-fade-in">
                  <input
                    type="number"
                    placeholder="Enter maximum download limit"
                    min="1"
                    value={downloadLimit}
                    onChange={(e) => setDownloadLimit(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-500 text-neutral-800 dark:text-neutral-100"
                  />
                </div>
              )}
            </div>

            {error && (
              <p className="text-center text-xs font-semibold text-red-500 animate-fade-in pt-1">
                {error}
              </p>
            )}

            {saveSuccess && (
              <p className="text-center text-xs font-semibold text-green-500 animate-fade-in pt-1">
                Configuration applied successfully!
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

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
  };
  onClose: () => void;
}

export default function ShareModal({ file, onClose }: ShareModalProps) {
  const shareUrl = `${window.location.origin}/share/${file.id}`;
  const [copied, setCopied] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  
  const [isPublic, setIsPublic] = useState(file.is_public === 1);
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState(file.expires_at ? file.expires_at.substring(0, 16) : '');
  const [downloadLimit, setDownloadLimit] = useState(file.download_limit ? file.download_limit.toString() : '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

    try {
      const response = await fetch(`/api/files/${file.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isPublic: isPublic ? 1 : 0,
          password: password || undefined,
          expiresAt: expiresAt || null,
          downloadLimit: downloadLimit ? parseInt(downloadLimit, 10) : null
        })
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        window.dispatchEvent(new CustomEvent('sv-file-updated'));
      }
    } catch (err) {
      console.error('Error saving settings:', err);
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
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand-500" />
              <span>Link Configuration Settings</span>
            </h3>

            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Public Listing
                </label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Whether search bots or link directories see details
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`p-2 rounded-lg transition-colors ${
                  isPublic
                    ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                    : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                }`}
              >
                {isPublic ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                Password Protection
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep unprotected"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 text-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Expiration Date</span>
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 text-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Download className="h-3 w-3" />
                <span>Limit Download Count</span>
              </label>
              <input
                type="number"
                placeholder="No limit"
                min="1"
                value={downloadLimit}
                onChange={(e) => setDownloadLimit(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 text-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl text-sm transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>

            {saveSuccess && (
              <p className="text-center text-xs font-medium text-green-500 animate-fade-in">
                Configuration applied successfully!
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

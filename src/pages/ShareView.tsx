import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { File, Download, ShieldAlert, Eye, Lock, RefreshCw, AlertCircle, Music } from 'lucide-react';

interface FileDetails {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  hasPassword: boolean;
  expires_at: string | null;
  download_limit: number | null;
  download_count: number;
  created_at: string;
}

export default function ShareView() {
  const { id } = useParams<{ id: string }>();
  const [file, setFile] = useState<FileDetails | null>(null);
  const [password, setPassword] = useState('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [previewContent, setPreviewContent] = useState<string>('');
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/shares/${id}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to resolve link');
      }
      const data = await response.json();
      setFile(data);
      if (!data.hasPassword) {
        setIsPasswordVerified(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (!file || !isPasswordVerified) return;

    const mime = file.mime_type.toLowerCase();
    const isText = mime.startsWith('text/') || mime.includes('json') || mime.includes('javascript') || mime.includes('xml') || file.name.endsWith('.md') || file.name.endsWith('.ts') || file.name.endsWith('.yaml') || file.name.endsWith('.yml');
    const isCsv = file.name.endsWith('.csv') || mime.includes('csv');

    if (isText || isCsv) {
      loadPreviewText(isCsv);
    }
  }, [file, isPasswordVerified]);

  const loadPreviewText = async (isCsv: boolean) => {
    setLoadingPreview(true);
    try {
      const pwdQuery = password ? `?password=${encodeURIComponent(password)}` : '';
      const response = await fetch(`/api/shares/${id}/download${pwdQuery}`);
      if (response.ok) {
        const text = await response.text();
        if (isCsv) {
          const rows = text.split('\n').map(row => row.split(','));
          setCsvData(rows.filter(row => row.length > 0 && row[0] !== ''));
        } else {
          setPreviewContent(text);
        }
      }
    } catch (err) {
      console.error('Error fetching preview data:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    try {
      const response = await fetch(`/api/shares/${id}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        setIsPasswordVerified(true);
      } else {
        const err = await response.json();
        setVerifyError(err.error || 'Incorrect Password');
      }
    } catch (err) {
      setVerifyError('Failed to verify password');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex-1 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-sm p-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Error</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">{error}</p>
          <button onClick={fetchDetails} className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition-colors">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!isPasswordVerified) {
    return (
      <div className="flex-1 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center py-20 px-4">
        <form onSubmit={handleVerifyPassword} className="w-full max-w-sm bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-xl text-center">
          <Lock className="h-12 w-12 text-brand-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-xl font-bold mb-2">Password Protected</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            This shared file link is password encrypted. Enter the key to proceed.
          </p>

          {verifyError && (
            <p className="text-xs font-semibold text-red-500 mb-4">{verifyError}</p>
          )}

          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:border-brand-500 text-sm mb-4 text-center"
          />

          <button type="submit" className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors">
            Unlock File
          </button>
        </form>
      </div>
    );
  }

  if (!file) return null;

  const downloadUrl = `/api/shares/${file.id}/download${password ? `?password=${encodeURIComponent(password)}` : ''}`;
  const mime = file.mime_type.toLowerCase();

  const isImage = mime.startsWith('image/');
  const isVideo = mime.startsWith('video/');
  const isAudio = mime.startsWith('audio/');
  const isPdf = mime === 'application/pdf';
  const isText = mime.startsWith('text/') || mime.includes('json') || mime.includes('javascript') || mime.includes('xml') || file.name.endsWith('.md') || file.name.endsWith('.ts') || file.name.endsWith('.yaml') || file.name.endsWith('.yml');
  const isCsv = file.name.endsWith('.csv') || mime.includes('csv');

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="p-4 bg-brand-500/10 text-brand-500 rounded-2xl shrink-0">
              <File className="h-8 w-8" />
            </div>
            <div className="truncate">
              <h1 className="text-xl font-bold truncate text-neutral-800 dark:text-white" title={file.name}>
                {file.name}
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Size: {formatSize(file.size)} • Downloads: {file.download_count}
              </p>
            </div>
          </div>

          <a
            href={downloadUrl}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-brand-500/20 shrink-0"
          >
            <Download className="h-4.5 w-4.5" />
            <span>Download File</span>
          </a>
        </div>

        <div className="bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-400">
            <Eye className="h-4 w-4 text-brand-500" />
            <span>Browser Preview Panel</span>
          </div>

          <div className="p-6 flex flex-col justify-center items-center min-h-[300px]">
            {loadingPreview ? (
              <RefreshCw className="h-8 w-8 text-brand-500 animate-spin" />
            ) : isImage ? (
              <img
                src={downloadUrl}
                alt={file.name}
                className="max-h-[600px] max-w-full rounded-2xl object-contain border border-neutral-100 dark:border-neutral-900"
              />
            ) : isVideo ? (
              <video
                controls
                src={downloadUrl}
                className="max-h-[500px] w-full rounded-2xl bg-black"
              />
            ) : isAudio ? (
              <div className="w-full max-w-md p-6 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-center">
                <Music className="h-10 w-10 text-brand-500 mx-auto mb-4" />
                <p className="font-semibold mb-4 text-sm truncate">{file.name}</p>
                <audio controls src={downloadUrl} className="w-full" />
              </div>
            ) : isPdf ? (
              <iframe
                src={downloadUrl}
                title={file.name}
                className="w-full h-[600px] rounded-2xl border border-neutral-200 dark:border-neutral-800"
              />
            ) : isCsv ? (
              <div className="w-full overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-850 text-left text-xs">
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {csvData.map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx === 0 ? 'bg-neutral-50 dark:bg-neutral-900 font-bold' : ''}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-2.5 truncate max-w-[150px]" title={cell}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : isText ? (
              <div className="w-full bg-neutral-950 text-neutral-100 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed text-left max-h-[600px] border border-neutral-850">
                <pre>{previewContent}</pre>
              </div>
            ) : (
              <div className="text-center p-8 text-neutral-400 dark:text-neutral-600">
                <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-brand-500/30" />
                <p className="text-base font-semibold mb-1">Direct preview unavailable</p>
                <p className="text-sm">Click the download button above to retrieve file contents.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

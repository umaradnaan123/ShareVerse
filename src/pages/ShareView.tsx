import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  File, 
  Download, 
  ShieldAlert, 
  Eye, 
  Lock, 
  RefreshCw, 
  AlertCircle, 
  Music,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  AlertTriangle,
  EyeOff,
  FileText
} from 'lucide-react';

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

  // Preview interactive features & retry fallback state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [assetLoading, setAssetLoading] = useState(true);
  const [blobObjectUrl, setBlobObjectUrl] = useState<string | null>(null);

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
      setError(err.message || 'Shareable link not found or has been deleted.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (file) {
      document.title = `${file.name} - ShareVerse File Viewer`;
      
      const robotsId = 'meta-robots-share';
      let robots = document.getElementById(robotsId) as HTMLMetaElement;
      if (!robots) {
        robots = document.createElement('meta');
        robots.id = robotsId;
        robots.name = 'robots';
        document.head.appendChild(robots);
      }
      robots.content = 'noindex, nofollow';

      return () => {
        robots.remove();
      };
    }
  }, [file]);

  useEffect(() => {
    if (!file || !isPasswordVerified) return;

    setPreviewFailed(false);
    setAssetLoading(true);
    setZoomLevel(1);
    setRotationAngle(0);
    setBlobObjectUrl(null);

    const mime = file.mime_type.toLowerCase();
    const isText = mime.startsWith('text/') || mime.includes('json') || mime.includes('javascript') || mime.includes('xml') || file.name.endsWith('.md') || file.name.endsWith('.ts') || file.name.endsWith('.yaml') || file.name.endsWith('.yml');
    const isCsv = file.name.endsWith('.csv') || mime.includes('csv');

    if (isText || isCsv) {
      loadPreviewText(isCsv);
    } else {
      setAssetLoading(false);
    }
  }, [file, isPasswordVerified]);

  const downloadUrl = file ? `/api/shares/${file.id}/download${password ? `?password=${encodeURIComponent(password)}` : ''}` : '';
  const previewUrl = downloadUrl ? `${downloadUrl}${downloadUrl.includes('?') ? '&' : '?'}inline=true` : '';

  const loadPreviewText = async (isCsv: boolean) => {
    setLoadingPreview(true);
    setPreviewFailed(false);
    try {
      const response = await fetch(previewUrl);
      if (response.ok) {
        const text = await response.text();
        if (isCsv) {
          const rows = text.split('\n').map(row => row.split(','));
          setCsvData(rows.filter(row => row.length > 0 && row[0] !== ''));
        } else {
          setPreviewContent(text);
        }
      } else {
        setPreviewFailed(true);
      }
    } catch (err) {
      console.error('Error fetching preview data:', err);
      setPreviewFailed(true);
    } finally {
      setLoadingPreview(false);
      setAssetLoading(false);
    }
  };

  const handleImageError = async () => {
    if (!blobObjectUrl && previewUrl) {
      try {
        console.log('Direct image load failed, attempting Blob URL fetch retry...');
        const response = await fetch(previewUrl);
        if (response.ok) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          setBlobObjectUrl(objectUrl);
          setAssetLoading(false);
          return;
        }
      } catch (err) {
        console.error('Blob object URL fallback failed:', err);
      }
    }
    setPreviewFailed(true);
    setAssetLoading(false);
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
      <div className="flex-1 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 text-center shadow-md">
          <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">Access Error</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6 leading-relaxed">
            {error}
          </p>
          <a
            href="/"
            className="inline-block py-2.5 px-6 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (!isPasswordVerified) {
    return (
      <div className="flex-1 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 text-center shadow-md">
          <div className="p-4 bg-brand-500/10 text-brand-500 rounded-2xl inline-block mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">Password Protected</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">
            Enter the password configured for this link to preview and download the file.
          </p>

          <form onSubmit={handleVerifyPassword}>
            <input
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:border-brand-500 text-sm mb-4 text-center dark:text-white"
            />

            {verifyError && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-red-500 mb-4">
                <AlertCircle className="h-4 w-4" />
                <span>{verifyError}</span>
              </div>
            )}

            <button type="submit" className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors">
              Unlock File
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!file) return null;

  const mime = file.mime_type.toLowerCase();
  const nameLower = file.name.toLowerCase();

  const isImage = mime.startsWith('image/');
  const isVideo = mime.startsWith('video/');
  const isAudio = mime.startsWith('audio/');
  const isPdf = mime === 'application/pdf';
  const isOffice = nameLower.endsWith('.docx') || nameLower.endsWith('.xlsx') || nameLower.endsWith('.pptx');
  const isText = mime.startsWith('text/') || mime.includes('json') || mime.includes('javascript') || mime.includes('xml') || nameLower.endsWith('.md') || nameLower.endsWith('.ts') || nameLower.endsWith('.yaml') || nameLower.endsWith('.yml');
  const isCsv = nameLower.endsWith('.csv') || mime.includes('csv');

  const imageSrc = blobObjectUrl || previewUrl;
  const officeEmbedUrl = `https://docs.google.com/gview?url=${encodeURIComponent(window.location.origin + previewUrl)}&embedded=true`;

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Fullscreen Image Lightbox Overlay */}
        {isFullscreen && isImage && (
          <div className="fixed inset-0 bg-neutral-950/95 z-[999] flex flex-col items-center justify-center p-4">
            <button 
              onClick={() => setIsFullscreen(false)} 
              className="absolute top-6 right-6 p-3 bg-neutral-800/80 hover:bg-neutral-700 text-white rounded-full transition-colors z-[1000]"
              title="Close Fullscreen"
            >
              <Minimize2 className="h-6 w-6" />
            </button>
            <div className="overflow-auto max-h-full max-w-full flex items-center justify-center">
              <img
                src={imageSrc}
                alt={file.name}
                style={{ 
                  transform: `scale(${zoomLevel}) rotate(${rotationAngle}deg)`, 
                  transition: 'transform 0.15s ease-out' 
                }}
                className="max-h-[90vh] max-w-[90vw] object-contain select-none"
              />
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
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

        {/* Browser Preview Panel */}
        <div className="bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-sm font-bold tracking-wider text-neutral-400">
            <div className="flex items-center gap-2 uppercase">
              <Eye className="h-4 w-4 text-brand-500" />
              <span>Browser Preview Panel</span>
            </div>
            {isImage && !previewFailed && !assetLoading && (
              <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-1 rounded-xl">
                <button 
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3.0))} 
                  className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-all" 
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))} 
                  className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-all" 
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setRotationAngle(prev => (prev + 90) % 360)} 
                  className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-all" 
                  title="Rotate Right"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setIsFullscreen(true)} 
                  className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-all" 
                  title="Fullscreen"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => { setZoomLevel(1); setRotationAngle(0); }} 
                  className="px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-all"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col justify-center items-center min-h-[350px] relative">
            {/* Loading Skeleton Overlays */}
            {(loadingPreview || assetLoading) && (
              <div className="absolute inset-0 flex flex-col gap-4 items-center justify-center bg-white/90 dark:bg-neutral-955/90 z-10 transition-opacity duration-300">
                <RefreshCw className="h-8 w-8 text-brand-500 animate-spin mb-2" />
                <p className="text-xs text-neutral-450 animate-pulse">Loading preview stream...</p>
              </div>
            )}

            {previewFailed ? (
              <div className="text-center p-8 max-w-md">
                <AlertTriangle className="h-14 w-14 text-amber-500 mx-auto mb-4 animate-bounce" />
                <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-100 mb-1">Preview Unavailable</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
                  The file content could not be previewed directly in the browser. You can download the file directly below.
                </p>
                <a 
                  href={downloadUrl} 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-md shadow-brand-500/20"
                >
                  <Download className="h-4 w-4" />
                  <span>Download File Directly</span>
                </a>
              </div>
            ) : isImage ? (
              <div className="overflow-hidden max-h-[600px] w-full flex items-center justify-center p-4">
                <img
                  src={imageSrc}
                  alt={file.name}
                  onLoad={() => setAssetLoading(false)}
                  onError={handleImageError}
                  style={{ 
                    transform: `scale(${zoomLevel}) rotate(${rotationAngle}deg)`, 
                    transition: 'transform 0.15s ease-out' 
                  }}
                  className="max-h-[500px] max-w-full rounded-2xl object-contain border border-neutral-100 dark:border-neutral-900 select-none shadow-sm"
                />
              </div>
            ) : isVideo ? (
              <video
                controls
                src={previewUrl}
                onLoadedData={() => setAssetLoading(false)}
                onError={() => { setPreviewFailed(true); setAssetLoading(false); }}
                className="max-h-[500px] w-full rounded-2xl bg-black shadow-sm"
              />
            ) : isAudio ? (
              <div className="w-full max-w-md p-6 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-center shadow-sm">
                <Music className="h-10 w-10 text-brand-500 mx-auto mb-4" />
                <p className="font-semibold mb-4 text-sm truncate">{file.name}</p>
                <audio 
                  controls 
                  src={previewUrl} 
                  onCanPlay={() => setAssetLoading(false)}
                  onError={() => { setPreviewFailed(true); setAssetLoading(false); }}
                  className="w-full" 
                />
              </div>
            ) : isPdf ? (
              <iframe
                src={previewUrl}
                title={file.name}
                onLoad={() => setAssetLoading(false)}
                onError={() => { setPreviewFailed(true); setAssetLoading(false); }}
                className="w-full h-[600px] rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
              />
            ) : isOffice ? (
              <iframe
                src={officeEmbedUrl}
                title={file.name}
                onLoad={() => setAssetLoading(false)}
                onError={() => { setPreviewFailed(true); setAssetLoading(false); }}
                className="w-full h-[600px] rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white"
              />
            ) : isCsv ? (
              <div className="w-full overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-inner">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-850 text-left text-xs">
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {csvData.map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx === 0 ? 'bg-neutral-50 dark:bg-neutral-900 font-bold' : ''}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-2.5 truncate max-w-[150px] dark:text-neutral-300" title={cell}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : isText ? (
              <div className="w-full bg-neutral-950 text-neutral-100 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed text-left max-h-[600px] border border-neutral-850 shadow-inner">
                <pre>{previewContent}</pre>
              </div>
            ) : (
              <div className="text-center p-8 text-neutral-450 dark:text-neutral-550 max-w-sm">
                <FileText className="h-12 w-12 mx-auto mb-4 text-brand-500/80" />
                <p className="text-sm font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Direct preview unavailable</p>
                <p className="text-xs mb-6">This file format is not supported for inline browser rendering.</p>
                <a 
                  href={downloadUrl} 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-md shadow-brand-500/10"
                >
                  <Download className="h-4 w-4" />
                  <span>Download File</span>
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

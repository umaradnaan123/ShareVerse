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
  FileText,
  Copy,
  Check,
  Code,
  Archive,
  QrCode,
  Info,
  Calendar,
  ShieldCheck,
  Clock,
  HardDrive,
  Share2,
  WrapText,
  Video,
  FileSpreadsheet
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
  previewUrl?: string;
  downloadUrl?: string;
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

  // Preview interactive controls & state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [assetLoading, setAssetLoading] = useState(true);
  const [blobObjectUrl, setBlobObjectUrl] = useState<string | null>(null);

  // Text & Code viewer options
  const [copiedCode, setCopiedCode] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

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

    const nameLower = file.name.toLowerCase();
    const mime = file.mime_type.toLowerCase();

    const isTextOrCode = mime.startsWith('text/') || 
      mime.includes('json') || 
      mime.includes('javascript') || 
      mime.includes('xml') || 
      nameLower.endsWith('.md') || 
      nameLower.endsWith('.ts') || 
      nameLower.endsWith('.tsx') || 
      nameLower.endsWith('.jsx') || 
      nameLower.endsWith('.js') || 
      nameLower.endsWith('.py') || 
      nameLower.endsWith('.java') || 
      nameLower.endsWith('.cpp') || 
      nameLower.endsWith('.c') || 
      nameLower.endsWith('.html') || 
      nameLower.endsWith('.css') || 
      nameLower.endsWith('.scss') || 
      nameLower.endsWith('.sql') || 
      nameLower.endsWith('.sh') || 
      nameLower.endsWith('.yaml') || 
      nameLower.endsWith('.yml');

    const isCsv = nameLower.endsWith('.csv') || mime.includes('csv');

    if (isTextOrCode || isCsv) {
      loadPreviewText(isCsv);
    } else {
      setAssetLoading(false);
    }
  }, [file, isPasswordVerified]);

  const downloadUrl = file ? `${file.downloadUrl || `/api/shares/${file.id}/download`}${password ? `?password=${encodeURIComponent(password)}` : ''}` : '';
  const previewUrl = file ? `${file.previewUrl || `/api/shares/${file.id}/preview`}${password ? `?password=${encodeURIComponent(password)}` : ''}` : '';
  const sharePageUrl = window.location.href;

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharePageUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(previewContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
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
  const extension = nameLower.split('.').pop() || '';

  // Detailed File Type Detectors
  const isImage = mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'avif', 'ico'].includes(extension);
  const isVideo = mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(extension);
  const isAudio = mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(extension);
  const isPdf = mime === 'application/pdf' || extension === 'pdf';
  const isOffice = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension);
  const isArchive = ['zip', 'rar', '7z', 'tar', 'gz'].includes(extension) || mime.includes('zip') || mime.includes('compressed') || mime.includes('tar');
  const isCode = ['js', 'ts', 'tsx', 'jsx', 'html', 'css', 'scss', 'java', 'cpp', 'c', 'py', 'php', 'go', 'rs', 'sql', 'sh'].includes(extension);
  const isText = mime.startsWith('text/') || mime.includes('json') || mime.includes('xml') || ['txt', 'json', 'xml', 'log', 'yaml', 'yml', 'md'].includes(extension) || isCode;
  const isCsv = extension === 'csv' || mime.includes('csv');

  const imageSrc = blobObjectUrl || previewUrl;
  const officeEmbedUrl = `https://docs.google.com/gview?url=${encodeURIComponent(window.location.origin + previewUrl)}&embedded=true`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(sharePageUrl)}`;

  const textLines = previewContent ? previewContent.split('\n') : [];

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
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

        {/* Top Asset Action Banner */}
        <div className="bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="p-4 bg-brand-500/10 text-brand-500 rounded-2xl shrink-0">
              {isImage ? <FileText className="h-8 w-8 text-blue-500" /> :
               isVideo ? <Video className="h-8 w-8 text-purple-500" /> :
               isAudio ? <Music className="h-8 w-8 text-emerald-500" /> :
               isArchive ? <Archive className="h-8 w-8 text-amber-500" /> :
               isOffice || isCsv ? <FileSpreadsheet className="h-8 w-8 text-green-500" /> :
               <File className="h-8 w-8 text-brand-500" />}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold truncate text-neutral-800 dark:text-white" title={file.name}>
                  {file.name}
                </h1>
                <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 rounded-md">
                  {extension || 'FILE'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Size: <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatSize(file.size)}</span> • Downloads: <span className="font-medium text-neutral-700 dark:text-neutral-300">{file.download_count}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300 font-semibold rounded-xl text-sm transition-colors border border-neutral-200 dark:border-neutral-800"
            >
              {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
              <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
            </button>

            <a
              href={downloadUrl}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-brand-500/20 shrink-0"
            >
              <Download className="h-4.5 w-4.5" />
              <span>Download File</span>
            </a>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Preview Panel (2 Cols) + Sidebar (1 Col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Browser Preview Panel (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full min-h-[500px]">
              
              {/* Header Bar with Type Controls */}
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-bold tracking-wider text-neutral-400">
                <div className="flex items-center gap-2 uppercase">
                  <Eye className="h-4 w-4 text-brand-500" />
                  <span>Browser Preview Panel</span>
                </div>

                {/* Interactive Controls based on asset format */}
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
                      title="Rotate 90°"
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
                      className="px-2 py-1 text-[11px] text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-all"
                    >
                      Reset
                    </button>
                  </div>
                )}

                {isText && !previewFailed && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setWordWrap(!wordWrap)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-medium transition-colors ${wordWrap ? 'bg-brand-500/10 border-brand-500/30 text-brand-500' : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500'}`}
                      title="Toggle Word Wrap"
                    >
                      <WrapText className="h-3.5 w-3.5" />
                      <span>Wrap</span>
                    </button>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium transition-colors"
                      title="Copy File Content"
                    >
                      {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Viewer Content Body */}
              <div className="p-6 flex-1 flex flex-col justify-center items-center relative min-h-[420px]">
                
                {/* Loading Spinner */}
                {(loadingPreview || assetLoading) && (
                  <div className="absolute inset-0 flex flex-col gap-4 items-center justify-center bg-white/90 dark:bg-neutral-955/90 z-10 transition-opacity duration-300">
                    <RefreshCw className="h-8 w-8 text-brand-500 animate-spin mb-2" />
                    <p className="text-xs text-neutral-450 animate-pulse">Loading preview stream...</p>
                  </div>
                )}

                {previewFailed ? (
                  <div className="text-center p-8 max-w-md space-y-3">
                    <div className="p-4 bg-brand-500/10 text-brand-500 rounded-2xl inline-block mb-2">
                      <FileText className="h-10 w-10" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">Preview is unavailable for this file type</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      You can still download the file safely below.
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
                  <div className="w-full max-w-md p-8 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl text-center shadow-sm space-y-4">
                    <div className="p-5 bg-emerald-500/10 text-emerald-500 rounded-full inline-block">
                      <Music className="h-12 w-12 animate-pulse" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-neutral-800 dark:text-white truncate">{file.name}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase mt-0.5">{extension} Audio Track</p>
                    </div>
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
                  <div className="w-full overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-inner max-h-[550px]">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-850 text-left text-xs">
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {csvData.map((row, rIdx) => (
                          <tr key={rIdx} className={rIdx === 0 ? 'bg-neutral-100 dark:bg-neutral-900 font-bold text-neutral-800 dark:text-white' : ''}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-4 py-2.5 truncate max-w-[200px] dark:text-neutral-300" title={cell}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : isText ? (
                  <div className="w-full bg-neutral-950 text-neutral-100 border border-neutral-850 rounded-2xl overflow-hidden font-mono text-xs shadow-inner">
                    <div className="flex bg-neutral-900 px-4 py-2 border-b border-neutral-800 justify-between items-center text-[11px] text-neutral-400">
                      <span>{file.name} ({textLines.length} lines)</span>
                      <span>UTF-8</span>
                    </div>
                    <div className="flex overflow-x-auto max-h-[550px]">
                      {/* Line Numbers Column */}
                      <div className="select-none py-4 px-3 text-right text-neutral-600 bg-neutral-950 border-r border-neutral-900 text-[11px]">
                        {textLines.map((_, i) => (
                          <div key={i}>{i + 1}</div>
                        ))}
                      </div>
                      {/* Code Pre Text */}
                      <pre className={`py-4 px-4 leading-relaxed text-neutral-200 ${wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'}`}>
                        {previewContent}
                      </pre>
                    </div>
                  </div>
                ) : isArchive ? (
                  <div className="text-center p-8 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full space-y-4 shadow-sm">
                    <div className="p-5 bg-amber-500/10 text-amber-500 rounded-3xl inline-block">
                      <Archive className="h-12 w-12" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-neutral-800 dark:text-white">{file.name}</h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 uppercase">{extension} Compressed Archive • {formatSize(file.size)}</p>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      Archive file content cannot be uncompressed inline. You can download the complete archive file below.
                    </p>
                    <a 
                      href={downloadUrl} 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-md shadow-brand-500/20"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Archive</span>
                    </a>
                  </div>
                ) : (
                  <div className="text-center p-8 text-neutral-500 dark:text-neutral-400 max-w-sm space-y-3">
                    <div className="p-4 bg-brand-500/10 text-brand-500 rounded-2xl inline-block mb-2">
                      <FileText className="h-10 w-10" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">Preview is not available for this file type</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      You can still download the file safely below.
                    </p>
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

          {/* File Information Sidebar (1 col) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-6">
              
              <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-900 pb-4">
                <Info className="h-4 w-4 text-brand-500" />
                <h2 className="text-sm font-bold text-neutral-800 dark:text-white uppercase tracking-wider">File Information</h2>
              </div>

              {/* Metadata Key-Value List */}
              <div className="space-y-4 text-xs">
                
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <File className="h-3.5 w-3.5 text-neutral-400" /> Extension:
                  </span>
                  <span className="font-semibold uppercase text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800">
                    {extension || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5 text-neutral-400" /> MIME Type:
                  </span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[150px]" title={file.mime_type}>
                    {file.mime_type}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5 text-neutral-400" /> File Size:
                  </span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {formatSize(file.size)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-neutral-400" /> Upload Date:
                  </span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {new Date(file.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <Download className="h-3.5 w-3.5 text-neutral-400" /> Total Downloads:
                  </span>
                  <span className="font-bold text-brand-500">
                    {file.download_count}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-neutral-400" /> Password Lock:
                  </span>
                  <span className={`font-semibold px-2 py-0.5 rounded-md text-[10px] ${file.hasPassword ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                    {file.hasPassword ? 'Protected' : 'Public'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-neutral-400" /> Expiration:
                  </span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {file.expires_at ? new Date(file.expires_at).toLocaleDateString() : 'Never'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <Download className="h-3.5 w-3.5 text-neutral-400" /> Download Cap:
                  </span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {file.download_limit !== null ? `${file.download_limit} max` : 'Unlimited'}
                  </span>
                </div>

              </div>

              {/* QR Code Section */}
              <div className="border-t border-neutral-100 dark:border-neutral-900 pt-4 space-y-3">
                <button
                  onClick={() => setShowQrCode(!showQrCode)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
                >
                  <QrCode className="h-4 w-4 text-brand-500" />
                  <span>{showQrCode ? 'Hide QR Code' : 'Generate QR Code'}</span>
                </button>

                {showQrCode && (
                  <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-center space-y-2">
                    <img 
                      src={qrApiUrl} 
                      alt="Share Link QR Code" 
                      className="w-40 h-40 mx-auto rounded-xl border border-neutral-200 dark:border-neutral-800"
                    />
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Scan to open share link on mobile device</p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

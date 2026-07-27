import React, { useEffect, useState } from 'react';
import UploadZone from '../components/UploadZone';
import ShareModal from '../components/ShareModal';
import {
  Folder,
  File,
  Search,
  Plus,
  Trash2,
  Star,
  Download,
  Share2,
  FolderOpen,
  ChevronRight,
  Grid,
  List,
  RefreshCw,
  HardDrive,
  CheckSquare,
  Square,
  Edit3,
  BarChart2,
  X,
  Globe,
  Clock,
  Eye
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  parent_folder_id: string | null;
  is_public: number;
  is_starred: number;
  is_trashed: number;
  expires_at: string | null;
  download_limit: number | null;
  download_count: number;
  created_at: string;
  password_hash: string | null;
}

interface FolderItem {
  id: string;
  name: string;
  parent_folder_id: string | null;
  is_starred: number;
  is_trashed: number;
  created_at: string;
}

export default function Dashboard() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>('root');
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([{ id: 'root', name: 'All Files' }]);
  
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentTab, setCurrentTab] = useState<'files' | 'starred' | 'trash'>('files');
  const [loading, setLoading] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [activeShareFile, setActiveShareFile] = useState<FileItem | null>(null);

  // Rename modal state
  const [renameTarget, setRenameTarget] = useState<{ type: 'file' | 'folder'; id: string; currentName: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Analytics modal state
  const [analyticsFile, setAnalyticsFile] = useState<FileItem | null>(null);
  const [analyticsData, setAnalyticsData] = useState<{
    file: any;
    totalDownloads: number;
    downloads: any[];
    countryCounts: Record<string, number>;
  } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const parentQuery = currentFolderId ? `?parentId=${currentFolderId}` : '';
      const trashQuery = currentTab === 'trash' ? '?trashed=true' : '?trashed=false';
      const starQuery = currentTab === 'starred' ? '?starred=true' : '';

      let filesUrl = '/api/files';
      let foldersUrl = '/api/folders';

      if (currentTab === 'trash') {
        filesUrl += trashQuery;
        foldersUrl += trashQuery;
      } else if (currentTab === 'starred') {
        filesUrl += starQuery;
        foldersUrl += starQuery;
      } else {
        filesUrl += parentQuery;
        foldersUrl += parentQuery;
      }

      const [filesRes, foldersRes] = await Promise.all([
        fetch(filesUrl),
        fetch(foldersUrl)
      ]);

      if (filesRes.ok && foldersRes.ok) {
        setFiles(await filesRes.json());
        setFolders(await foldersRes.json());
      }
    } catch (err) {
      console.error('Error fetching dashboard contents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
    setSelectedFileIds([]);
    setSelectedFolderIds([]);
  }, [currentFolderId, currentTab]);

  useEffect(() => {
    const handleUploaded = () => fetchContents();
    window.addEventListener('sv-file-uploaded', handleUploaded);
    window.addEventListener('sv-file-updated', handleUploaded);
    return () => {
      window.removeEventListener('sv-file-uploaded', handleUploaded);
      window.removeEventListener('sv-file-updated', handleUploaded);
    };
  }, [currentFolderId, currentTab]);

  const handleOpenFolder = (folder: FolderItem) => {
    if (currentTab !== 'files') return;
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
    setCurrentFolderId(folder.id);
  };

  const handleBreadcrumbClick = (crumb: { id: string | null; name: string }, idx: number) => {
    setBreadcrumbs(breadcrumbs.slice(0, idx + 1));
    setCurrentFolderId(crumb.id);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName) return;

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName,
          parentFolderId: currentFolderId === 'root' ? null : currentFolderId
        })
      });

      if (response.ok) {
        setNewFolderName('');
        setShowCreateFolder(false);
        fetchContents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateFile = async (fileId: string, updates: any) => {
    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) fetchContents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateFolder = async (folderId: string, updates: any) => {
    try {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) fetchContents();
    } catch (err) {
      console.error(err);
    }
  };

  const openRenameModal = (type: 'file' | 'folder', id: string, name: string) => {
    setRenameTarget({ type, id, currentName: name });
    setRenameValue(name);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget || !renameValue.trim()) return;

    if (renameTarget.type === 'file') {
      await handleUpdateFile(renameTarget.id, { name: renameValue.trim() });
    } else {
      await handleUpdateFolder(renameTarget.id, { name: renameValue.trim() });
    }
    setRenameTarget(null);
  };

  const fetchAnalytics = async (file: FileItem) => {
    setAnalyticsFile(file);
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/files/${file.id}/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const toggleSelectFile = (id: string) => {
    setSelectedFileIds(prev => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]);
  };

  const toggleSelectFolder = (id: string) => {
    setSelectedFolderIds(prev => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]);
  };

  const handleBulkTrash = async () => {
    try {
      await fetch('/api/files/bulk-trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds: selectedFileIds, folderIds: selectedFolderIds })
      });
      setSelectedFileIds([]);
      setSelectedFolderIds([]);
      fetchContents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkRestore = async () => {
    try {
      await fetch('/api/files/bulk-restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds: selectedFileIds, folderIds: selectedFolderIds })
      });
      setSelectedFileIds([]);
      setSelectedFolderIds([]);
      fetchContents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete selected items? This cannot be undone.')) return;
    try {
      await fetch('/api/files/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds: selectedFileIds, folderIds: selectedFolderIds })
      });
      setSelectedFileIds([]);
      setSelectedFolderIds([]);
      fetchContents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDownload = () => {
    selectedFileIds.forEach((fileId, idx) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = `/api/shares/${fileId}/download`;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, idx * 250);
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const totalUsedSize = files.reduce((acc, curr) => acc + curr.size, 0);
  const storageCap = 5 * 1024 * 1024 * 1024;
  const storagePercent = Math.min((totalUsedSize / storageCap) * 100, 100);

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 min-h-[calc(100vh-16rem)] flex flex-col md:flex-row animate-fade-in">
      <aside className="w-full md:w-64 bg-white dark:bg-neutral-955 border-r border-neutral-200/50 dark:border-neutral-800/50 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="space-y-1">
            <button
              onClick={() => { setCurrentTab('files'); setCurrentFolderId('root'); setBreadcrumbs([{ id: 'root', name: 'All Files' }]); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentTab === 'files'
                  ? 'bg-brand-500 text-white'
                  : 'text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              <FolderOpen className="h-4.5 w-4.5" />
              <span>Workspace Files</span>
            </button>
            <button
              onClick={() => setCurrentTab('starred')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentTab === 'starred'
                  ? 'bg-brand-500 text-white'
                  : 'text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              <Star className="h-4.5 w-4.5" />
              <span>Starred Favorites</span>
            </button>
            <button
              onClick={() => setCurrentTab('trash')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentTab === 'trash'
                  ? 'bg-brand-500 text-white'
                  : 'text-neutral-600 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              <Trash2 className="h-4.5 w-4.5" />
              <span>Trash Bin</span>
            </button>
          </div>

          {currentTab === 'files' && (
            <button
              onClick={() => setShowCreateFolder(true)}
              className="w-full py-2.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 border border-brand-500/20 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Folder</span>
            </button>
          )}
        </div>

        <div className="mt-8 border-t border-neutral-100 dark:border-neutral-900 pt-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <HardDrive className="h-4 w-4 text-brand-500" />
            <span>Storage Used</span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
            <div className="bg-brand-500 h-full transition-all duration-300" style={{ width: `${storagePercent}%` }} />
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 justify-between flex">
            <span>{formatSize(totalUsedSize)}</span>
            <span>5 GB Limit</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search in folder..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:border-brand-500 text-sm text-neutral-800 dark:text-neutral-100"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex bg-white dark:bg-neutral-955 p-1 border border-neutral-200 dark:border-neutral-800 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-neutral-100 dark:bg-neutral-900 text-brand-500' : 'text-neutral-400'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-neutral-100 dark:bg-neutral-900 text-brand-500' : 'text-neutral-400'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={fetchContents}
              className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {currentTab === 'files' && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 mb-6 flex-wrap">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                <button
                  onClick={() => handleBreadcrumbClick(crumb, idx)}
                  className={`hover:text-brand-500 font-medium ${idx === breadcrumbs.length - 1 ? 'text-neutral-800 dark:text-white font-bold' : ''}`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        {(selectedFileIds.length > 0 || selectedFolderIds.length > 0) && (
          <div className="mb-6 p-4 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-between animate-fade-in">
            <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
              Selected {selectedFileIds.length} file(s) & {selectedFolderIds.length} folder(s)
            </span>
            <div className="flex gap-2">
              {currentTab === 'trash' ? (
                <>
                  <button
                    onClick={handleBulkRestore}
                    className="px-3 py-1.5 text-xs font-semibold bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                  >
                    Restore Selection
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete Permanently
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleBulkDownload}
                    className="px-3 py-1.5 text-xs font-semibold bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-1"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handleBulkTrash}
                    className="px-3 py-1.5 text-xs font-semibold bg-red-500/15 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                  >
                    Trash Selection
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 text-brand-500 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-8">
            {filteredFolders.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Folders</h3>
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-4`}>
                  {filteredFolders.map((folder) => {
                    const isSelected = selectedFolderIds.includes(folder.id);
                    return (
                      <div
                        key={folder.id}
                        onClick={() => handleOpenFolder(folder)}
                        className={`group p-4 bg-white dark:bg-neutral-955 border rounded-2xl flex items-center justify-between cursor-pointer hover:border-brand-500/50 shadow-sm relative ${
                          isSelected ? 'border-brand-500 ring-1 ring-brand-500' : 'border-neutral-200 dark:border-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate w-[70%]">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSelectFolder(folder.id); }}
                            className="text-neutral-400 hover:text-brand-500 shrink-0"
                          >
                            {isSelected ? <CheckSquare className="h-4.5 w-4.5 text-brand-500" /> : <Square className="h-4.5 w-4.5" />}
                          </button>
                          <Folder className="h-5 w-5 text-brand-500 shrink-0" />
                          <span className="text-sm font-semibold truncate text-neutral-800 dark:text-neutral-200">
                            {folder.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openRenameModal('folder', folder.id, folder.name);
                            }}
                            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-400 hover:text-brand-500"
                            title="Rename Folder"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateFolder(folder.id, { isStarred: folder.is_starred ? 0 : 1 });
                            }}
                            className={`p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 ${folder.is_starred ? 'text-yellow-500' : 'text-neutral-400'}`}
                          >
                            <Star className="h-4 w-4 fill-current" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentTab === 'trash') {
                                handleUpdateFolder(folder.id, { isTrashed: 0 });
                              } else {
                                handleUpdateFolder(folder.id, { isTrashed: 1 });
                              }
                            }}
                            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 text-red-500"
                          >
                            {currentTab === 'trash' ? 'Restore' : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredFiles.length > 0 ? (
              <div>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Files</h3>
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-4`}>
                  {filteredFiles.map((file) => {
                    const isSelected = selectedFileIds.includes(file.id);
                    return (
                      <div
                        key={file.id}
                        className={`group p-4 bg-white dark:bg-neutral-955 border rounded-2xl flex flex-col justify-between shadow-sm relative hover:border-brand-500/50 ${
                          isSelected ? 'border-brand-500 ring-1 ring-brand-500' : 'border-neutral-200 dark:border-neutral-800'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div className="flex items-center gap-3 truncate w-[80%]">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleSelectFile(file.id); }}
                              className="text-neutral-400 hover:text-brand-500 shrink-0"
                            >
                              {isSelected ? <CheckSquare className="h-4.5 w-4.5 text-brand-500" /> : <Square className="h-4.5 w-4.5" />}
                            </button>
                            <File className="h-5 w-5 text-neutral-500 shrink-0" />
                            <a
                              href={`/share/${file.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-semibold truncate text-neutral-800 dark:text-neutral-200 hover:underline"
                            >
                              {file.name}
                            </a>
                          </div>

                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => handleUpdateFile(file.id, { isStarred: file.is_starred ? 0 : 1 })}
                              className={`${file.is_starred ? 'text-yellow-500' : 'text-neutral-300 dark:text-neutral-600 hover:text-yellow-500'} transition-colors`}
                            >
                              <Star className="h-4 w-4 fill-current" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                          <span>{formatSize(file.size)}</span>
                          
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {currentTab === 'trash' ? (
                              <button
                                onClick={() => handleUpdateFile(file.id, { isTrashed: 0 })}
                                className="px-2 py-0.5 bg-brand-500/10 text-brand-500 rounded font-semibold hover:bg-brand-500/20"
                              >
                                Restore
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => openRenameModal('file', file.id, file.name)}
                                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded text-neutral-400 hover:text-brand-500"
                                  title="Rename File"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => fetchAnalytics(file)}
                                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded text-purple-500"
                                  title="View Analytics"
                                >
                                  <BarChart2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setActiveShareFile(file)}
                                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded text-brand-500"
                                  title="Share Settings"
                                >
                                  <Share2 className="h-3.5 w-3.5" />
                                </button>
                                <a
                                  href={`/api/shares/${file.id}/download`}
                                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded text-emerald-500"
                                  title="Download File"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </a>
                                <button
                                  onClick={() => handleUpdateFile(file.id, { isTrashed: 1 })}
                                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded text-red-500"
                                  title="Move to Trash"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              folders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-400 dark:text-neutral-600">
                  <FolderOpen className="h-16 w-16 mb-4 animate-pulse text-brand-500/40" />
                  <p className="text-lg font-semibold mb-1">Workspace is empty</p>
                  <p className="text-sm">Upload files or folders above to get started.</p>
                </div>
              )
            )}
          </div>
        )}

        {currentTab === 'files' && (
          <div className="mt-8">
            <UploadZone currentFolderId={currentFolderId === 'root' ? null : currentFolderId} />
          </div>
        )}
      </main>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateFolder} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Create New Folder</h3>
            <input
              type="text"
              required
              autoFocus
              placeholder="Folder Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:border-brand-500 text-sm mb-4"
            />
            <div className="flex gap-2 justify-end text-sm font-semibold">
              <button
                type="button"
                onClick={() => { setShowCreateFolder(false); setNewFolderName(''); }}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inline Rename Modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleRenameSubmit} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Rename {renameTarget.type === 'file' ? 'File' : 'Folder'}
              </h3>
              <button type="button" onClick={() => setRenameTarget(null)} className="text-neutral-400 hover:text-neutral-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              type="text"
              required
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:border-brand-500 text-sm mb-4"
            />
            <div className="flex gap-2 justify-end text-sm font-semibold">
              <button
                type="button"
                onClick={() => setRenameTarget(null)}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Analytics Modal */}
      {analyticsFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-fade-in space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-900 pb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white truncate max-w-xs">
                  Analytics: {analyticsFile.name}
                </h3>
              </div>
              <button onClick={() => { setAnalyticsFile(null); setAnalyticsData(null); }} className="text-neutral-400 hover:text-neutral-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            {analyticsLoading ? (
              <div className="py-12 text-center">
                <RefreshCw className="h-8 w-8 text-brand-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-neutral-500">Loading analytics metrics...</p>
              </div>
            ) : analyticsData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl text-center">
                    <div className="text-3xl font-extrabold text-brand-500">{analyticsData.totalDownloads}</div>
                    <div className="text-xs font-semibold text-neutral-500 uppercase mt-1">Total Downloads</div>
                  </div>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl text-center">
                    <div className="text-3xl font-extrabold text-purple-500">{Object.keys(analyticsData.countryCounts).length}</div>
                    <div className="text-xs font-semibold text-neutral-500 uppercase mt-1">Countries</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-brand-500" />
                    <span>Recent Downloads Log</span>
                  </h4>
                  {analyticsData.downloads.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {analyticsData.downloads.map((log) => (
                        <div key={log.id} className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl text-xs flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{log.ip_address}</span>
                            <div className="text-neutral-400 text-[10px] truncate max-w-xs">{log.user_agent}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="inline-block px-2 py-0.5 bg-brand-500/10 text-brand-500 font-bold rounded text-[10px] mb-0.5">{log.country}</span>
                            <div className="text-neutral-400 text-[10px]">{new Date(log.downloaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 text-center py-4">No download records yet.</p>
                  )}
                </div>
              </div>
            ) : null}

            <div className="text-right">
              <button
                onClick={() => { setAnalyticsFile(null); setAnalyticsData(null); }}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-sm font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {activeShareFile && (
        <ShareModal file={activeShareFile} onClose={() => setActiveShareFile(null)} />
      )}
    </div>
  );
}

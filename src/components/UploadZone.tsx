import React, { useRef, useState } from 'react';
import { useUploadStore } from '../store/uploadStore';
import { Upload, FolderPlus, FilePlus } from 'lucide-react';

interface UploadZoneProps {
  currentFolderId: string | null;
}

export default function UploadZone({ currentFolderId }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const addUploadTasks = useUploadStore((state) => state.addUploadTasks);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      addUploadTasks(filesArray, currentFolderId);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addUploadTasks(Array.from(e.target.files), currentFolderId);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const triggerFolderInput = () => folderInputRef.current?.click();

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative w-full py-10 px-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
        isDragActive
          ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 scale-[0.99]'
          : 'border-neutral-300 dark:border-neutral-800 hover:border-brand-500/50 hover:bg-neutral-50 dark:hover:bg-neutral-900/30'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        {...({
          webkitdirectory: '',
          directory: '',
          multiple: true
        } as any)}
      />

      <div className="p-4 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 mb-4 animate-bounce">
        <Upload className="h-8 w-8" />
      </div>

      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
        Drag & Drop your files here
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-sm mb-6">
        Supports multi-file uploads, custom folders, and large archives. Max chunk size 2MB with auto-resume.
      </p>

      <div className="flex gap-4">
        <button
          onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm transition-colors"
        >
          <FilePlus className="h-4 w-4" />
          <span>Upload Files</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); triggerFolderInput(); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-200/50 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
        >
          <FolderPlus className="h-4 w-4" />
          <span>Upload Folder</span>
        </button>
      </div>
    </div>
  );
}

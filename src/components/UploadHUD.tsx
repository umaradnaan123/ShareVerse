import React, { useState } from 'react';
import { useUploadStore } from '../store/uploadStore';
import { Play, Pause, X, ChevronUp, ChevronDown, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function UploadHUD() {
  const { tasks, pauseUpload, resumeUpload, cancelUpload, clearCompleted, retryUpload } = useUploadStore();
  const [collapsed, setCollapsed] = useState(false);

  if (tasks.length === 0) return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSec: number) => {
    return formatSize(bytesPerSec) + '/s';
  };

  const formatETA = (seconds: number) => {
    if (seconds <= 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const uploadingTasks = tasks.filter((t) => t.status === 'uploading').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] rounded-2xl glass-panel shadow-2xl overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50 z-50 animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 bg-brand-500 text-white font-medium">
        <div className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${uploadingTasks > 0 ? 'animate-spin' : ''}`} />
          <span>
            {uploadingTasks > 0
              ? `Uploading ${uploadingTasks} file(s)...`
              : `Upload Manager (${completedTasks}/${tasks.length} done)`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {completedTasks > 0 && (
            <button
              onClick={clearCompleted}
              className="text-xs px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded transition-colors"
            >
              Clear Done
            </button>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="max-h-72 overflow-y-auto divide-y divide-neutral-200 dark:divide-neutral-800">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 bg-white/50 dark:bg-neutral-900/50 hover:bg-white/85 dark:hover:bg-neutral-900/80 transition-colors">
              <div className="flex justify-between items-start mb-1 gap-2">
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate w-3/4" title={task.name}>
                  {task.name}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
                  {formatSize(task.size)}
                </span>
              </div>

              <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-200 ${
                    task.status === 'completed'
                      ? 'bg-green-500'
                      : task.status === 'failed'
                      ? 'bg-red-500'
                      : task.status === 'paused'
                      ? 'bg-yellow-500'
                      : 'bg-brand-500'
                  }`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-3">
                  <span>{task.progress}%</span>
                  {task.status === 'uploading' && (
                    <>
                      <span>•</span>
                      <span>{formatSpeed(task.speed)}</span>
                      <span>•</span>
                      <span>ETA: {formatETA(task.eta)}</span>
                    </>
                  )}
                  {task.status === 'completed' && (
                    <span className="text-green-500 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Done
                    </span>
                  )}
                  {task.status === 'failed' && (
                    <span className="text-red-500 flex items-center gap-1" title={task.error}>
                      <AlertCircle className="h-3 w-3" /> {task.error || 'Failed'}
                    </span>
                  )}
                  {task.status === 'paused' && <span className="text-yellow-500">Paused</span>}
                </div>

                <div className="flex gap-2">
                  {task.status === 'uploading' && (
                    <button
                      onClick={() => pauseUpload(task.id)}
                      className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors text-yellow-500"
                    >
                      <Pause className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {task.status === 'paused' && (
                    <button
                      onClick={() => resumeUpload(task.id)}
                      className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors text-brand-500"
                    >
                      <Play className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {task.status === 'failed' && (
                    <button
                      onClick={() => retryUpload(task.id)}
                      className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors text-brand-500"
                      title="Retry Upload"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  )}
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => cancelUpload(task.id)}
                      className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

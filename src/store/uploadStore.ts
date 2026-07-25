import { create } from 'zustand';


export interface UploadTask {
  id: string;
  name: string;
  size: number;
  uploadedBytes: number;
  status: 'idle' | 'uploading' | 'paused' | 'completed' | 'failed';
  progress: number;
  speed: number;
  eta: number;
  file: File;
  parentFolderId?: string | null;
  cancelController?: AbortController;
}

interface UploadState {
  tasks: UploadTask[];
  addUploadTasks: (files: File[], parentFolderId?: string | null) => void;
  startUpload: (taskId: string) => Promise<void>;
  pauseUpload: (taskId: string) => void;
  resumeUpload: (taskId: string) => void;
  cancelUpload: (taskId: string) => void;
  clearCompleted: () => void;
}

const CHUNK_SIZE = 2 * 1024 * 1024;

export const useUploadStore = create<UploadState>((set, get) => ({
  tasks: [],

  addUploadTasks: (files, parentFolderId) => {
    const newTasks: UploadTask[] = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 11),
      name: file.name,
      size: file.size,
      uploadedBytes: 0,
      status: 'idle',
      progress: 0,
      speed: 0,
      eta: 0,
      file,
      parentFolderId
    }));

    set((state) => ({ tasks: [...state.tasks, ...newTasks] }));

    newTasks.forEach((task) => {
      get().startUpload(task.id);
    });
  },

  startUpload: async (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task || task.status === 'uploading' || task.status === 'completed') return;

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'uploading', cancelController: new AbortController() } : t
      )
    }));


    const currentTask = get().tasks.find((t) => t.id === taskId)!;
    const { file, parentFolderId, uploadedBytes } = currentTask;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let startChunkIndex = Math.floor(uploadedBytes / CHUNK_SIZE);
    
    let bytesSent = startChunkIndex * CHUNK_SIZE;
    let startTime = Date.now();

    for (let i = startChunkIndex; i < totalChunks; i++) {
      const activeTask = get().tasks.find((t) => t.id === taskId);
      if (!activeTask || activeTask.status !== 'uploading') {
        break;
      }

      const chunkStart = i * CHUNK_SIZE;
      const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, file.size);
      const chunkBlob = file.slice(chunkStart, chunkEnd);
      const chunkFile = new File([chunkBlob], file.name, { type: file.type });

      const formData = new FormData();
      formData.append('chunk', chunkFile);
      formData.append('fileId', taskId);
      formData.append('chunkIndex', i.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('fileName', file.name);
      formData.append('mimeType', file.type);
      formData.append('fileSize', file.size.toString());
      if (parentFolderId) formData.append('parentFolderId', parentFolderId);

      try {
        const response = await fetch('/api/files/upload/chunk', {
          method: 'POST',
          body: formData,
          signal: activeTask.cancelController?.signal
        });

        if (!response.ok) {
          throw new Error('Failed to upload chunk');
        }

        const resData = await response.json();
        bytesSent += (chunkEnd - chunkStart);

        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const currentSpeed = elapsedSeconds > 0 ? (bytesSent - (startChunkIndex * CHUNK_SIZE)) / elapsedSeconds : 0;
        const remainingBytes = file.size - bytesSent;
        const eta = currentSpeed > 0 ? Math.ceil(remainingBytes / currentSpeed) : 0;
        const progress = Math.min(Math.round((bytesSent / file.size) * 100), 100);

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  uploadedBytes: bytesSent,
                  progress,
                  speed: currentSpeed,
                  eta,
                  status: resData.completed ? 'completed' : 'uploading'
                }
              : t
          )
        }));

        if (resData.completed) {
          window.dispatchEvent(new CustomEvent('sv-file-uploaded', { detail: resData.file }));
          break;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          break;
        }
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: 'failed', speed: 0, eta: 0 } : t))
        }));
        break;
      }
    }
  },

  pauseUpload: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task || task.status !== 'uploading') return;

    task.cancelController?.abort();
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: 'paused', speed: 0, eta: 0 } : t))
    }));
  },

  resumeUpload: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task || task.status !== 'paused') return;

    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: 'uploading' } : t))
    }));
    get().startUpload(taskId);
  },

  cancelUpload: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (task && task.status === 'uploading') {
      task.cancelController?.abort();
    }
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId)
    }));
  },

  clearCompleted: () => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.status !== 'completed')
    }));
  }
}));

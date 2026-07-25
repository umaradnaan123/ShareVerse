import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Shield, Users, FileText, Database, Download, Trash2, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminData {
  stats: {
    totalStorage: number;
    files: number;
    folders: number;
    users: number;
    downloads: number;
  };
  countryStats: { country: string; count: number }[];
  activityLogs: {
    id: string;
    user_id: string | null;
    action: string;
    details: string;
    created_at: string;
    user_email: string | null;
  }[];
  filesList: {
    id: string;
    name: string;
    size: number;
    download_count: number;
    owner_email: string;
    created_at: string;
  }[];
  usersList: {
    id: string;
    email: string;
    role: string;
    created_at: string;
  }[];
}

export default function AdminPanel() {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setData(await response.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAdminStats();
  }, [token, user]);

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) fetchAdminStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchAdminStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Permanently delete this file?')) return;
    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchAdminStats();
    } catch (err) {
      console.error(err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading || !data) {
    return (
      <div className="flex-1 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center py-20">
        <Activity className="h-8 w-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-brand-500" />
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Operations Center</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-brand-500/10 text-brand-500 rounded-2xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{data.stats.users}</div>
              <div className="text-xs text-neutral-500">Registered Users</div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-brand-500/10 text-brand-500 rounded-2xl">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{data.stats.files}</div>
              <div className="text-xs text-neutral-500">Total Files</div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-brand-500/10 text-brand-500 rounded-2xl">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatSize(data.stats.totalStorage)}</div>
              <div className="text-xs text-neutral-500">Storage Utilized</div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-brand-500/10 text-brand-500 rounded-2xl">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{data.stats.downloads}</div>
              <div className="text-xs text-neutral-500">Total Downloads</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-500" />
              <span>User Registrations</span>
            </h3>
            <div className="overflow-x-auto max-h-80">
              <table className="min-w-full text-left text-xs divide-y divide-neutral-200 dark:divide-neutral-800">
                <thead>
                  <tr className="text-neutral-500">
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                  {data.usersList.map((usr) => (
                    <tr key={usr.id}>
                      <td className="py-3 font-semibold">{usr.email}</td>
                      <td className="py-3 capitalize">
                        <select
                          value={usr.role}
                          onChange={(e) => handleChangeRole(usr.id, e.target.value)}
                          className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded px-2 py-0.5 text-xs outline-none"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(usr.id)}
                          className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-500" />
              <span>Uploaded Asset Tracking</span>
            </h3>
            <div className="overflow-x-auto max-h-80">
              <table className="min-w-full text-left text-xs divide-y divide-neutral-200 dark:divide-neutral-800">
                <thead>
                  <tr className="text-neutral-500">
                    <th className="pb-3">File Name</th>
                    <th className="pb-3">Owner</th>
                    <th className="pb-3">Size</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                  {data.filesList.map((f) => (
                    <tr key={f.id}>
                      <td className="py-3 font-semibold truncate max-w-[120px]" title={f.name}>{f.name}</td>
                      <td className="py-3 truncate max-w-[100px]" title={f.owner_email}>{f.owner_email}</td>
                      <td className="py-3">{formatSize(f.size)}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteFile(f.id)}
                          className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand-500" />
            <span>Real-time System Action Logs</span>
          </h3>
          <div className="overflow-y-auto max-h-80 font-mono text-[11px] leading-relaxed border border-neutral-250 dark:border-neutral-850 rounded-2xl p-4 bg-neutral-955 text-neutral-300">
            {data.activityLogs.map((log) => (
              <div key={log.id} className="py-1 flex gap-4 hover:bg-white/5 transition-colors">
                <span className="text-brand-500 shrink-0">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                <span className="text-green-500 shrink-0 font-bold">{log.action}</span>
                <span className="truncate">{log.details} {log.user_email ? `by (${log.user_email})` : ''}</span>
              </div>
            ))}
            {data.activityLogs.length === 0 && (
              <p className="text-center py-10 text-neutral-600">No activity logs recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

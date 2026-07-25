import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  is_verified?: number;
  created_at?: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  initialize: () => Promise<void>;
  oauthLogin: (provider: string, email: string, name: string) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('sv_token'),
  refreshToken: localStorage.getItem('sv_refresh_token'),
  user: localStorage.getItem('sv_user') ? JSON.parse(localStorage.getItem('sv_user')!) : null,
  isAuthenticated: !!localStorage.getItem('sv_token'),
  isLoading: false,
  error: null,

  initialize: async () => {
    const token = get().token;
    if (!token) return;

    set({ isLoading: true });
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const user = await response.json();
        set({ user, isAuthenticated: true });
        localStorage.setItem('sv_user', JSON.stringify(user));
      } else {
        const refToken = get().refreshToken;
        if (refToken) {
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: refToken })
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem('sv_token', data.accessToken);
            set({ token: data.accessToken });
            
            const profileRes = await fetch('/api/auth/me', {
              headers: { 'Authorization': `Bearer ${data.accessToken}` }
            });
            if (profileRes.ok) {
              const user = await profileRes.json();
              set({ user, isAuthenticated: true });
              localStorage.setItem('sv_user', JSON.stringify(user));
            }
          } else {
            get().logout();
          }
        } else {
          get().logout();
        }
      }
    } catch (err) {
      console.error('Failed to initialize auth', err);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const errData = await res.json();
        set({ error: errData.error || 'Login failed' });
        return false;
      }

      const data = await res.json();
      localStorage.setItem('sv_token', data.accessToken);
      localStorage.setItem('sv_refresh_token', data.refreshToken);
      localStorage.setItem('sv_user', JSON.stringify(data.user));

      set({
        token: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
        isAuthenticated: true
      });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Login failed' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const errData = await res.json();
        set({ error: errData.error || 'Registration failed' });
        return null;
      }

      const data = await res.json();
      return data.message || 'Registration successful';
    } catch (err: any) {
      set({ error: err.message || 'Registration failed' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  oauthLogin: async (provider, email, name) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/oauth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, email, name })
      });

      if (!res.ok) {
        const errData = await res.json();
        set({ error: errData.error || 'OAuth failed' });
        return false;
      }

      const data = await res.json();
      localStorage.setItem('sv_token', data.accessToken);
      localStorage.setItem('sv_refresh_token', data.refreshToken);
      localStorage.setItem('sv_user', JSON.stringify(data.user));

      set({
        token: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
        isAuthenticated: true
      });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'OAuth failed' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      if (res.ok) return true;
      const err = await res.json();
      set({ error: err.error || 'Reset failed' });
      return false;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('sv_token');
    localStorage.removeItem('sv_refresh_token');
    localStorage.removeItem('sv_user');
    set({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      error: null
    });
  }
}));

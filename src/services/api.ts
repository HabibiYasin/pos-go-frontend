import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { getTabToken } from './tabSession';

const API_URL = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:8080');

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // untuk cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Always specify tab authentication, including an empty Bearer when logged out.
// This prevents a legacy shared cookie from selecting another tab's account.
api.interceptors.request.use((config) => {
  config.headers.set('Authorization', `Bearer ${getTabToken() ?? ''}`);
  return config;
});

// Only an expired/invalid session (401) logs out this tab; 403 is a permission error.
const isPublicPath = (path: string) => {
  if (path === '/login') return true;
  if (path === '/menu' || path.startsWith('/menu')) return true;
  if (path === '/checkout' || path.startsWith('/checkout')) return true;
  if (path.startsWith('/order-success') || path.startsWith('/payment-pending')) return true;
  return false;
};

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 && err.config?.url !== '/auth/login') {
      useAuthStore.getState().logout();
      const path = window.location.pathname;
      // Redirect hanya jika di halaman yang seharusnya butuh login (admin/kasir/koki/change-password)
      if (!isPublicPath(path)) {
        const params = new URLSearchParams({ reason: 'session_changed' });
        window.location.href = `/login?${params.toString()}`;
      }
    }
    return Promise.reject(err);
  }
);

export default api;

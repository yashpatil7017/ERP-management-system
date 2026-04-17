import axios from 'axios';
import { toast } from 'react-toastify';
import { clearAuthStorage, getToken } from '../utils/tokenUtils';

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    const isPublicAuthRoute = String(config?.url || '').includes('/api/auth/login')
      || String(config?.url || '').includes('/api/auth/register');

    if (!token && !isPublicAuthRoute) {
      return Promise.reject(new axios.Cancel('No auth token found. Request blocked.'));
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      clearAuthStorage();
      if (typeof unauthorizedHandler === 'function') {
        unauthorizedHandler('Session expired. Please login again.');
      } else {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error('You are not authorized to perform this action.');
    }
    return Promise.reject(error);
  }
);

export default api;


import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}auth/refresh/`, { refresh: refreshToken });
          localStorage.setItem('access_token', res.data.access);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => api.post('auth/login/', data);
export const register = (data) => api.post('auth/register/', data);
export const logout = (data) => api.post('auth/logout/', data);

// Profile
export const getProfile = () => api.get('profile/');
export const updateProfile = (data) => api.patch('profile/', data);

// Medications
export const getMedications = () => api.get('medications/');
export const getTodayMedications = () => api.get('today-medications/');
export const addMedication = (data) => api.post('medications/', data);
export const updateMedication = (id, data) => api.patch(`medications/${id}/`, data);
export const deleteMedication = (id) => api.delete(`medications/${id}/`);

// Logs & History
export const getLogs = () => api.get('logs/');
export const addLog = (data) => api.post('logs/', data);
export const getStats = () => api.get('stats/');
export const getNotificationHistory = () => api.get('notifications/history/');

export default api;

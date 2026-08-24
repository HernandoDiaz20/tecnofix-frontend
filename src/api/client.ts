import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('tecnofix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo global de errores (e.g. invalidar token si 401)
    if (error.response?.status === 401) {
      localStorage.removeItem('tecnofix_token');
      // Redirigir si fuera necesario
    }
    return Promise.reject(error);
  }
);

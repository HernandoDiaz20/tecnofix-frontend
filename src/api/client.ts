import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const TOKEN_STORAGE_KEY = 'tecnofix_token';
export const EXPIRES_AT_STORAGE_KEY = 'tecnofix_token_expires_at';
export const UNAUTHORIZED_EVENT = 'tecnofix:unauthorized';

export function clearStoredSession(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(EXPIRES_AT_STORAGE_KEY);
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  // No enviar el token en la ruta de login para evitar que un token expirado
  // cause un 401 antes de que el backend procese las credenciales.
  const isLoginRoute = config.url?.includes('/auth/login');

  if (token && !isLoginRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url as string | undefined;
    const isAuthMutationRoute =
      requestUrl?.includes('/auth/login') || requestUrl?.includes('/auth/logout');

    if (error.response?.status === 401 && !isAuthMutationRoute) {
      const hadToken = Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
      clearStoredSession();
      if (hadToken) {
        window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
      }
    }
    return Promise.reject(error);
  }
);

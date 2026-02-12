import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Aseguramos que el token se asigne siempre en tiempo real
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token inválido o expirado -> Limpiar y salir
      localStorage.clear();
      window.location.href = '/login';
    }

    if (status === 403) {
      // El usuario está logueado pero NO tiene permiso para esta acción
      console.error("Acceso Prohibido (403): No tienes los permisos necesarios.");
      // Opcional: alert("No tienes permisos de administrador.");
    }

    return Promise.reject(error);
  }
);

export default api;
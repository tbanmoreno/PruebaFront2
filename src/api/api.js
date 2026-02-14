import axios from 'axios';
import { notify } from '../utils/alerts';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.endsWith('/api') 
    ? import.meta.env.VITE_API_URL 
    : `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      notify.error("Sin conexión", "No se pudo establecer contacto con el tostadero.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const currentPath = window.location.pathname;

    // Extraemos el mensaje del backend si existe (Spring suele enviarlo en data.message)
    const backendMessage = data?.message || "Ocurrió un inconveniente inesperado.";

    if (status === 401 && currentPath !== '/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (status === 403) {
      notify.error("Acceso Prohibido", "No tienes los privilegios de administrador necesarios.");
    } else if (status === 400 || status === 409) {
      // 400 Bad Request o 409 Conflict (ej. correo duplicado)
      notify.error("Error en Solicitud", backendMessage);
    } else if (status >= 500) {
      notify.error("Fallo en la Cosecha", "Error interno del servidor. Reportado al equipo técnico.");
    }

    return Promise.reject(error);
  }
);

export default api;
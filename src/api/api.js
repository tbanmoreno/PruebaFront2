import axios from 'axios';
import { notify } from '../utils/alerts';

const api = axios.create({
  // Prioriza la URL de producción (Vercel/Cloud) o usa el puerto local por defecto
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// INTERCEPTOR DE PETICIONES: Inyección de seguridad
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Asegura que cada petición lleve la identidad del usuario
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// INTERCEPTOR DE RESPUESTAS: Gestión inteligente de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // CASO A: El servidor no responde (Servidor caído, Error de Red o CORS)
    if (!error.response) {
      notify.error(
        "Sin conexión", 
        "No se pudo establecer contacto con el tostadero central (Servidor)."
      );
      return Promise.reject(error);
    }

    const { status } = error.response;
    const currentPath = window.location.pathname;

    // CASO B: 401 - Sesión expirada o Token inválido
    // Protegemos con 'currentPath' para evitar bucles infinitos si ya estamos en Login
    if (status === 401 && currentPath !== '/login') {
      localStorage.removeItem('token'); // Solo removemos la credencial, no todo el storage
      // Redirigimos al usuario para que se re-autentique
      window.location.href = '/login';
    }

    // CASO C: 403 - Permisos insuficientes (Ej: Cliente intentando entrar a Admin)
    else if (status === 403) {
      notify.error(
        "Acceso Prohibido", 
        "Tu cuenta no tiene los privilegios de administrador necesarios."
      );
    }

    // CASO D: 500+ - Errores internos del Backend
    else if (status >= 500) {
      notify.error(
        "Fallo en la Cosecha", 
        "Nuestros sistemas internos han tenido un problema. Intenta de nuevo en unos minutos."
      );
    }

    return Promise.reject(error);
  }
);

export default api;
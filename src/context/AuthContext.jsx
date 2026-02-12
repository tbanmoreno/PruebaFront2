import { createContext, useContext, useState, useMemo } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);

    const login = async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            const { token: receivedToken } = response.data;

            localStorage.setItem('token', receivedToken);
            setToken(receivedToken);

            const profile = await api.get('/cuenta/perfil');
            const userData = profile.data;

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            
            return userData;
        } catch (error) {
            logout();
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.clear();
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    };

    const isAdmin = user?.rol === 'ADMINISTRADOR';
    const isAuthenticated = !!token;

    // Usamos useMemo para el valor del contexto. 
    // Esto mejora el rendimiento y ayuda a Vite a rastrear las dependencias.
    const value = useMemo(() => ({
        user,
        setUser, // Ahora disponible para OrderHistory.jsx
        token,
        login,
        logout,
        isAdmin,
        isAuthenticated
    }), [user, token]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};
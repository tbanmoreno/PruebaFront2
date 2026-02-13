import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            const { token: receivedToken } = response.data;

            // Guardamos el token primero para que el interceptor de api.js lo capture
            localStorage.setItem('token', receivedToken);
            setToken(receivedToken);

            const profile = await api.get('/cuenta/perfil');
            const userData = profile.data;

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            
            return userData;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    };

    const isAdmin = useMemo(() => user?.rol === 'ADMINISTRADOR', [user]);
    const isAuthenticated = useMemo(() => !!token, [token]);

    const value = useMemo(() => ({
        user,
        setUser,
        token,
        login,
        logout,
        isAdmin,
        isAuthenticated,
        loading
    }), [user, token, isAdmin, isAuthenticated, loading]);

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : (
                <div className="flex h-screen items-center justify-center bg-stone-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-stone-200 border-t-amber-800" />
                        <p className="font-black uppercase tracking-widest text-[10px] text-stone-400 italic">
                            Validando Cosecha...
                        </p>
                    </div>
                </div>
            )}
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
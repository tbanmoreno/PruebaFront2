import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Coffee, Lock, Mail, Loader2, ArrowLeft, UserPlus } from 'lucide-react';

const Login = () => {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login({ correo, contrasena });
            navigate('/'); 
        } catch (error) {
            console.error("Error de autenticación:", error);
            alert("Error de acceso: Verifica tus credenciales.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 relative">
            <div className="w-full max-w-md z-10">
                <Link to="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-800 transition-colors mb-8 font-bold text-xs uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4" /> Volver a la vitrina
                </Link>

                <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-stone-100">
                    <div className="flex flex-col items-center mb-10">
                        <div className="bg-stone-900 p-4 rounded-2xl mb-6 shadow-xl shadow-amber-900/20">
                            <Coffee className="w-8 h-8 text-amber-500" />
                        </div>
                        <h2 className="text-3xl font-black text-stone-800 uppercase text-center tracking-tighter italic">Valenci</h2>
                        <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Bienvenido de vuelta</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                            <input 
                                type="email" 
                                required
                                placeholder="Correo electrónico" 
                                className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none focus:border-amber-500 transition-all font-bold text-stone-800"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                            <input 
                                type="password" 
                                required
                                placeholder="Contraseña" 
                                className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none focus:border-amber-500 transition-all font-bold text-stone-800"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-stone-900 text-amber-500 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-600 hover:text-stone-950 transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-900/10"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar a la Cosecha'}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-stone-50 text-center">
                        <p className="text-stone-400 text-xs font-bold mb-4 italic">¿Eres nuevo en la red Valenci?</p>
                        <Link 
                            to="/register" 
                            className="inline-flex items-center gap-2 text-stone-800 hover:text-amber-800 font-black text-xs uppercase tracking-widest transition-colors group"
                        >
                            <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Crea tu cuenta aquí
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
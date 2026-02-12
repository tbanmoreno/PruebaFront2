import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Coffee, Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';

const Login = () => {
    // Sincronizamos los nombres de estado con el DTO del Backend
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Enviamos el objeto con las llaves 'correo' y 'contrasena'
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
                        <div className="bg-stone-900 p-4 rounded-2xl mb-6">
                            <Coffee className="w-8 h-8 text-amber-500" />
                        </div>
                        <h2 className="text-3xl font-black text-stone-800 uppercase text-center">Valenci</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                            <input 
                                type="email" 
                                required
                                placeholder="Correo electrónico" 
                                className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none focus:border-amber-500 transition-all"
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
                                className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none focus:border-amber-500 transition-all"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-stone-900 text-amber-500 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-600 hover:text-stone-950 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar a la Cosecha'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
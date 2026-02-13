import { useState } from 'react';
import api from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import { notify } from '../utils/alerts';
import { Coffee, User, Mail, Lock, Loader2, ArrowLeft, MapPin } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        contrasena: '',
        direccionEnvio: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // El backend asume por defecto que son 'CLIENTE' si se registran aquí
            await api.post('/auth/register', formData);
            notify.success("¡Bienvenido!", "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.");
            navigate('/login');
        } catch (error) {
            console.error("Error de registro:", error);
            notify.error("Error", error.response?.data?.message || "No se pudo crear la cuenta.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 relative">
            <div className="w-full max-w-md z-10">
                <Link to="/login" className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-800 transition-colors mb-8 font-bold text-xs uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4" /> Ya tengo una cuenta
                </Link>

                <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-stone-100">
                    <div className="flex flex-col items-center mb-8">
                        <div className="bg-amber-600 p-4 rounded-2xl mb-4 shadow-xl shadow-amber-900/20">
                            <User className="w-8 h-8 text-stone-900" />
                        </div>
                        <h2 className="text-3xl font-black text-stone-800 uppercase tracking-tighter italic">Únete a la Red</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                            <input 
                                type="text" required placeholder="Nombre completo" 
                                className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none focus:border-amber-500 transition-all font-bold text-stone-800"
                                value={formData.nombre}
                                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                            <input 
                                type="email" required placeholder="Correo electrónico" 
                                className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none focus:border-amber-500 transition-all font-bold text-stone-800"
                                value={formData.correo}
                                onChange={(e) => setFormData({...formData, correo: e.target.value})}
                            />
                        </div>

                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                            <input 
                                type="text" required placeholder="Dirección de envío" 
                                className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none focus:border-amber-500 transition-all font-bold text-stone-800"
                                value={formData.direccionEnvio}
                                onChange={(e) => setFormData({...formData, direccionEnvio: e.target.value})}
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                            <input 
                                type="password" required placeholder="Contraseña segura" 
                                className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none focus:border-amber-500 transition-all font-bold text-stone-800"
                                value={formData.contrasena}
                                onChange={(e) => setFormData({...formData, contrasena: e.target.value})}
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-stone-900 text-amber-500 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-600 hover:text-stone-950 transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-900/10"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrar Cuenta'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
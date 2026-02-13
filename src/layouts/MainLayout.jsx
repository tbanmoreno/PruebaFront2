import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const MainLayout = () => {
  const { loading } = useAuth();

  // Si el AuthContext aún está validando el token en localStorage, 
  // mostramos una pantalla de transición limpia para evitar saltos de UI.
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stone-200" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* El Navbar es inteligente: detectará si el usuario es Admin o Cliente 
          gracias a que está envuelto en el AuthProvider en App.jsx */}
      <Navbar />
      
      <main className="flex-grow">
        {/* Transición suave entre vistas de la tienda o perfil */}
        <div className="animate-in fade-in duration-700">
          <Outlet />
        </div>
      </main>

      {/* Footer Valenci: Diseño de alta gama con enfoque en el origen */}
      <footer className="bg-stone-950 text-stone-600 border-t border-stone-900 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          
          <div className="flex flex-col items-center md:items-start gap-3">
             <span className="font-black text-2xl tracking-tighter uppercase text-stone-200 italic">Valenci</span>
             <div className="flex flex-col gap-1">
               <p className="text-[9px] font-black tracking-[0.3em] uppercase opacity-50 text-center md:text-left">
                 Cosecha de Origen — Premium Coffee
               </p>
               <p className="text-[8px] font-bold tracking-[0.1em] uppercase opacity-30 text-center md:text-left">
                 Támesis, Antioquia — Colombia
               </p>
             </div>
          </div>
          
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-amber-500 transition-colors duration-300">Variedades</a>
            <a href="#" className="hover:text-amber-500 transition-colors duration-300">Sostenibilidad</a>
            <a href="#" className="hover:text-amber-500 transition-colors duration-300">Contacto</a>
          </div>

          <div className="text-center md:text-right">
            <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-20">
              © 2026 VALENCI APP — ALL RIGHTS RESERVED
            </p>
            <p className="text-[7px] font-bold uppercase tracking-[0.2em] opacity-10 mt-1">
              Desarrollado para el Tostadero Central
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    /* Eliminamos el bg-stone-50 global para que cada página maneje su atmósfera */
    <div className="min-h-screen flex flex-col bg-white">
      {/* El Navbar ahora es sticky, por lo que no tapa el contenido */}
      <Navbar />
      
      <main className="flex-grow">
        {/* Usamos una transición suave entre páginas */}
        <div className="animate-in fade-in duration-500">
          <Outlet />
        </div>
      </main>

      <footer className="bg-stone-950 text-stone-600 border-t border-stone-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
             <span className="font-black text-xl tracking-tighter uppercase text-stone-400">Valenci</span>
             <p className="text-[9px] font-black tracking-[0.2em] uppercase opacity-50 text-center md:text-left">
               Támesis, Antioquia — Colombia
             </p>
          </div>
          
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
            <a href="#" className="hover:text-amber-500 transition-colors">Origen</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Sostenibilidad</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Contacto</a>
          </div>

          <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">
            © 2026 VALENCI APP — ALL RIGHTS RESERVED
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
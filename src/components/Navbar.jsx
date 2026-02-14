import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { notify } from '../utils/alerts';
import { Coffee, User, LogOut, ShieldCheck, ShoppingCart, UserCircle, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { logout, isAdmin, isAuthenticated, user } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    const result = await notify.confirm("¿Deseas salir?", "Tu sesión se cerrará de forma segura.", "Cerrar Sesión");
    if (result.isConfirmed) {
      logout();
      navigate('/login');
    }
  };

  return (
    <nav className="sticky top-0 w-full z-[100] bg-stone-900/95 backdrop-blur-md text-stone-100 py-4 px-4 md:px-6 border-b border-stone-800 shadow-xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 md:gap-3 group transition-transform active:scale-95">
          <div className="bg-amber-600 p-1.5 md:p-2 rounded-xl group-hover:bg-amber-500 transition-all shadow-lg shadow-amber-900/40">
            <Coffee className="w-5 h-5 md:w-6 md:h-6 text-stone-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg md:text-2xl tracking-tighter uppercase italic leading-none">Valenci</span>
            <span className="text-[7px] md:text-[8px] font-black tracking-[0.3em] uppercase text-amber-500 opacity-80">Premium Coffee</span>
          </div>
        </Link>

        {/* CONTROLES DERECHA */}
        <div className="flex items-center gap-2 md:gap-6">
          
          <Link to="/cart" className="relative p-2 hover:text-amber-500 transition-all">
            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-stone-950 text-[9px] font-black w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full border-2 border-stone-900 animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </Link>

          {/* BOTÓN MENÚ MÓVIL */}
          <button 
            className="md:hidden p-2 text-stone-400 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>

          {/* MENÚ DESKTOP */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8 border-l border-stone-800 pl-6">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="flex bg-amber-600 text-stone-950 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-amber-500 transition-all">
                    <ShieldCheck className="w-4 h-4 mr-1 inline" /> Panel Admin
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <div className="hidden lg:flex flex-col items-end text-right">
                    <span className="text-[9px] font-black uppercase text-stone-500 tracking-widest">Bienvenido</span>
                    <span className="text-xs font-bold text-amber-500">{user?.nombre?.split(' ')[0]}</span>
                  </div>
                  <Link to="/perfil/historial" className="p-2 bg-stone-800 hover:bg-amber-600 hover:text-stone-900 rounded-2xl transition-all border border-stone-700">
                    <User className="w-5 h-5" />
                  </Link>
                </div>
                <button onClick={handleLogout} className="text-stone-500 hover:text-red-400 transition-colors p-2" title="Cerrar Sesión">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-2 bg-amber-600 text-stone-950 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-500 transition-all active:scale-95 shadow-xl shadow-amber-900/40">
                <UserCircle className="w-4 h-4" /> Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-stone-900 border-b border-stone-800 p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 pb-4 border-b border-stone-800">
                <div className="bg-amber-600 p-2 rounded-full text-stone-950"><User className="w-5 h-5" /></div>
                <span className="font-bold text-amber-500">{user?.nombre}</span>
              </div>
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-stone-300 font-bold uppercase text-xs tracking-widest p-2">
                  <ShieldCheck className="w-4 h-4" /> Panel de Control
                </Link>
              )}
              <Link to="/perfil/historial" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-stone-300 font-bold uppercase text-xs tracking-widest p-2">
                <User className="w-4 h-4" /> Mi Perfil y Compras
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 font-bold uppercase text-xs tracking-widest p-2 mt-4">
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="bg-amber-600 text-stone-950 text-center py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">
              Iniciar Sesión
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
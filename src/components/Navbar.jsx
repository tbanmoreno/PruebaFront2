import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { notify } from '../utils/alerts'; // Importación de SweetAlert2
import { Coffee, User, LogOut, ShieldCheck, ShoppingCart, UserCircle } from 'lucide-react';

const Navbar = () => {
  const { logout, isAdmin, isAuthenticated, user } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await notify.confirm(
      "¿Deseas salir?",
      "Tu sesión se cerrará de forma segura.",
      "Cerrar Sesión"
    );

    if (result.isConfirmed) {
      logout();
      navigate('/login');
    }
  };

  return (
    <nav className="sticky top-0 w-full z-[100] bg-stone-900/95 backdrop-blur-md text-stone-100 py-4 px-6 border-b border-stone-800 shadow-xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        <Link to="/" className="flex items-center gap-3 group transition-transform active:scale-95">
          <div className="bg-amber-600 p-2 rounded-xl group-hover:bg-amber-500 transition-all shadow-lg shadow-amber-900/40">
            <Coffee className="w-6 h-6 text-stone-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter uppercase italic leading-none">Valenci</span>
            <span className="text-[8px] font-black tracking-[0.3em] uppercase text-amber-500 opacity-80">Premium Coffee</span>
          </div>
        </Link>

        <div className="flex items-center gap-4 md:gap-8">
          
          <Link to="/cart" className="relative p-2 hover:text-amber-500 transition-all group">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-stone-900 animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 md:gap-6 border-l border-stone-800 pl-6">
              
              {isAdmin && (
                <Link to="/admin" className="hidden md:flex bg-amber-600 text-stone-950 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-amber-500 transition-all shadow-md">
                  <ShieldCheck className="w-4 h-4 mr-1 inline" /> Panel Admin
                </Link>
              )}
              
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase text-stone-500 tracking-widest">Bienvenido</span>
                  <span className="text-xs font-bold text-amber-500">{user?.nombre?.split(' ')[0]}</span>
                </div>
                <Link to="/perfil/historial" className="p-2 bg-stone-800 hover:bg-amber-600 hover:text-stone-900 rounded-2xl transition-all shadow-inner border border-stone-700">
                  <User className="w-5 h-5" />
                </Link>
              </div>

              <button 
                onClick={handleLogout} 
                className="text-stone-500 hover:text-red-400 transition-colors p-2"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center gap-2 bg-amber-600 text-stone-950 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-500 transition-all active:scale-95 shadow-xl shadow-amber-900/40"
            >
              <UserCircle className="w-4 h-4" />
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
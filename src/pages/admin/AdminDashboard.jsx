import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notify } from '../../utils/alerts';
import { 
  Package, Users, Coffee, LayoutDashboard, ChevronRight, 
  BarChart3, FileText, LogOut, Truck, Menu, X 
} from 'lucide-react';
import { useState } from 'react';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Panel Principal', path: '/admin', icon: BarChart3 },
    { name: 'Productos', path: '/admin/productos', icon: Coffee },
    { name: 'Pedidos', path: '/admin/pedidos', icon: Package },
    { name: 'Facturas', path: '/admin/facturas', icon: FileText }, 
    { name: 'Clientes', path: '/admin/clientes', icon: Users },
    { name: 'Proveedores', path: '/admin/proveedores', icon: Truck },
  ];

  const handleLogout = async () => {
    const result = await notify.confirm("Finalizar Sesión", "¿Deseas cerrar el panel administrativo?", "Cerrar Sesión");
    if (result.isConfirmed) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-stone-100">
      
      {/* HEADER MÓVIL */}
      <header className="md:hidden bg-stone-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500 p-1.5 rounded-lg"><LayoutDashboard className="text-stone-950 w-4 h-4" /></div>
          <span className="font-black uppercase tracking-tighter text-sm italic">Valenci Admin</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-stone-800 rounded-xl active:scale-90 transition-transform">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* SIDEBAR ADAPTATIVO */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-stone-900 text-stone-300 p-6 flex flex-col gap-8 transition-transform duration-300 ease-in-out shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:sticky md:top-0 md:h-screen'}
      `}>
        {/* Logo Desktop */}
        <div className="hidden md:flex items-center gap-3 text-white border-b border-stone-800 pb-6">
          <div className="bg-amber-500 p-2 rounded-lg shadow-lg shadow-amber-500/20">
            <LayoutDashboard className="w-6 h-6 text-stone-900" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic">Valenci Admin</span>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = item.path === '/admin' 
              ? location.pathname === '/admin' 
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)} // Cierra sidebar en móvil al navegar
                className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-amber-800 text-white shadow-lg translate-x-2' 
                    : 'hover:bg-stone-800 hover:text-white opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : ''}`} />
                  <span className="font-bold text-sm uppercase tracking-widest">{item.name}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'opacity-100 rotate-90' : 'opacity-0'}`} />
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="mt-auto pt-6 border-t border-stone-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-black uppercase text-xs tracking-widest group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            Cerrar Sesión
          </button>
          <p className="text-[8px] font-black text-stone-600 uppercase tracking-[0.3em] text-center mt-6">Valenci App v1.0.4</p>
        </div>
      </aside>

      {/* OVERLAY PARA CERRAR SIDEBAR EN MÓVIL */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* CONTENIDO HIJO (Inyectado por React Router) */}
      <main className="flex-1 p-4 md:p-10 min-h-screen overflow-x-hidden">
        <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
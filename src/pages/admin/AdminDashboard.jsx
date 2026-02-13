import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notify } from '../../utils/alerts'; // Importación de SweetAlert2
import { 
  Package, 
  Users, 
  Coffee, 
  LayoutDashboard, 
  ChevronRight, 
  BarChart3, 
  FileText,
  LogOut,
  Truck 
} from 'lucide-react';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Panel Principal', path: '/admin', icon: BarChart3 },
    { name: 'Productos', path: '/admin/productos', icon: Coffee },
    { name: 'Pedidos', path: '/admin/pedidos', icon: Package },
    { name: 'Facturas', path: '/admin/facturas', icon: FileText }, 
    { name: 'Clientes', path: '/admin/clientes', icon: Users },
    { name: 'Proveedores', path: '/admin/proveedores', icon: Truck },
  ];

  const handleLogout = async () => {
    const result = await notify.confirm(
      "Finalizar Sesión",
      "¿Deseas cerrar la sesión administrativa del tostadero?",
      "Cerrar Sesión"
    );

    if (result.isConfirmed) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-100">
      <aside className="w-64 bg-stone-900 text-stone-300 p-6 flex flex-col gap-8 fixed h-full shadow-2xl z-20">
        <div className="flex items-center gap-3 text-white border-b border-stone-800 pb-6">
          <div className="bg-amber-500 p-2 rounded-lg shadow-lg shadow-amber-500/20">
            <LayoutDashboard className="w-6 h-6 text-stone-900" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase">Valenci Admin</span>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {menuItems.map((item) => {
            const isActive = item.path === '/admin' 
              ? location.pathname === '/admin' 
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-amber-800 text-white shadow-lg translate-x-2' 
                    : 'hover:bg-stone-800 hover:text-white opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : ''}`} />
                  <span className="font-bold text-sm">{item.name}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'opacity-100 rotate-90' : 'opacity-30'}`} />
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 font-bold text-sm group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Cerrar Sesión
          </button>
          
          <div className="pt-6 border-t border-stone-800">
            <p className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] text-center">
              Valenci System v1.0.4
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-10 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
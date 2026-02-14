import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { notify } from '../../utils/alerts';
import { 
  DollarSign, Package, AlertTriangle, 
  Coffee, Loader2, Bell, Plus 
} from 'lucide-react';
import Swal from 'sweetalert2';

const StatCard = ({ label, value, icon: Icon, color, subValue }) => (
  <div className={`${color} p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl relative overflow-hidden group transition-all duration-300`}>
    <Icon className="absolute -right-2 -bottom-2 md:-right-4 md:-bottom-4 w-24 h-24 md:w-32 md:h-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">{label}</p>
    <div className="flex items-baseline gap-2">
      <p className="text-3xl md:text-4xl font-black tracking-tighter">{value || 0}</p>
      {subValue && <span className="text-[9px] md:text-[10px] font-bold opacity-60 italic">{subValue}</span>}
    </div>
  </div>
);

const DashboardHome = () => {
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await api.get('/dashboard/resumen')).data
  });

  useEffect(() => {
    if (stats?.pedidosPorEstado?.PENDIENTE > 0) {
      notify.success(
        "Atención Operativa", 
        `Hay ${stats.pedidosPorEstado.PENDIENTE} pedidos esperando molienda.`
      );
    }
  }, [stats?.pedidosPorEstado?.PENDIENTE]);

  const stockMutation = useMutation({
    mutationFn: ({ id, nuevaCantidad }) => api.patch(`/productos/${id}/stock`, { cantidad: nuevaCantidad }),
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboard-stats']);
      notify.success("Stock Sincronizado", "El inventario ha sido reabastecido.");
    }
  });

  const handleAbastecer = async (id, nombre, cantidadActual) => {
    const { value: adicion } = await Swal.fire({
      title: `<span className="font-black uppercase tracking-tighter text-lg md:text-xl">Abastecer Variedad</span>`,
      text: `¿Cantidad a sumar para "${nombre}"?`,
      input: 'number',
      showCancelButton: true,
      confirmButtonText: 'Cargar',
      customClass: {
        confirmButton: 'bg-stone-900 text-amber-500 px-6 py-2 rounded-xl font-black uppercase text-xs mx-2',
        cancelButton: 'bg-stone-100 text-stone-50 px-6 py-2 rounded-xl font-black uppercase text-xs mx-2',
        popup: 'rounded-[2.5rem]'
      },
      buttonsStyling: false
    });
    
    if (adicion) {
      stockMutation.mutate({ id, nuevaCantidad: parseInt(cantidadActual) + parseInt(adicion) });
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20">
       <Loader2 className="w-10 h-10 text-amber-800 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-1000 px-2 md:px-0">
      <header className="flex flex-col gap-1 text-center md:text-left">
        <h2 className="text-4xl md:text-5xl font-black text-stone-800 tracking-tighter italic uppercase">Resumen de Cosecha</h2>
        <p className="text-stone-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">Métricas de Rendimiento Valenci</p>
      </header>

      {/* GRID DE ESTADÍSTICAS RESPONSIVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        <StatCard 
          label="Ingresos Totales" 
          value={`$${stats?.ventasTotales?.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-stone-900 text-amber-500" 
        />
        <StatCard 
          label="Órdenes Totales" 
          value={stats?.totalPedidos} 
          subValue={`${stats?.pedidosPorEstado?.PENDIENTE || 0} pendientes`}
          icon={Bell} 
          color={stats?.pedidosPorEstado?.PENDIENTE > 0 ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-800"} 
        />
        <StatCard 
          label="Stock Crítico" 
          value={stats?.productosStockCritico?.length} 
          icon={AlertTriangle} 
          color="bg-orange-50 text-orange-900 border border-orange-100" 
        />
      </div>

      <section className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 border border-stone-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8 text-center md:text-left">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl md:rounded-[1.5rem]"><Coffee className="w-6 h-6" /></div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-stone-800 uppercase tracking-tight">Alertas de Inventario</h3>
            <p className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest italic">Variedades por debajo de 15 unidades</p>
          </div>
        </div>

        <div className="grid gap-4">
          {stats?.productosStockCritico?.map(prod => (
            <div key={prod.id} className="flex flex-col sm:flex-row items-center justify-between p-5 md:p-6 bg-stone-50 rounded-[1.5rem] md:rounded-[2rem] hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-orange-100 gap-4">
              <div className="text-center sm:text-left">
                <span className="font-black text-stone-800 text-lg md:text-xl tracking-tighter uppercase italic">{prod.nombre}</span>
                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">SKU: {prod.id}</p>
              </div>

              <div className="flex items-center gap-6 md:gap-10">
                <div className="text-right">
                  <p className="text-xl md:text-2xl font-black text-orange-700 tracking-tighter">{prod.cantidad} uds</p>
                </div>
                <button 
                  onClick={() => handleAbastecer(prod.id, prod.nombre, prod.cantidad)}
                  className="bg-stone-900 text-amber-500 p-4 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 hover:text-stone-950 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> <span className="hidden md:inline">Abastecer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;
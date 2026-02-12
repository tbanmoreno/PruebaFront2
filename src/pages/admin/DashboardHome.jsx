import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { DollarSign, Package, AlertTriangle, Coffee, Loader2 } from 'lucide-react';

/**
 * StatCard: Sub-componente para métricas principales con diseño Luxury Coffee.
 * Implementa efectos de escalado en grupo y posicionamiento absoluto de iconos.
 */
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className={`${color} p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group transition-all duration-300`}>
    <Icon className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">{label}</p>
    <p className="text-4xl font-black tracking-tighter">{value || 0}</p>
  </div>
);

const DashboardHome = () => {
  const queryClient = useQueryClient();

  // 1. OBTENCIÓN DE DATOS (Queries)
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await api.get('/dashboard/resumen')).data
  });

  // 2. LÓGICA DE ACTUALIZACIÓN (Mutations)
  // Utilizamos PATCH para actualizar solo el campo de cantidad
  const stockMutation = useMutation({
    mutationFn: ({ id, nuevaCantidad }) => api.patch(`/productos/${id}/stock`, { cantidad: nuevaCantidad }),
    onSuccess: () => {
      // Invalida la caché para refrescar Stat Cards y Alertas de Inventario simultáneamente
      queryClient.invalidateQueries(['dashboard-stats']);
    },
    onError: (error) => {
      alert("Error al actualizar el inventario: " + (error.response?.data?.message || "Fallo de conexión"));
    }
  });

  /**
   * handleAbastecer: Lógica interactiva para el botón.
   * Solicita la cantidad adicional y dispara la mutación.
   */
  const handleAbastecer = (id, nombre, cantidadActual) => {
    const adicion = prompt(`¿Cuántas unidades de "${nombre}" deseas añadir al inventario actual (${cantidadActual})?`);
    
    if (adicion !== null && adicion !== "" && !isNaN(adicion)) {
      const nuevaCantidad = parseInt(cantidadActual) + parseInt(adicion);
      
      if (nuevaCantidad < 0) {
        alert("La cantidad total no puede ser negativa.");
        return;
      }

      stockMutation.mutate({ id, nuevaCantidad });
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
       <Loader2 className="w-12 h-12 text-amber-800 animate-spin" />
       <div className="text-stone-400 font-black uppercase tracking-widest text-xs">Moliendo datos frescos...</div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col gap-1">
        <h2 className="text-5xl font-black text-stone-800 tracking-tighter">Resumen de Cosecha</h2>
        <p className="text-stone-400 font-bold uppercase tracking-[0.3em] text-xs">Panel de Analíticas y Control Operativo</p>
      </header>

      {/* SECCIÓN DE MÉTRICAS (STAT CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          label="Ingresos Totales" 
          value={`$${stats?.ventasTotales?.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-amber-800 text-white" 
        />
        <StatCard 
          label="Pedidos Procesados" 
          value={stats?.totalPedidos} 
          icon={Package} 
          color="bg-stone-900 text-amber-400" 
        />
        <StatCard 
          label="Productos en Alerta" 
          value={stats?.productosStockCritico?.length} 
          icon={AlertTriangle} 
          color="bg-orange-100 text-orange-900" 
        />
      </div>

      {/* SECCIÓN DE ALERTAS DE INVENTARIO (LISTA DINÁMICA) */}
      <section className="bg-white rounded-[3rem] p-10 border border-stone-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl shadow-inner">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-stone-800">Alertas de Inventario</h3>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Productos con menos de 15 unidades</p>
          </div>
        </div>

        <div className="grid gap-4">
          {stats?.productosStockCritico?.length > 0 ? (
            stats.productosStockCritico.map(prod => (
              <div 
                key={prod.id} 
                className="flex items-center justify-between p-6 bg-stone-50 rounded-[2rem] hover:bg-orange-50/50 transition-all duration-300 border border-transparent hover:border-orange-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="font-black text-stone-800 text-lg leading-tight group-hover:text-orange-900 transition-colors">
                        {prod.nombre}
                    </span>
                    <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded-full border border-stone-200 text-stone-400 uppercase w-fit mt-1 shadow-sm">
                        REF: {prod.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-0.5">Disponibilidad</p>
                    <p className="text-xl font-black text-orange-700">
                        {prod.cantidad} <span className="text-[10px] text-orange-400 uppercase ml-1">uds</span>
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handleAbastecer(prod.id, prod.nombre, prod.cantidad)}
                    disabled={stockMutation.isPending}
                    className="bg-stone-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-amber-900/20 flex items-center gap-2"
                  >
                    {stockMutation.isPending && stockMutation.variables?.id === prod.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : null}
                    Abastecer
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-stone-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-stone-100">
               <Package className="w-12 h-12 text-stone-200 mx-auto mb-4" />
               <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Invernadero Completo. No hay alertas de stock.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;
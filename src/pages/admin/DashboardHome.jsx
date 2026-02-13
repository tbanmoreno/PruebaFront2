import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { notify } from '../../utils/alerts';
import { 
  DollarSign, 
  Package, 
  AlertTriangle, 
  Coffee, 
  Loader2, 
  Bell, 
  Plus // <--- SE AÑADIÓ ESTA IMPORTACIÓN QUE FALTABA
} from 'lucide-react';
import Swal from 'sweetalert2';

const StatCard = ({ label, value, icon: Icon, color, subValue }) => (
  <div className={`${color} p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group transition-all duration-300`}>
    <Icon className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">{label}</p>
    <div className="flex items-baseline gap-2">
      <p className="text-4xl font-black tracking-tighter">{value || 0}</p>
      {subValue && <span className="text-[10px] font-bold opacity-60 italic">{subValue}</span>}
    </div>
  </div>
);

const DashboardHome = () => {
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await api.get('/dashboard/resumen')).data
  });

  // Alerta proactiva al detectar pedidos pendientes
  useEffect(() => {
    if (stats?.pedidosPendientes > 0) {
      notify.success(
        "Atención Operativa", 
        `Hay ${stats.pedidosPendientes} pedidos esperando ser procesados.`
      );
    }
  }, [stats?.pedidosPendientes]);

  const stockMutation = useMutation({
    mutationFn: ({ id, nuevaCantidad }) => api.patch(`/productos/${id}/stock`, { cantidad: nuevaCantidad }),
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboard-stats']);
      notify.success("Stock Actualizado", "El inventario ha sido reabastecido correctamente.");
    },
    onError: (error) => {
      notify.error("Fallo de Inventario", error.response?.data?.message || "No se pudo actualizar.");
    }
  });

  const handleAbastecer = async (id, nombre, cantidadActual) => {
    const { value: adicion } = await Swal.fire({
      title: `<span className="font-black uppercase tracking-tighter">Abastecer Variedad</span>`,
      text: `¿Cuántas unidades de "${nombre}" deseas sumar al stock actual (${cantidadActual})?`,
      input: 'number',
      inputPlaceholder: 'Cantidad a sumar...',
      showCancelButton: true,
      confirmButtonText: 'Confirmar Carga',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'bg-stone-900 text-amber-500 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs ml-3',
        cancelButton: 'bg-stone-100 text-stone-500 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs',
        popup: 'rounded-[3rem]',
        input: 'rounded-2xl border-stone-100 font-bold text-center'
      },
      buttonsStyling: false
    });
    
    if (adicion) {
      const nuevaCantidad = parseInt(cantidadActual) + parseInt(adicion);
      if (nuevaCantidad < 0) return notify.error("Error", "El stock resultante no puede ser negativo.");
      stockMutation.mutate({ id, nuevaCantidad });
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
       <Loader2 className="w-12 h-12 text-amber-800 animate-spin" />
       <div className="text-stone-400 font-black uppercase tracking-widest text-xs">Sincronizando molienda de datos...</div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col gap-1">
        <h2 className="text-5xl font-black text-stone-800 tracking-tighter italic uppercase">Resumen de Cosecha</h2>
        <p className="text-stone-400 font-bold uppercase tracking-[0.3em] text-xs ml-1">Panel de Control y Analíticas Valenci</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          label="Ingresos Totales" 
          value={`$${stats?.ventasTotales?.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-stone-900 text-amber-500 shadow-amber-900/20" 
        />
        <StatCard 
          label="Gestión de Pedidos" 
          value={stats?.totalPedidos} 
          subValue={`${stats?.pedidosPendientes || 0} pendientes`}
          icon={Bell} 
          color={stats?.pedidosPendientes > 0 ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-800"} 
        />
        <StatCard 
          label="Variedades Críticas" 
          value={stats?.productosStockCritico?.length} 
          icon={AlertTriangle} 
          color="bg-orange-50 text-orange-900 border border-orange-100" 
        />
      </div>

      <section className="bg-white rounded-[3rem] p-10 border border-stone-100 shadow-sm transition-all hover:shadow-xl">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-[1.5rem] shadow-inner">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-stone-800 tracking-tight">Alertas de Inventario</h3>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest italic">Existencias por debajo del umbral de seguridad (15 uds)</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {stats?.productosStockCritico?.length > 0 ? (
            stats.productosStockCritico.map(prod => (
              <div 
                key={prod.id} 
                className="flex items-center justify-between p-6 bg-stone-50 rounded-[2rem] hover:bg-white hover:shadow-lg transition-all duration-500 border border-transparent hover:border-orange-100 group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="font-black text-stone-800 text-xl tracking-tighter uppercase italic group-hover:text-orange-900 transition-colors">
                        {prod.nombre}
                    </span>
                    <span className="text-[9px] font-black bg-stone-200/50 px-3 py-1 rounded-full text-stone-500 uppercase w-fit mt-1 tracking-widest">
                        SKU: {prod.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Stock Actual</p>
                    <p className="text-2xl font-black text-orange-700 tracking-tighter">
                        {prod.cantidad} <span className="text-xs text-orange-300 uppercase ml-1">unidades</span>
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handleAbastecer(prod.id, prod.nombre, prod.cantidad)}
                    disabled={stockMutation.isPending}
                    className="bg-stone-900 text-amber-500 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 hover:text-stone-950 transition-all shadow-lg flex items-center gap-3 disabled:opacity-50"
                  >
                    {stockMutation.isPending && stockMutation.variables?.id === prod.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : <Plus className="w-4 h-4" />}
                    Abastecer
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-stone-50 rounded-[2.5rem] p-20 text-center border-2 border-dashed border-stone-100">
               <Package className="w-16 h-16 text-stone-200 mx-auto mb-4 opacity-50" />
               <p className="text-stone-400 font-black uppercase tracking-[0.2em] text-[10px]">Inventario Sincronizado. Sin alertas de origen.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;
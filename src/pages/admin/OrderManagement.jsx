import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { notify } from '../../utils/alerts'; 
import { Loader2, Package, Calendar, ChevronDown, FileText, ShoppingBag, User } from 'lucide-react';
import { generateInvoiceHTML } from '../../utils/invoiceGenerator';

const OrderManagement = () => {
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. CARGA DE DATOS (Asegurando JOIN FETCH desde el backend)
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => (await api.get('/pedidos')).data
  });

  // 2. MUTACIÓN DE ESTADO
  const statusMutation = useMutation({
    mutationFn: ({ id, nuevoEstado }) => api.patch(`/pedidos/${id}/estado`, { nuevoEstado }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      queryClient.invalidateQueries(['dashboard-stats']);
      notify.success("¡Estado Actualizado!", "El flujo del pedido ha sido sincronizado en la base de datos.");
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Fallo de conexión al actualizar estado.";
      notify.error("Error de Gestión", msg);
    }
  });

  // 3. GENERACIÓN DE FACTURA (Basado en el nuevo endpoint del Backend)
  const handleDownloadInvoice = async (order) => {
    if (order.estadoPedido !== 'PAGADO' && order.estadoPedido !== 'ENTREGADO' && order.estadoPedido !== 'ENVIADO') {
      return notify.error(
        "Factura No Disponible", 
        "El pedido debe estar PAGADO para generar el comprobante legal."
      );
    }

    setIsGenerating(true);
    try {
      const response = await api.get(`/facturas/pedido/${order.idPedido}`);
      generateInvoiceHTML(response.data);
      notify.success("Documento Generado", "La factura se ha generado correctamente.");
    } catch (err) {
      notify.error(
        "Error 404", 
        "No se encontró la factura física. Asegúrate de que el pedido esté en estado PAGADO."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="animate-spin text-amber-800 w-12 h-12" />
      <p className="text-stone-400 font-black uppercase tracking-widest text-xs italic animate-pulse">
        Sincronizando operaciones Valenci...
      </p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER ADAPTATIVO */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 px-4 text-center md:text-left">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tighter uppercase italic">Gestión de Pedidos</h2>
          <p className="text-stone-400 font-bold text-sm uppercase tracking-widest">Control de logística y facturación oficial</p>
        </div>
      </div>
      
      {/* CONTENEDOR DE ÓRDENES */}
      <div className="grid gap-4 md:gap-6">
        {orders?.map(order => (
          <div key={order.idPedido} className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden hover:border-amber-400 transition-all duration-300 group">
            
            {/* CABECERA DE TARJETA (Responsive Grid) */}
            <div className="p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8">
              
              {/* Info Principal */}
              <div className="flex items-center gap-4 md:gap-6 w-full lg:w-auto">
                <div className="bg-amber-50 p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] text-amber-800 shadow-inner group-hover:bg-amber-800 group-hover:text-white transition-colors duration-500">
                  <Package className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] md:text-[10px] font-black text-stone-300 uppercase mb-0.5 md:mb-1 tracking-widest">Orden #{order.idPedido}</p>
                  <h4 className="font-black text-xl md:text-2xl text-stone-800 tracking-tighter uppercase italic leading-tight">
                    {order.nombreCliente}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] md:text-sm font-bold text-stone-400 mt-1 md:mt-2">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 text-amber-700" /> 
                    {new Date(order.fechaPedido).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Status y Monto (Horizontal en móviles, integrado en desktop) */}
              <div className="flex flex-row md:flex-wrap items-center justify-between lg:justify-end gap-4 md:gap-8 w-full lg:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-stone-50">
                <div className="text-left lg:text-right">
                  <p className="text-[8px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-0.5 md:mb-1">Inversión</p>
                  <p className="text-xl md:text-3xl font-black text-amber-900 tracking-tighter">
                    ${order.totalPedido?.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 md:gap-3 bg-stone-50 p-2 md:p-3 rounded-xl md:rounded-2xl border border-stone-100 shadow-inner">
                  <select 
                    className="bg-transparent border-none text-[9px] md:text-[11px] font-black uppercase tracking-widest text-stone-700 outline-none cursor-pointer px-1 md:px-2"
                    value={order.estadoPedido}
                    disabled={statusMutation.isPending}
                    onChange={(e) => statusMutation.mutate({ id: order.idPedido, nuevoEstado: e.target.value })}
                  >
                    {['PENDIENTE', 'PAGADO', 'PROCESANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'].map(est => (
                        <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                  
                  <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full shadow-sm animate-pulse ${
                    order.estadoPedido === 'PAGADO' || order.estadoPedido === 'ENTREGADO' ? 'bg-green-500 shadow-green-200' : 
                    order.estadoPedido === 'CANCELADO' ? 'bg-red-500 shadow-red-200' : 'bg-amber-500 shadow-amber-200'
                  }`} />
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDownloadInvoice(order)}
                    className="p-3 md:p-4 bg-stone-900 text-amber-400 rounded-xl md:rounded-2xl hover:bg-amber-600 hover:text-stone-950 transition-all shadow-md active:scale-95 disabled:opacity-50"
                    title="Generar Factura"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <FileText className="w-4 h-4 md:w-5 md:h-5" />}
                  </button>

                  <button 
                    onClick={() => setExpandedOrder(expandedOrder === order.idPedido ? null : order.idPedido)}
                    className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all shadow-sm ${
                      expandedOrder === order.idPedido ? 'bg-amber-100 text-amber-900 rotate-180' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* DETALLES EXPANDIBLES (Mobile-Ready) */}
            {expandedOrder === order.idPedido && (
              <div className="bg-stone-50/50 border-t border-stone-100 p-6 md:p-10 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3 mb-6 text-stone-400">
                  <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]">Cosecha seleccionada</span>
                </div>
                
                <div className="max-w-4xl bg-white rounded-2xl md:rounded-[2rem] border border-stone-200 shadow-xl overflow-hidden mx-auto">
                   {/* Tabla Desktop / Stacked Mobile */}
                   <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse min-w-[500px]">
                          <thead className="bg-stone-900 font-black text-[9px] md:text-[10px] uppercase text-stone-400 tracking-widest border-b border-stone-800">
                            <tr>
                              <th className="p-4 md:p-6 text-amber-500">Variedad de Café</th>
                              <th className="p-4 md:p-6 text-center">Cant</th>
                              <th className="p-4 md:p-6 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-50">
                            {order.detalles?.map((det, i) => (
                              <tr key={i} className="hover:bg-amber-50/20 transition-colors text-[11px] md:text-xs">
                                <td className="p-4 md:p-6 font-black text-stone-800 uppercase italic">{det.nombreProducto}</td>
                                <td className="p-4 md:p-6 text-center font-bold text-stone-500">{det.cantidad} uds</td>
                                <td className="p-4 md:p-6 text-right font-black text-amber-900 tracking-tighter">${det.subtotal?.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                       </table>
                   </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderManagement;
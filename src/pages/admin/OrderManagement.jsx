import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { notify } from '../../utils/alerts'; // Integración de SweetAlert2
import { Loader2, Package, Calendar, ChevronDown, FileText, ShoppingBag } from 'lucide-react';
import { generateInvoiceHTML } from '../../utils/invoiceGenerator';

const OrderManagement = () => {
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => (await api.get('/pedidos')).data
  });

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

  const handleDownloadInvoice = async (order) => {
    // Validación preventiva local para mejorar UX
    if (order.estadoPedido !== 'PAGADO' && order.estadoPedido !== 'ENTREGADO') {
      return notify.error(
        "Factura No Disponible", 
        "Para generar el comprobante, el estado del pedido debe ser PAGADO o ENTREGADO."
      );
    }

    setIsGenerating(true);
    try {
      // Ahora este endpoint ya existe en el Backend corregido arriba
      const response = await api.get(`/facturas/pedido/${order.idPedido}`);
      generateInvoiceHTML(response.data);
      notify.success("Documento Generado", "La factura se ha generado correctamente.");
    } catch (err) {
      console.error("Error al obtener factura:", err.response);
      notify.error(
        "Error 404", 
        "No se encontró la factura física en el servidor. Asegúrate de que el pedido haya sido procesado correctamente."
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
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-stone-800 tracking-tighter uppercase italic">Gestión de Pedidos</h2>
          <p className="text-stone-400 font-bold text-sm uppercase tracking-widest">Control de logística y facturación oficial</p>
        </div>
      </div>
      
      <div className="grid gap-6">
        {orders?.map(order => (
          <div key={order.idPedido} className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden hover:border-amber-400 transition-all duration-300 group">
            <div className="p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
              
              <div className="flex items-center gap-6">
                <div className="bg-amber-50 p-5 rounded-[1.5rem] text-amber-800 shadow-inner group-hover:bg-amber-800 group-hover:text-white transition-colors duration-500">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-300 uppercase mb-1 tracking-widest">Orden #{order.idPedido}</p>
                  <h4 className="font-black text-2xl text-stone-800 tracking-tighter uppercase italic">
                    {order.nombreCliente}
                  </h4>
                  <div className="flex items-center gap-3 text-sm font-bold text-stone-400 mt-2">
                    <Calendar className="w-4 h-4 text-amber-700" /> 
                    {new Date(order.fechaPedido).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Inversión Total</p>
                  <p className="text-3xl font-black text-amber-900 tracking-tighter">
                    ${order.totalPedido?.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-2xl border border-stone-100 shadow-inner">
                  <select 
                    className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-stone-700 outline-none cursor-pointer px-2"
                    value={order.estadoPedido}
                    disabled={statusMutation.isPending}
                    onChange={(e) => statusMutation.mutate({ id: order.idPedido, nuevoEstado: e.target.value })}
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="PAGADO">Pagado</option>
                    <option value="PROCESANDO">Procesando</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="ENTREGADO">Entregado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                  
                  <div className={`w-3 h-3 rounded-full shadow-sm animate-pulse ${
                    order.estadoPedido === 'PAGADO' || order.estadoPedido === 'ENTREGADO' ? 'bg-green-500 shadow-green-200' : 
                    order.estadoPedido === 'CANCELADO' ? 'bg-red-500 shadow-red-200' : 'bg-amber-500 shadow-amber-200'
                  }`} />
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDownloadInvoice(order)}
                    className="p-4 bg-stone-900 text-amber-400 rounded-2xl hover:bg-amber-600 hover:text-stone-950 transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                  </button>

                  <button 
                    onClick={() => setExpandedOrder(expandedOrder === order.idPedido ? null : order.idPedido)}
                    className={`p-4 rounded-2xl transition-all shadow-sm ${
                      expandedOrder === order.idPedido ? 'bg-amber-100 text-amber-900 rotate-180' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {expandedOrder === order.idPedido && (
              <div className="bg-stone-50/50 border-t border-stone-100 p-10 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3 mb-6 text-stone-400">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em]">Resumen de productos seleccionados</span>
                </div>
                
                <div className="max-w-4xl bg-white rounded-[2rem] border border-stone-200 shadow-xl overflow-hidden mx-auto">
                   <table className="w-full text-left border-collapse">
                      <thead className="bg-stone-900 font-black text-[10px] uppercase text-stone-400 tracking-widest border-b border-stone-800">
                        <tr>
                          <th className="p-6">Variedad de Café</th>
                          <th className="p-6 text-center">Cantidad</th>
                          <th className="p-6 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {order.detalles?.map((det, i) => (
                          <tr key={i} className="hover:bg-amber-50/20 transition-colors text-xs">
                            <td className="p-6 font-black text-stone-800 uppercase">{det.nombreProducto}</td>
                            <td className="p-6 text-center font-bold text-stone-500">{det.cantidad} uds</td>
                            <td className="p-6 text-right font-black text-amber-900 tracking-tighter">${det.subtotal?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
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
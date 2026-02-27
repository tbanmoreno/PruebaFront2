import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { notify } from '../../utils/alerts'; 
import { Loader2, Package, Calendar, ChevronDown, FileText, ShoppingBag, AlertCircle } from 'lucide-react';
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
      notify.success("¡Sincronizado!", "Estado de cosecha actualizado.");
    },
    onError: (error) => {
      notify.error("Error", error.response?.data?.message || "Fallo al cambiar estado.");
    }
  });

  const handleDownloadInvoice = async (order) => {
    // Normalización de estados para evitar errores por mayúsculas/minúsculas
    const estado = order.estadoPedido?.toUpperCase();
    const estadosValidos = ['PAGADO', 'ENTREGADO', 'ENVIADO'];

    if (!estadosValidos.includes(estado)) {
      return notify.error(
        "Acción Bloqueada", 
        "El pedido debe estar PAGADO para generar el comprobante legal."
      );
    }

    setIsGenerating(true);
    try {
      // Ajustado a la ruta correcta /api/facturas/pedido/{id}
      const response = await api.get(`/facturas/pedido/${order.idPedido}`);
      generateInvoiceHTML(response.data);
      notify.success("Documento Listo", "Factura generada correctamente.");
    } catch (err) {
      notify.error("Error 404", "No se encontró factura vinculada a este pedido.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-40 space-y-4 text-stone-400 font-black uppercase tracking-widest text-xs">
      <Loader2 className="animate-spin text-amber-800 w-12 h-12" />
      <p>Sincronizando Logística...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-4 md:p-8">
      <header>
        <h2 className="text-4xl font-black text-stone-800 tracking-tighter uppercase italic">Logística de Pedidos</h2>
        <p className="text-stone-400 font-bold text-xs uppercase tracking-widest">Control de envíos y estados de pago</p>
      </header>
      
      <div className="grid gap-6">
        {orders?.map(order => (
          <div key={order.idPedido} className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden hover:border-amber-400 transition-all duration-300">
            <div className="p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
              
              <div className="flex items-center gap-6 w-full lg:w-auto">
                <div className="bg-stone-900 p-5 rounded-[1.5rem] text-amber-500">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Orden #{order.idPedido}</p>
                  <h4 className="font-black text-2xl text-stone-800 uppercase italic leading-tight">{order.nombreCliente}</h4>
                  <div className="flex items-center gap-2 text-sm font-bold text-stone-400 mt-2">
                    <Calendar className="w-4 h-4 text-amber-700" /> {new Date(order.fechaPedido).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-8 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0">
                <div className="text-right">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Monto</p>
                  <p className="text-3xl font-black text-amber-900 tracking-tighter">${(order.totalPedido || order.total).toLocaleString()}</p>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 flex items-center gap-3">
                  <select 
                    className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-stone-700 outline-none cursor-pointer"
                    value={order.estadoPedido}
                    onChange={(e) => statusMutation.mutate({ id: order.idPedido, nuevoEstado: e.target.value })}
                  >
                    {['PENDIENTE', 'PAGADO', 'PROCESANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'].map(est => (
                        <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                  <div className={`w-3 h-3 rounded-full ${order.estadoPedido === 'PAGADO' || order.estadoPedido === 'ENTREGADO' ? 'bg-green-500' : 'bg-amber-500'}`} />
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDownloadInvoice(order)}
                    disabled={isGenerating}
                    className="p-4 bg-stone-900 text-amber-400 rounded-2xl hover:bg-amber-600 hover:text-stone-950 transition-all shadow-lg disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => setExpandedOrder(expandedOrder === order.idPedido ? null : order.idPedido)}
                    className={`p-4 rounded-2xl transition-all ${expandedOrder === order.idPedido ? 'bg-amber-100 text-amber-900 rotate-180' : 'bg-stone-100 text-stone-500'}`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {expandedOrder === order.idPedido && (
              <div className="bg-stone-50/50 border-t border-stone-100 p-10 animate-in slide-in-from-top-4">
                <div className="max-w-4xl bg-white rounded-[2rem] shadow-xl overflow-hidden mx-auto border border-stone-200">
                  <table className="w-full text-left">
                    <thead className="bg-stone-900 text-[10px] font-black uppercase text-stone-400 tracking-widest">
                      <tr>
                        <th className="p-6">Variedad</th>
                        <th className="p-6 text-center">Cant</th>
                        <th className="p-6 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {order.detalles?.map((det, i) => (
                        <tr key={i} className="text-xs font-bold text-stone-800">
                          <td className="p-6 uppercase italic">{det.nombreProducto}</td>
                          <td className="p-6 text-center text-stone-400">{det.cantidad} uds</td>
                          <td className="p-6 text-right font-black text-amber-900">${det.subtotal?.toLocaleString()}</td>
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
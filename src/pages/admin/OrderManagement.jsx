import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { notify } from '../../utils/alerts'; 
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
      notify.success("¡Sincronizado!", "Estado de cosecha actualizado con éxito.");
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Fallo en el servidor al actualizar estado.";
      notify.error("Error de Gestión", msg);
    }
  });

  const handleDownloadInvoice = async (order) => {
    // Sanitización doble: trim() y toUpperCase()
    const estado = (order.estadoPedido || "").trim().toUpperCase();
    const permitidos = ['PAGADO', 'ENTREGADO', 'ENVIADO'];

    if (!permitidos.includes(estado)) {
      return notify.error("Acción Bloqueada", "El pedido debe estar PAGADO para generar factura.");
    }

    setIsGenerating(true);
    try {
      const response = await api.get(`/facturas/pedido/${order.idPedido}`);
      generateInvoiceHTML(response.data);
      notify.success("Documento Generado", "La factura está lista.");
    } catch (err) {
      notify.error("Error", "No se encontró el registro de factura en el servidor.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-40 space-y-4">
      <Loader2 className="animate-spin text-amber-800 w-12 h-12" />
      <p className="text-stone-400 font-black uppercase tracking-widest text-xs italic">Sincronizando operaciones Valenci...</p>
    </div>
  );

  return (
    <div className="space-y-8 p-4 md:p-8 animate-in fade-in duration-700">
      <header>
        <h2 className="text-4xl font-black text-stone-800 tracking-tighter uppercase italic">Logística de Pedidos</h2>
        <p className="text-stone-400 font-bold text-xs uppercase tracking-widest">Control de Cosechas y Facturación</p>
      </header>
      
      <div className="grid gap-6">
        {orders?.map(order => (
          <div key={order.idPedido} className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden hover:border-amber-400 transition-all">
            <div className="p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 w-full lg:w-auto">
                <div className="bg-stone-900 p-5 rounded-[1.5rem] text-amber-500"><Package size={32} /></div>
                <div>
                  <h4 className="font-black text-2xl text-stone-800 uppercase italic leading-tight">{order.nombreCliente}</h4>
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Orden #{order.idPedido}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 justify-end w-full lg:w-auto">
                <div className="text-right">
                  <p className="text-[10px] font-black text-stone-400">INVERSIÓN</p>
                  <p className="text-3xl font-black text-amber-900 tracking-tighter">${order.totalPedido?.toLocaleString()}</p>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 flex items-center gap-3">
                  <select 
                    className="bg-transparent border-none text-[11px] font-black uppercase text-stone-700 outline-none"
                    value={order.estadoPedido?.trim()}
                    onChange={(e) => statusMutation.mutate({ id: order.idPedido, nuevoEstado: e.target.value })}
                  >
                    {['PENDIENTE', 'PAGADO', 'PROCESANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'].map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                  <div className={`w-3 h-3 rounded-full ${order.estadoPedido?.trim() === 'PAGADO' || order.estadoPedido?.trim() === 'ENTREGADO' ? 'bg-green-500' : 'bg-amber-500'}`} />
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleDownloadInvoice(order)} disabled={isGenerating} className="p-4 bg-stone-900 text-amber-400 rounded-2xl hover:bg-amber-600 transition-all active:scale-90">
                    {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : <FileText size={20} />}
                  </button>
                  <button onClick={() => setExpandedOrder(expandedOrder === order.idPedido ? null : order.idPedido)} className="p-4 bg-stone-100 rounded-2xl">
                    <ChevronDown className={`transition-transform ${expandedOrder === order.idPedido ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {expandedOrder === order.idPedido && (
              <div className="p-8 bg-stone-50 border-t border-stone-100 animate-in slide-in-from-top-4">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-stone-400 tracking-widest">
                    <tr><th>Variedad</th><th className="text-center">Cant</th><th className="text-right">Subtotal</th></tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {order.detalles?.map((det, i) => (
                      <tr key={i} className="text-sm font-bold text-stone-700">
                        <td className="py-4 uppercase italic">{det.nombreProducto}</td>
                        <td className="py-4 text-center">{det.cantidad} uds</td>
                        <td className="py-4 text-right font-black text-amber-900">${det.subtotal?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderManagement;
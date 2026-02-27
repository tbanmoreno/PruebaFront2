import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { notify } from '../../utils/alerts'; 
import { Loader2, Package, Calendar, ChevronDown, Download, FileText } from 'lucide-react';
import { generateInvoiceHTML } from '../../utils/invoiceGenerator';

const OrderManagement = () => {
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false); // Estado para feedback visual

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => (await api.get('/pedidos')).data
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, nuevoEstado }) => api.patch(`/pedidos/${id}/estado`, { nuevoEstado }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      notify.success("¡Sincronizado!", "Estado de cosecha actualizado.");
    }
  });

  // ESTA ES LA LÓGICA CLAVE: Imita el comportamiento de InvoiceManagement
  const handleDownloadInvoice = async (order) => {
    // 1. Verificación de estado igual que en tus capturas de pantalla
    const estado = order.estadoPedido?.trim().toUpperCase();
    if (estado !== 'PAGADO' && estado !== 'ENTREGADO' && estado !== 'ENVIADO') {
      return notify.error("Acción Bloqueada", "El pedido debe estar PAGADO para generar el comprobante.");
    }

    setIsDownloading(true);
    try {
      // 2. Buscamos la factura real usando el endpoint de facturas por ID de pedido
      // Esto garantiza que el objeto tenga el formato que generateInvoiceHTML espera
      const response = await api.get(`/facturas/pedido/${order.idPedido}`);
      const facturaData = response.data;

      if (facturaData) {
        // 3. Ejecutamos exactamente la misma función que en InvoiceManagement
        generateInvoiceHTML(facturaData);
        notify.success("Documento Listo", "Factura generada correctamente.");
      }
    } catch (err) {
      console.error("Error al obtener factura:", err);
      notify.error("Error", "No se encontró un registro contable físico para este pedido.");
    } finally {
      setIsDownloading(false);
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
        <p className="text-stone-400 font-bold text-xs uppercase tracking-widest">Control de Cosechas y Facturación Oficial</p>
      </header>
      
      <div className="grid gap-6">
        {orders?.map(order => (
          <div key={order.idPedido} className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden hover:border-amber-400 transition-all">
            <div className="p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
              
              <div className="flex items-center gap-6 w-full lg:w-auto">
                <div className="bg-stone-900 p-5 rounded-[1.5rem] text-amber-500">
                  <Package size={32} />
                </div>
                <div>
                  <h4 className="font-black text-2xl text-stone-800 uppercase italic leading-tight">{order.nombreCliente}</h4>
                  <div className="flex items-center gap-2 text-sm font-bold text-stone-400 mt-2">
                    <Calendar className="w-4 h-4 text-amber-700" /> 
                    {new Date(order.fechaPedido).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 justify-end w-full lg:w-auto">
                <div className="text-right">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Inversión</p>
                  <p className="text-3xl font-black text-amber-900 tracking-tighter">
                    ${order.totalPedido?.toLocaleString()}
                  </p>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 flex items-center gap-3">
                  <select 
                    className="bg-transparent border-none text-[11px] font-black uppercase text-stone-700 outline-none cursor-pointer"
                    value={order.estadoPedido?.trim()}
                    onChange={(e) => statusMutation.mutate({ id: order.idPedido, nuevoEstado: e.target.value })}
                  >
                    {['PENDIENTE', 'PAGADO', 'PROCESANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'].map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                  <div className={`w-3 h-3 rounded-full ${order.estadoPedido?.trim() === 'PAGADO' ? 'bg-green-500' : 'bg-amber-500'}`} />
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDownloadInvoice(order)}
                    disabled={isDownloading}
                    className="bg-stone-900 text-amber-500 p-4 rounded-2xl hover:bg-amber-600 hover:text-stone-900 transition-all shadow-lg active:scale-90 disabled:opacity-50"
                  >
                    {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                  </button>

                  <button 
                    onClick={() => setExpandedOrder(expandedOrder === order.idPedido ? null : order.idPedido)} 
                    className={`p-4 rounded-2xl transition-all ${
                      expandedOrder === order.idPedido ? 'bg-amber-100 text-amber-900 rotate-180' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    <ChevronDown size={20} />
                  </button>
                </div>
              </div>
            </div>

            {expandedOrder === order.idPedido && (
              <div className="p-8 bg-stone-50 border-t border-stone-100 animate-in slide-in-from-top-4">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-stone-400 tracking-widest">
                    <tr>
                      <th className="pb-4">Variedad de Café</th>
                      <th className="pb-4 text-center">Cantidad</th>
                      <th className="pb-4 text-right">Subtotal</th>
                    </tr>
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
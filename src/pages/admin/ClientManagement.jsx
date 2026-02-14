import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { notify } from '../../utils/alerts';
import Swal from 'sweetalert2';
import { 
  Users, Search, Mail, MapPin, 
  Loader2, ChevronRight, UserCheck, 
  X, ShoppingBag, CreditCard, ChevronDown, Coffee, Key, ExternalLink 
} from 'lucide-react';

const ClientManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const { data: clients, isLoading } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: async () => (await api.get('/clientes')).data
  });

  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['client-history', selectedClient?.id],
    queryFn: async () => (await api.get(`/pedidos/cliente/${selectedClient.id}`)).data,
    enabled: !!selectedClient
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, nuevaContrasena }) => api.patch(`/admin/usuarios/${id}/password-reset`, { nuevaContrasena }),
    onSuccess: () => notify.success("Acceso Actualizado", "La nueva credencial ha sido inyectada."),
    onError: (err) => notify.error("Error", err.response?.data?.message || "Fallo de seguridad")
  });

  const handleResetPassword = async (id, nombre) => {
    const { value: newPassword } = await Swal.fire({
      title: 'Reset de Acceso',
      text: `Defina la clave para ${nombre}`,
      input: 'password',
      confirmButtonText: 'Sincronizar',
      showCancelButton: true,
      customClass: {
        confirmButton: 'bg-stone-900 text-amber-500 px-8 py-3 rounded-xl font-black uppercase text-xs mx-2',
        cancelButton: 'bg-stone-100 text-stone-500 px-8 py-3 rounded-xl font-black uppercase text-xs mx-2'
      },
      buttonsStyling: false
    });

    if (newPassword) {
      resetPasswordMutation.mutate({ id, nuevaContrasena: newPassword });
    }
  };

  const filteredClients = clients?.filter(c => 
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.correo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20">
      <Loader2 className="animate-spin text-amber-800 w-12 h-12" />
      <p className="text-stone-400 font-black uppercase tracking-widest text-[10px] mt-4 italic">Sincronizando Comunidad...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col gap-6 px-4 md:px-0">
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tighter uppercase italic">Comunidad Valenci</h2>
          <p className="text-stone-400 font-bold text-xs md:text-sm uppercase tracking-widest mt-1">Gestión de lealtad y origen</p>
        </div>

        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
          <input 
            type="text" placeholder="Buscar aliado por nombre o correo..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 md:py-5 bg-white border border-stone-200 rounded-[1.5rem] md:rounded-[2rem] text-sm font-bold outline-none focus:border-amber-500 shadow-sm"
          />
        </div>
      </header>

      {/* GRID RESPONSIVE: 1 COL EN MÓVIL, 2 EN XL */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 px-2 md:px-0">
        {filteredClients?.map(client => (
          <div key={client.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-stone-100 shadow-sm hover:border-amber-400 transition-all group overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-stone-900 rounded-2xl flex items-center justify-center text-amber-400 shadow-lg group-hover:bg-amber-800 transition-colors duration-500">
                  <UserCheck className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-stone-800 uppercase italic leading-tight">{client.nombre}</h3>
                  <div className="flex flex-col gap-1 mt-1 md:mt-2">
                    <span className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-stone-400">
                      <Mail className="w-3 h-3 text-amber-700" /> {client.correo}
                    </span>
                    <span className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-stone-400">
                      <MapPin className="w-3 h-3 text-amber-700" /> {client.direccionEnvio || 'Sin dirección'}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleResetPassword(client.id, client.nombre)}
                className="p-3 bg-stone-50 text-stone-300 hover:bg-amber-100 hover:text-amber-900 rounded-xl transition-all self-end sm:self-start"
                title="Reset Access"
              >
                <Key className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 md:mt-8 pt-6 border-t border-stone-50 flex items-center justify-between">
              <span className="bg-green-50 text-green-600 text-[8px] md:text-[9px] font-black px-3 py-1 rounded-full border border-green-100 uppercase tracking-widest">Socio Activo</span>
              <button 
                onClick={() => setSelectedClient(client)}
                className="flex items-center gap-2 bg-stone-100 text-stone-600 px-5 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all active:scale-95 shadow-sm"
              >
                Historial de Inversión <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL HISTORIAL (Full Responsive) */}
      {selectedClient && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-500 max-h-[90vh] flex flex-col">
            <div className="p-6 md:p-8 bg-stone-50 border-b border-stone-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-800 text-white rounded-2xl shadow-lg hidden sm:block">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-lg md:text-xl text-stone-800 tracking-tighter uppercase italic">Historial de Compras</h4>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{selectedClient.nombre}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedClient(null); setExpandedOrder(null); }} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-stone-400" />
              </button>
            </div>

            <div className="p-4 md:p-8 overflow-y-auto space-y-4 flex-grow custom-scrollbar">
              {isLoadingHistory ? (
                <div className="flex flex-col items-center py-20 gap-3">
                    <Loader2 className="animate-spin text-amber-800" />
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Moliendo Datos...</span>
                </div>
              ) : history?.length > 0 ? (
                history.map(order => (
                  <div key={order.idPedido} className="border border-stone-100 rounded-2xl md:rounded-[2rem] overflow-hidden bg-white hover:border-amber-200 transition-all">
                    <div 
                        onClick={() => setExpandedOrder(expandedOrder === order.idPedido ? null : order.idPedido)}
                        className="p-4 md:p-6 flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex flex-col">
                        <p className="text-[8px] md:text-[9px] font-black text-stone-300 uppercase tracking-widest mb-0.5">Orden #{order.idPedido}</p>
                        <p className="text-xs md:text-sm font-black text-stone-600 italic">{new Date(order.fechaPedido).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3 md:gap-6">
                        <div className="text-right">
                            <p className="text-lg md:text-xl font-black text-amber-900 tracking-tighter">${order.totalPedido?.toLocaleString()}</p>
                            <span className="text-[8px] font-black uppercase text-green-500 tracking-widest">{order.estadoPedido}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-stone-300 transition-transform duration-500 ${expandedOrder === order.idPedido ? 'rotate-180 text-amber-800' : ''}`} />
                      </div>
                    </div>

                    {expandedOrder === order.idPedido && (
                        <div className="px-4 pb-6 pt-2 bg-stone-50/50 animate-in slide-in-from-top-2 duration-300 border-t border-stone-50 overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[300px]">
                                <thead className="text-[8px] font-black uppercase text-stone-400 tracking-widest border-b border-stone-200">
                                    <tr>
                                        <th className="pb-2">Variedad</th>
                                        <th className="pb-2 text-center">Cant</th>
                                        <th className="pb-2 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {order.detalles?.map((det, idx) => (
                                        <tr key={idx} className="text-[10px] md:text-[11px]">
                                            <td className="py-3 flex items-center gap-2">
                                                <Coffee className="w-3 h-3 text-amber-800" />
                                                <span className="font-bold text-stone-800 uppercase tracking-tighter truncate max-w-[100px]">{det.nombreProducto}</span>
                                            </td>
                                            <td className="py-3 text-center font-bold text-stone-500">{det.cantidad}</td>
                                            <td className="py-3 text-right font-black text-stone-900">${det.subtotal?.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <CreditCard className="w-12 h-12 text-stone-100 mx-auto mb-4" />
                  <p className="text-stone-300 font-black uppercase tracking-[0.2em] text-[10px] text-center">Sin actividad comercial registrada.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
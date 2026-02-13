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

  // Mutación para Reset de Contraseña
  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }) => api.patch(`/admin/usuarios/${id}/password-reset`, password),
    onSuccess: () => notify.success("Acceso Actualizado", "La nueva contraseña ha sido establecida."),
    onError: () => notify.error("Error", "No se pudo actualizar la credencial.")
  });

  const handleResetPassword = async (id, nombre) => {
    const { value: newPassword } = await Swal.fire({
      title: 'Resetear Acceso',
      text: `Ingresa la nueva contraseña para ${nombre}`,
      input: 'password',
      inputAttributes: { autocapitalize: 'off',  autocorrect: 'off' },
      showCancelButton: true,
      confirmButtonText: 'Actualizar Contraseña',
      customClass: {
        confirmButton: 'bg-stone-900 text-amber-500 px-6 py-2 rounded-xl font-black uppercase text-xs ml-3',
        cancelButton: 'bg-stone-100 text-stone-500 px-6 py-2 rounded-xl font-black uppercase text-xs'
      },
      buttonsStyling: false
    });

    if (newPassword) {
      resetPasswordMutation.mutate({ id, password: newPassword });
    }
  };

  const openMap = (direccion) => {
    if (!direccion) return notify.error("Sin datos", "Este cliente no tiene dirección registrada.");
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
    window.open(url, '_blank');
  };

  const filteredClients = clients?.filter(c => 
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.correo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="animate-spin text-amber-800 w-12 h-12" />
      <p className="text-stone-400 font-black uppercase tracking-widest text-xs">Sincronizando Comunidad...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-stone-800 tracking-tighter uppercase italic">Comunidad Valenci</h2>
          <p className="text-stone-400 font-bold text-sm uppercase tracking-widest mt-1">Gestión y análisis de fidelidad de origen</p>
        </div>

        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
          <input 
            type="text" placeholder="Buscar por nombre o correo..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-[1.5rem] text-sm font-bold outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-sm"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredClients?.map(client => (
          <div key={client.id} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm hover:border-amber-400 transition-all group relative overflow-hidden">
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center text-amber-400 shadow-lg group-hover:bg-amber-800 group-hover:text-white transition-colors duration-500">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-stone-800 leading-tight uppercase italic">{client.nombre}</h3>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="flex items-center gap-2 text-xs font-bold text-stone-400">
                      <Mail className="w-3 h-3 text-amber-700" /> {client.correo}
                    </span>
                    <button 
                      onClick={() => openMap(client.direccionEnvio)}
                      className="flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-amber-800 transition-colors w-fit group/map"
                    >
                      <MapPin className="w-3 h-3 text-amber-700" /> 
                      <span className="border-b border-dashed border-stone-300 group-hover:border-amber-800">{client.direccionEnvio || 'Sin dirección registrada'}</span>
                      <ExternalLink className="w-2 h-2 opacity-0 group-hover:opacity-100" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ACCIÓN RÁPIDA: RESET PASSWORD */}
              <button 
                onClick={() => handleResetPassword(client.id, client.nombre)}
                className="p-3 bg-stone-50 text-stone-400 hover:bg-amber-100 hover:text-amber-900 rounded-xl transition-all shadow-inner"
                title="Resetear Contraseña"
              >
                <Key className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-50 flex items-center justify-between">
              <span className="bg-green-50 text-green-600 text-[10px] font-black px-3 py-1 rounded-full border border-green-100 uppercase tracking-widest">Miembro Activo</span>
              <button 
                onClick={() => setSelectedClient(client)}
                className="flex items-center gap-2 bg-stone-100 text-stone-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all active:scale-95"
              >
                Auditar Historial <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE HISTORIAL (Se mantiene la lógica de productos anterior) */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-800 text-white rounded-2xl shadow-lg">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-xl text-stone-800 tracking-tighter uppercase italic">Historial de Compras</h4>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{selectedClient.nombre}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedClient(null); setExpandedOrder(null); }} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-stone-400" />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
              {isLoadingHistory ? (
                <div className="flex flex-col items-center py-10 gap-3">
                    <Loader2 className="animate-spin text-amber-800" />
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Moliendo Historial...</span>
                </div>
              ) : history?.length > 0 ? (
                history.map(order => (
                  <div key={order.idPedido} className="border border-stone-100 rounded-[2rem] overflow-hidden bg-white hover:border-amber-200 transition-all">
                    <div 
                        onClick={() => setExpandedOrder(expandedOrder === order.idPedido ? null : order.idPedido)}
                        className="p-6 flex items-center justify-between cursor-pointer group"
                    >
                      <div>
                        <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1">Orden #{order.idPedido}</p>
                        <p className="text-sm font-black text-stone-600 italic">{new Date(order.fechaPedido).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-xl font-black text-amber-900 tracking-tighter">${order.totalPedido?.toLocaleString()}</p>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${order.estadoPedido === 'PAGADO' ? 'text-green-500' : 'text-amber-500'}`}>
                                {order.estadoPedido}
                            </span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-stone-300 transition-transform duration-500 ${expandedOrder === order.idPedido ? 'rotate-180 text-amber-800' : ''}`} />
                      </div>
                    </div>

                    {expandedOrder === order.idPedido && (
                        <div className="px-6 pb-6 pt-2 bg-stone-50/50 animate-in slide-in-from-top-2 duration-300 border-t border-stone-50">
                            <table className="w-full text-left">
                                <thead className="text-[8px] font-black uppercase text-stone-400 tracking-widest border-b border-stone-200">
                                    <tr>
                                        <th className="pb-2">Variedad</th>
                                        <th className="pb-2 text-center">Cant</th>
                                        <th className="pb-2 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {order.detalles?.map((det, idx) => (
                                        <tr key={idx}>
                                            <td className="py-3 flex items-center gap-2">
                                                <Coffee className="w-3 h-3 text-amber-800" />
                                                <span className="text-[11px] font-bold text-stone-800 uppercase tracking-tighter">{det.nombreProducto}</span>
                                            </td>
                                            <td className="py-3 text-center text-[10px] font-bold text-stone-500">{det.cantidad} ud</td>
                                            <td className="py-3 text-right text-[11px] font-black text-stone-900">${det.subtotal?.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <CreditCard className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                  <p className="text-stone-400 font-black uppercase tracking-[0.2em] text-xs text-center">Sin registros de inversión.</p>
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
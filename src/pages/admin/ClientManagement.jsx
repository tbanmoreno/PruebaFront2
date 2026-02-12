import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { 
  Users, Search, Mail, MapPin, 
  Loader2, ChevronRight, UserCheck, 
  X, ShoppingBag, CreditCard 
} from 'lucide-react';

const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);

  // 1. Carga de lista general
  const { data: clients, isLoading } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: async () => (await api.get('/clientes')).data
  });

  // 2. Carga de pedidos específicos cuando se selecciona un cliente
  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['client-history', selectedClient?.id],
    queryFn: async () => (await api.get(`/pedidos/cliente/${selectedClient.id}`)).data,
    enabled: !!selectedClient // Solo se ejecuta si hay un cliente seleccionado
  });

  const filteredClients = clients?.filter(c => 
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.correo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <div className="flex justify-center mt-20">
      <Loader2 className="animate-spin text-amber-800 w-12 h-12" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-stone-800 tracking-tighter">Comunidad Valenci</h2>
          <p className="text-stone-400 font-bold text-sm uppercase tracking-widest mt-1">Gestión y análisis de fidelidad</p>
        </div>

        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
          <input 
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
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
                  <h3 className="text-xl font-black text-stone-800 leading-tight">{client.nombre}</h3>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="flex items-center gap-2 text-xs font-bold text-stone-400">
                      <Mail className="w-3 h-3 text-amber-700" /> {client.correo}
                    </span>
                    <span className="flex items-center gap-2 text-xs font-bold text-stone-400">
                      <MapPin className="w-3 h-3 text-amber-700" /> {client.direccionEnvio || 'Sin dirección'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-50 flex items-center justify-between">
              <span className="bg-green-50 text-green-600 text-[10px] font-black px-3 py-1 rounded-full border border-green-100 uppercase">Miembro Activo</span>
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

      {/* OVERLAY / MODAL DE HISTORIAL */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-800 text-white rounded-2xl">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-xl text-stone-800 tracking-tighter">Historial de Compras</h4>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{selectedClient.nombre}</p>
                </div>
              </div>
              <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-stone-400" />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto">
              {isLoadingHistory ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-amber-800" /></div>
              ) : history?.length > 0 ? (
                <div className="space-y-4">
                  {history.map(order => (
                    <div key={order.idPedido} className="flex items-center justify-between p-5 bg-white border border-stone-100 rounded-2xl hover:shadow-md transition-shadow">
                      <div>
                        <p className="text-[10px] font-black text-stone-300 uppercase">Orden #{order.idPedido}</p>
                        <p className="text-sm font-bold text-stone-600">{new Date(order.fechaPedido).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-amber-900">${order.totalPedido?.toLocaleString()}</p>
                        <span className="text-[9px] font-black uppercase text-green-500">{order.estadoPedido}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <CreditCard className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                  <p className="text-stone-400 font-bold text-sm">Este cliente no tiene pedidos registrados.</p>
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
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api'; 
import { useAuth } from '../../context/AuthContext'; 
import { generateInvoiceHTML } from '../../utils/invoiceGenerator';
import { 
  Package, Calendar, Loader2, 
  User, MapPin, Edit3, Save, X, CheckCircle2, 
  FileText 
} from 'lucide-react';

const OrderHistory = () => {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  const [editData, setEditData] = useState({
    nombre: '',
    direccionEnvio: ''
  });

  useEffect(() => {
    if (user && !isEditing) {
      setEditData({
        nombre: user.nombre || '',
        direccionEnvio: user.direccionEnvio || ''
      });
    }
  }, [user, isEditing]);

  // 1. CARGA DEL HISTORIAL (Ordenado por fecha descendente)
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-history', user?.id],
    queryFn: async () => {
        const response = await api.get('/cuenta/historial');
        const rawOrders = response.data;
        return [...rawOrders].sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido));
    },
    enabled: !!user,
  });

  // 2. MUTACIÓN PERFIL
  const updateProfileMutation = useMutation({
    mutationFn: (newData) => api.put('/cuenta/perfil', newData),
    onSuccess: (response) => {
      const updatedUser = response.data;
      if (typeof setUser === 'function') {
        setUser(updatedUser); 
      }
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['my-history'] });
      alert("¡Perfil actualizado con éxito!");
    },
    onError: (error) => {
      const serverMsg = error.response?.data?.message || "Error al procesar la solicitud";
      alert("No se pudo reflejar el cambio: " + serverMsg);
    }
  });

  // 3. DESCARGA DE FACTURA
  const handleDownloadInvoice = (order) => {
    if (!order.factura) {
      alert("La factura para este pedido aún no está disponible.");
      return;
    }
    generateInvoiceHTML(order.factura);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editData.nombre.trim()) return alert("El nombre es obligatorio");
    updateProfileMutation.mutate(editData);
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <Loader2 className="animate-spin text-amber-800 w-12 h-12 mb-4" />
      <p className="text-stone-400 font-black uppercase tracking-widest text-[10px] italic">Moliendo datos frescos...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-10 md:space-y-16 animate-in fade-in duration-700">
      
      {/* SECCIÓN DE PERFIL RESPONSIVE */}
      <section className="bg-white rounded-[2.5rem] md:rounded-[3rem] border border-stone-100 shadow-xl overflow-hidden group">
        <div className="bg-stone-900 p-6 md:p-10 text-white flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-600 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center shadow-lg shrink-0">
              <User className="w-8 h-8 md:w-10 md:h-10 text-stone-950" />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase truncate">{user?.nombre}</h2>
              <p className="text-amber-500 font-bold text-[10px] md:text-xs uppercase tracking-widest opacity-80 italic">Miembro Valenci Premium</p>
            </div>
          </div>
          
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-amber-600 hover:text-stone-950 px-6 py-3 md:py-4 rounded-2xl transition-all font-black text-[10px] md:text-xs uppercase tracking-widest active:scale-95"
            >
              <Edit3 className="w-4 h-4" /> Editar Perfil
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(false)}
              className="p-3 bg-white/10 hover:bg-red-500 rounded-full transition-colors self-end sm:self-center"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-6 md:p-10">
          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest ml-4">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                <input 
                  disabled={!isEditing}
                  value={editData.nombre}
                  onChange={(e) => setEditData({...editData, nombre: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 md:py-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-amber-500 disabled:opacity-60 transition-all font-bold text-stone-800 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest ml-4">Dirección de Despacho</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                <input 
                  disabled={!isEditing}
                  value={editData.direccionEnvio}
                  onChange={(e) => setEditData({...editData, direccionEnvio: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 md:py-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-amber-500 disabled:opacity-60 transition-all font-bold text-stone-800 text-sm"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-center md:justify-end mt-4">
              {isEditing && (
                <button 
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full md:w-auto bg-stone-900 text-amber-500 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-600 hover:text-stone-950 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                >
                  {updateProfileMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                  Confirmar Cambios
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* SECCIÓN HISTORIAL ADAPTATIVA */}
      <section className="space-y-6 md:space-y-8 px-2 md:px-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-2xl"><Package className="text-amber-800 w-6 h-6 md:w-8 md:h-8" /></div>
          <h3 className="text-2xl md:text-3xl font-black text-stone-800 tracking-tighter italic uppercase">Historial de Cosecha</h3>
        </div>

        {orders?.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-16 md:p-20 text-center border-2 border-dashed border-stone-100 shadow-inner">
            <p className="text-stone-400 font-bold italic text-sm md:text-base">Tu historial está listo para nuevas moliendas.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6">
            {orders.map((order) => (
              <div key={order.idPedido} className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-stone-100 shadow-sm hover:border-amber-400 transition-all p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 group">
                <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                  <div className="bg-stone-50 p-4 md:p-5 rounded-2xl text-stone-400 group-hover:bg-amber-800 group-hover:text-white transition-colors duration-500 shadow-inner">
                    <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] md:text-[9px] font-black text-stone-300 uppercase mb-0.5 tracking-widest">Orden #{order.idPedido}</p>
                    <div className="flex items-center gap-2 text-stone-500 font-bold text-[11px] md:text-sm">
                      <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-700" /> {new Date(order.fechaPedido).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-wrap items-center justify-between md:justify-end gap-4 md:gap-10 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0 border-stone-50">
                  <div className="text-left md:text-right">
                    <p className="text-[8px] md:text-[9px] font-black text-stone-400 uppercase mb-0.5 tracking-widest">Total Invertido</p>
                    <p className="text-xl md:text-2xl font-black text-stone-800 tracking-tighter">${order.totalPedido?.toLocaleString()}</p>
                  </div>

                  {/* Acciones de Pedido */}
                  <div className="shrink-0">
                    {order.factura ? (
                      <button 
                        onClick={() => handleDownloadInvoice(order)}
                        className="flex items-center gap-2 bg-stone-50 text-stone-800 px-5 py-3 md:py-3.5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-tighter hover:bg-amber-600 hover:text-stone-900 transition-all border border-stone-100 shadow-sm active:scale-95"
                      >
                        <FileText className="w-4 h-4 md:w-5 md:h-5 text-amber-800" /> <span className="hidden sm:inline">Ver</span> Factura
                      </button>
                    ) : (
                      <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        order.estadoPedido === 'ENTREGADO' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-800 border-amber-100'
                      }`}>
                        {order.estadoPedido}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default OrderHistory;
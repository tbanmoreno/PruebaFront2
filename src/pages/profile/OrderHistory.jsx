import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api'; 
import { useAuth } from '../../context/AuthContext'; 
// Importamos el generador de facturas
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

  // Sincronizamos el formulario con los datos del usuario actual
  useEffect(() => {
    if (user && !isEditing) {
      setEditData({
        nombre: user.nombre || '',
        direccionEnvio: user.direccionEnvio || ''
      });
    }
  }, [user, isEditing]);

  // 1. Carga del Historial con ORDENAMIENTO (Recientes primero)
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-history', user?.id],
    queryFn: async () => {
        const response = await api.get('/cuenta/historial');
        const rawOrders = response.data;
        
        // ORDENAMIENTO SENIOR: Comparamos fechas o IDs de forma descendente
        return [...rawOrders].sort((a, b) => {
            // Intentamos ordenar por fecha, si falla, usamos el ID
            const dateA = new Date(a.fechaPedido);
            const dateB = new Date(b.fechaPedido);
            return dateB - dateA; 
        });
    },
    enabled: !!user,
  });

  // 2. Mutación con sincronización total
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
      console.error("Error en actualización:", error);
      const serverMsg = error.response?.data?.message || "Error al procesar la solicitud";
      alert("No se pudo reflejar el cambio: " + serverMsg);
    }
  });

  // 3. Función para descargar factura
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
      <p className="text-stone-400 font-black uppercase tracking-widest text-xs">Moliendo datos frescos...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 animate-in fade-in duration-700">
      
      {/* SECCIÓN DE PERFIL */}
      <section className="bg-white rounded-[3rem] border border-stone-100 shadow-xl overflow-hidden group">
        <div className="bg-stone-900 p-8 text-white flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-amber-600 rounded-[1.5rem] flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-stone-900" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase">{user?.nombre}</h2>
              <p className="text-amber-500 font-bold text-xs uppercase tracking-widest opacity-80 italic">Miembro Valenci Premium</p>
            </div>
          </div>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-amber-600 hover:text-stone-950 px-6 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"
            >
              <Edit3 className="w-4 h-4" /> Editar Perfil
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(false)}
              className="text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-10">
          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-4">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                <input 
                  disabled={!isEditing}
                  value={editData.nombre}
                  onChange={(e) => setEditData({...editData, nombre: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-amber-500 disabled:opacity-60 transition-all font-bold text-stone-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-4">Dirección de Despacho</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                <input 
                  disabled={!isEditing}
                  value={editData.direccionEnvio}
                  onChange={(e) => setEditData({...editData, direccionEnvio: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-amber-500 disabled:opacity-60 transition-all font-bold text-stone-800"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end">
              {isEditing && (
                <button 
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="bg-stone-900 text-amber-500 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-600 hover:text-stone-950 transition-all shadow-xl flex items-center gap-3 disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                  Confirmar Cambios
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* SECCIÓN HISTORIAL */}
      <section className="space-y-8">
        <h3 className="text-3xl font-black text-stone-800 tracking-tighter flex items-center gap-4">
          <Package className="text-amber-800 w-8 h-8" />
          Historial de Cosecha
        </h3>

        {orders?.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-stone-100">
            <p className="text-stone-400 font-bold italic">Tu historial está listo para nuevas órdenes.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order.idPedido} className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm hover:border-amber-400 transition-all p-8 flex flex-col md:flex-row justify-between items-center gap-6 group">
                <div className="flex items-center gap-6">
                  <div className="bg-stone-50 p-5 rounded-2xl text-stone-400 group-hover:bg-amber-800 group-hover:text-white transition-colors duration-500">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-stone-300 uppercase mb-1">Orden #{order.idPedido}</p>
                    <div className="flex items-center gap-3 text-stone-500 font-bold text-sm">
                      <Calendar className="w-4 h-4 text-amber-700" /> {new Date(order.fechaPedido).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-stone-400 uppercase mb-1">Total Invertido</p>
                    <p className="text-2xl font-black text-stone-800 tracking-tighter">${order.totalPedido?.toLocaleString()}</p>
                  </div>

                  {/* Botón de Factura Integrado */}
                  {order.factura ? (
                    <button 
                      onClick={() => handleDownloadInvoice(order)}
                      className="flex items-center gap-2 bg-stone-50 text-stone-800 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-tighter hover:bg-amber-600 hover:text-stone-900 transition-all border border-stone-100"
                    >
                      <FileText className="w-4 h-4" /> Ver Factura
                    </button>
                  ) : (
                    <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      order.estadoPedido === 'ENTREGADO' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-800 border border-amber-100'
                    }`}>
                      {order.estadoPedido}
                    </div>
                  )}
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
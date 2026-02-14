import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { notify } from '../../utils/alerts';
import { Coffee, Trash2, Plus, Loader2, X, Building2, Save, Package } from 'lucide-react';

const ProductManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    nombre: '', precio: '', cantidad: '', descripcion: '', idProveedor: '' 
  });

  // 1. CARGA DE DATOS
  const { data: products, isLoading: loadingProds } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => (await api.get('/productos')).data
  });

  const { data: suppliers, isLoading: loadingSups } = useQuery({
    queryKey: ['admin-suppliers'],
    queryFn: async () => (await api.get('/proveedores')).data,
    enabled: isModalOpen
  });

  // 2. MUTACIONES
  const addMutation = useMutation({
    mutationFn: (newProd) => {
        console.log("Enviando a /productos con data:", newProd);
        return api.post('/productos', newProd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      setIsModalOpen(false);
      setFormData({ nombre: '', precio: '', cantidad: '', descripcion: '', idProveedor: '' });
      notify.success("¡Cosecha Registrada!", "El producto se añadió al inventario.");
    },
    onError: (err) => {
      console.error("Error detectado:", err);
      notify.error("Error de Conexión", err.response?.data?.message || "No se pudo conectar con el servidor.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/productos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      notify.success("Eliminado", "Producto removido con éxito.");
    }
  });

  // 3. HANDLERS
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.idProveedor) return notify.error("Falta información", "Selecciona un proveedor");
    
    const dataToSend = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion,
      precio: Number(formData.precio),
      cantidad: parseInt(formData.cantidad, 10),
      idProveedor: parseInt(formData.idProveedor, 10)
    };
    addMutation.mutate(dataToSend);
  };

  if (loadingProds) return (
    <div className="flex flex-col items-center justify-center p-20 md:p-40 space-y-4">
        <Loader2 className="animate-spin text-amber-800 w-12 h-12" />
        <p className="text-stone-400 font-black uppercase tracking-widest text-xs italic">Moliendo inventario...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER RESPONSIVE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4">
        <h2 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tight uppercase italic leading-none">
            Inventario <span className="text-amber-800">Valenci</span>
        </h2>
        <button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full sm:w-auto bg-stone-900 text-amber-500 px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-amber-600 hover:text-stone-950 transition-all shadow-xl active:scale-95"
        >
          <Plus className="w-5 h-5" /> NUEVA VARIEDAD
        </button>
      </div>

      {/* CONTENEDOR DE DATOS: TABLA (Desktop) / CARDS (Móvil) */}
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-stone-100 overflow-hidden">
        
        {/* VISTA DESKTOP (Tabla) */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-stone-900 text-stone-400 text-[10px] font-black uppercase tracking-widest border-b border-stone-800">
                <tr>
                  <th className="p-8">Variedad</th>
                  <th className="p-8">Proveedor</th>
                  <th className="p-8 text-right">Precio</th>
                  <th className="p-8 text-center">Stock</th>
                  <th className="p-8 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {products?.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <Coffee className="text-amber-800 w-5 h-5" />
                        <span className="font-bold text-stone-800 text-lg uppercase tracking-tighter">{p.nombre}</span>
                      </div>
                    </td>
                    <td className="p-8 text-stone-500 font-bold text-xs uppercase italic">{p.nombreProveedor || 'N/A'}</td>
                    <td className="p-8 text-right font-black text-amber-900 text-xl">${p.precio?.toLocaleString()}</td>
                    <td className="p-8 text-center">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${p.cantidad < 15 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {p.cantidad} UND
                      </span>
                    </td>
                    <td className="p-8 text-center">
                        <button 
                            onClick={() => deleteMutation.mutate(p.id)}
                            className="p-3 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>

        {/* VISTA MÓVIL (Stackable Cards) */}
        <div className="md:hidden divide-y divide-stone-100">
            {products?.map((p) => (
                <div key={p.id} className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-stone-100 rounded-lg"><Coffee className="w-5 h-5 text-amber-800" /></div>
                            <div>
                                <h4 className="font-black text-stone-800 uppercase tracking-tight">{p.nombre}</h4>
                                <p className="text-[10px] font-bold text-stone-400 uppercase italic">{p.nombreProveedor}</p>
                            </div>
                        </div>
                        <button onClick={() => deleteMutation.mutate(p.id)} className="p-2 text-red-400"><Trash2 className="w-5 h-5" /></button>
                    </div>
                    <div className="flex justify-between items-end bg-stone-50 p-4 rounded-2xl">
                        <div>
                            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-0.5">Precio x Unidad</p>
                            <p className="font-black text-amber-900 text-lg">${p.precio?.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1 text-right">Existencias</p>
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${p.cantidad < 15 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                {p.cantidad} UNIDADES
                            </span>
                        </div>
                    </div>
                </div>
            ))}
            {products?.length === 0 && (
                <div className="p-10 text-center text-stone-400 italic text-sm">Sin variedades registradas</div>
            )}
        </div>
      </div>

      {/* MODAL RESPONSIVE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full transition-colors"
            >
                <X className="w-6 h-6 text-stone-400" />
            </button>
            
            <div className="flex items-center gap-3 mb-8">
                <Package className="text-amber-800 w-6 h-6" />
                <h3 className="text-2xl font-black text-stone-800 uppercase tracking-tighter italic">Nueva Cosecha</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-4">Nombre de Variedad</label>
                <input required className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold outline-none focus:border-amber-500 transition-all" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} placeholder="Ej: Catuaí Amarillo" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-4">Precio ($)</label>
                    <input type="number" required className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold outline-none focus:border-amber-500 transition-all" value={formData.precio} onChange={(e) => setFormData({...formData, precio: e.target.value})} placeholder="0.00" />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-4">Cantidad</label>
                    <input type="number" required className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold outline-none focus:border-amber-500 transition-all" value={formData.cantidad} onChange={(e) => setFormData({...formData, cantidad: e.target.value})} placeholder="Uds" />
                </div>
              </div>

              <div className="space-y-1 relative">
                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-4">Aliado Proveedor</label>
                <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                    <select 
                      required 
                      className="w-full pl-12 p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold outline-none appearance-none focus:border-amber-500 transition-all" 
                      value={formData.idProveedor} 
                      onChange={(e) => setFormData({...formData, idProveedor: e.target.value})}
                    >
                      <option value="">Seleccionar...</option>
                      {suppliers?.map(s => (
                        <option key={s.id} value={s.id}>{s.nombreEmpresa}</option>
                      ))}
                    </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-4">Perfil de Tostado / Notas</label>
                <textarea className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold h-24 outline-none focus:border-amber-500 transition-all resize-none" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} placeholder="Describa el origen y notas de cata..." />
              </div>
              
              <button 
                type="submit" 
                disabled={addMutation.isPending} 
                className="w-full bg-stone-900 text-amber-500 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-600 hover:text-stone-950 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-amber-900/10"
              >
                {addMutation.isPending ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />}
                CONFIRMAR REGISTRO
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
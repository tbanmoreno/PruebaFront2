import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { notify } from '../../utils/alerts';
import { Coffee, Trash2, Plus, Loader2, X, Building2, Save } from 'lucide-react';

const ProductManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    nombre: '', precio: '', cantidad: '', descripcion: '', idProveedor: '' 
  });

  const { data: products, isLoading: loadingProds } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => (await api.get('/productos')).data
  });

  const { data: suppliers, isLoading: loadingSups } = useQuery({
    queryKey: ['admin-suppliers'],
    queryFn: async () => (await api.get('/proveedores')).data,
    enabled: isModalOpen
  });

  const addMutation = useMutation({
    mutationFn: (newProd) => {
        // Log de depuración para verificar la ruta en consola
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
      console.error("Error 404 o 500 detectado:", err);
      notify.error("Error de Conexión", err.response?.data?.message || "La ruta /api/productos no fue hallada en el servidor.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/productos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      notify.success("Eliminado", "Producto removido con éxito.");
    }
  });

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
    <div className="flex justify-center p-40 italic text-stone-400 font-bold animate-pulse">
        <Loader2 className="animate-spin mr-2" /> Moliendo inventario...
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-4xl font-black text-stone-800 tracking-tight uppercase italic">Inventario Valenci</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-stone-900 text-amber-500 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-amber-600 hover:text-stone-950 transition-all shadow-xl">
          <Plus /> NUEVO PRODUCTO
        </button>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-stone-100 overflow-hidden">
        <table className="w-full text-left">
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
              <tr key={p.idProducto || p.id} className="hover:bg-amber-50/20 transition-colors">
                <td className="p-8">
                  <div className="flex items-center gap-4">
                    <Coffee className="text-amber-800 w-5 h-5" />
                    <span className="font-bold text-stone-800 text-lg uppercase tracking-tighter">{p.nombreProducto || p.nombre}</span>
                  </div>
                </td>
                <td className="p-8 text-stone-500 font-bold text-xs uppercase italic">{p.nombreProveedor}</td>
                <td className="p-8 text-right font-black text-amber-900 text-xl">${p.precio?.toLocaleString()}</td>
                <td className="p-8 text-center">
                  <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${p.cantidad < 15 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {p.cantidad} UND
                  </span>
                </td>
                <td className="p-8 text-center">
                    <button 
                        onClick={() => deleteMutation.mutate(p.idProducto || p.id)}
                        className="p-3 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full"><X className="w-6 h-6 text-stone-400" /></button>
            <h3 className="text-2xl font-black text-stone-800 mb-6 uppercase tracking-tighter italic">Nueva Variedad</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-bold" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} placeholder="Nombre del Café" />
              
              <div className="grid grid-cols-2 gap-4">
                <input type="number" required className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-bold" value={formData.precio} onChange={(e) => setFormData({...formData, precio: e.target.value})} placeholder="Precio $" />
                <input type="number" required className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-bold" value={formData.cantidad} onChange={(e) => setFormData({...formData, cantidad: e.target.value})} placeholder="Stock" />
              </div>

              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <select 
                  required 
                  className="w-full pl-12 p-4 bg-stone-50 border border-stone-200 rounded-2xl font-bold outline-none appearance-none" 
                  value={formData.idProveedor} 
                  onChange={(e) => setFormData({...formData, idProveedor: e.target.value})}
                >
                  <option value="">Seleccionar Proveedor...</option>
                  {suppliers?.map(s => (
                    <option key={s.idUsuario || s.id} value={s.idUsuario || s.id}>{s.nombreEmpresa}</option>
                  ))}
                </select>
              </div>

              <textarea className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl font-bold h-24" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} placeholder="Notas de cata..." />
              
              <button type="submit" disabled={addMutation.isPending} className="w-full bg-stone-900 text-amber-500 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-600 hover:text-stone-950 transition-all flex items-center justify-center gap-3">
                {addMutation.isPending ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />}
                GUARDAR EN INVENTARIO
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { Coffee, Trash2, Plus, Loader2, X, Building2 } from 'lucide-react';

const ProductManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    nombre: '', precio: '', cantidad: '', descripcion: '', idProveedor: '' 
  });

  // Query estandarizada
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
    mutationFn: (newProd) => api.post('/productos', newProd),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      setIsModalOpen(false);
      setFormData({ nombre: '', precio: '', cantidad: '', descripcion: '', idProveedor: '' });
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.message || "Error interno del servidor";
      alert("No se pudo crear el producto: " + errorMsg);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion,
      precio: Number(formData.precio),
      cantidad: parseInt(formData.cantidad, 10),
      idProveedor: parseInt(formData.idProveedor, 10)
    };
    addMutation.mutate(dataToSend);
  };

  if (loadingProds) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-amber-800 w-12 h-12" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-4xl font-black text-stone-800 tracking-tight">Inventario Valenci</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-amber-800 transition-all shadow-lg">
          <Plus /> NUEVO PRODUCTO
        </button>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-stone-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-stone-50 text-stone-400 text-[11px] font-black uppercase tracking-widest border-b">
            <tr>
              <th className="p-8">Variedad</th>
              <th className="p-8">Proveedor</th>
              <th className="p-8">Precio</th>
              <th className="p-8">Existencias</th>
              <th className="p-8 text-center">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {products?.map((p) => (
              <tr key={p.id} className="hover:bg-amber-50/20 transition-colors">
                <td className="p-8">
                  <div className="flex items-center gap-4">
                    <Coffee className="text-amber-800 w-5 h-5 flex-shrink-0" />
                    <span className="font-bold text-stone-800 text-lg">{p.nombre}</span>
                  </div>
                </td>
                <td className="p-8 text-stone-500 font-medium">
                  {p.nombreProveedor}
                </td>
                <td className="p-8 font-black text-amber-900 text-xl">
                  ${p.precio?.toLocaleString()}
                </td>
                <td className="p-8">
                  <span className={`px-4 py-2 rounded-xl text-xs font-black ${p.cantidad < 15 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {p.cantidad} UND
                  </span>
                </td>
                <td className="p-8 text-center">
                    <button className="p-3 bg-stone-50 text-stone-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
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
            <h3 className="text-3xl font-black text-stone-800 mb-6 tracking-tight">Nueva Variedad</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" placeholder="Nombre del Café" required 
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none" 
                value={formData.nombre} 
                onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
              />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Precio ($)" required className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none" value={formData.precio} onChange={(e) => setFormData({...formData, precio: e.target.value})} />
                <input type="number" placeholder="Stock" required className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none" value={formData.cantidad} onChange={(e) => setFormData({...formData, cantidad: e.target.value})} />
              </div>
              <div className="relative">
                <Building2 className="absolute left-4 top-4 w-5 h-5 text-stone-400" />
                <select 
                  required 
                  className="w-full pl-12 p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none appearance-none font-medium text-stone-700" 
                  value={formData.idProveedor} 
                  onChange={(e) => setFormData({...formData, idProveedor: e.target.value})}
                >
                  <option value="">{loadingSups ? "Cargando..." : "Seleccionar Proveedor..."}</option>
                  {suppliers?.map(s => (
                    <option key={s.id} value={s.id}>{s.nombreEmpresa}</option>
                  ))}
                </select>
              </div>
              <textarea placeholder="Descripción..." className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} />
              <button type="submit" disabled={addMutation.isPending} className="w-full bg-amber-800 text-white py-5 rounded-2xl font-black text-lg hover:bg-amber-900 transition-all flex items-center justify-center gap-3">
                {addMutation.isPending ? <Loader2 className="animate-spin" /> : 'GUARDAR EN INVENTARIO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
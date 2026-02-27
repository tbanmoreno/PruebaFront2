import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { notify } from '../../utils/alerts';
import { Coffee, Trash2, Plus, Loader2, X, Save, Image as ImageIcon, Edit2 } from 'lucide-react';

const ProductManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [formData, setFormData] = useState({ 
    nombre: '', 
    precio: '', 
    cantidad: '', 
    descripcion: '', 
    idProveedor: '', 
    imagen: '' 
  });

  // CARGA DE DATOS
  const { data: products, isLoading: loadingProds } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => (await api.get('/productos')).data
  });

  const { data: suppliers } = useQuery({
    queryKey: ['admin-suppliers'],
    queryFn: async () => (await api.get('/proveedores')).data,
    enabled: isModalOpen
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1000000) return notify.error("Imagen pesada", "Máximo 1MB.");
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData({ ...formData, imagen: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveMutation = useMutation({
    mutationFn: (data) => editingId 
      ? api.put(`/productos/${editingId}`, data) 
      : api.post('/productos', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      queryClient.invalidateQueries(['products']); 
      closeModal();
      notify.success("Sincronizado", "El inventario de Valenci ha sido actualizado.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/productos/${id}`),
    onSuccess: () => {
        queryClient.invalidateQueries(['admin-products']);
        queryClient.invalidateQueries(['products']);
        notify.success("Eliminado", "Producto removido del catálogo.");
    }
  });

  const openModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setPreviewImage(product.imagen);
      setFormData({
        nombre: product.nombre, // Alineado con DtoRespuestaProducto
        precio: product.precio,
        cantidad: product.cantidad,
        descripcion: product.descripcion,
        idProveedor: product.idProveedor || '', 
        imagen: product.imagen || ''
      });
    } else {
      setEditingId(null);
      setPreviewImage(null);
      setFormData({ nombre: '', precio: '', cantidad: '', descripcion: '', idProveedor: '', imagen: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setPreviewImage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.idProveedor) return notify.error("Falta información", "Seleccione un proveedor.");
    saveMutation.mutate(formData);
  };

  if (loadingProds) return <div className="flex justify-center p-40"><Loader2 className="animate-spin text-amber-800 w-12" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4">
        <h2 className="text-3xl md:text-4xl font-black text-stone-800 uppercase italic">Inventario Valenci</h2>
        <button onClick={() => openModal()} className="w-full sm:w-auto bg-stone-900 text-amber-500 px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-stone-800 transition-all shadow-xl">
          <Plus /> NUEVA VARIEDAD
        </button>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-stone-100 overflow-hidden">
        {/* TABLA DESKTOP */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-stone-900 text-stone-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="p-8">Visual</th>
                <th className="p-8">Variedad</th>
                <th className="p-8 text-right">Precio</th>
                <th className="p-8 text-center">Stock</th>
                <th className="p-8 text-center">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {products?.map((p) => (
                <tr key={p.id} className="hover:bg-amber-50/20 transition-colors group">
                  <td className="p-8">
                    {p.imagen ? (
                      <img src={p.imagen} className="w-14 h-14 rounded-2xl object-cover shadow-md" alt={p.nombre} />
                    ) : (
                      <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-200"><Coffee /></div>
                    )}
                  </td>
                  <td className="p-8 font-bold text-stone-800 uppercase tracking-tighter">{p.nombre}</td>
                  <td className="p-8 text-right font-black text-amber-900">${p.precio?.toLocaleString()}</td>
                  <td className="p-8 text-center">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black ${p.cantidad < 15 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {p.cantidad} UND
                    </span>
                  </td>
                  <td className="p-8 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openModal(p)} className="p-3 text-stone-400 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                      <button onClick={() => deleteMutation.mutate(p.id)} className="p-3 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* VISTA MÓVIL */}
        <div className="md:hidden divide-y divide-stone-100">
          {products?.map((p) => (
            <div key={p.id} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  {p.imagen ? <img src={p.imagen} className="w-12 h-12 rounded-xl object-cover" /> : <Coffee className="text-stone-200" />}
                  <span className="font-black text-stone-800 uppercase text-sm">{p.nombre}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openModal(p)} className="p-2 text-amber-600"><Edit2 size={18} /></button>
                  <button onClick={() => deleteMutation.mutate(p.id)} className="p-2 text-red-400"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-6 right-6 p-2 text-stone-400 hover:bg-stone-100 rounded-full"><X /></button>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center gap-3">
                <div className="relative group w-32 h-32 md:w-40 md:h-40">
                  <div className="w-full h-full rounded-[2.5rem] bg-stone-50 border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden">
                    {previewImage ? (
                        <>
                            <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setPreviewImage(null);
                                    setFormData({...formData, imagen: ''});
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:scale-110 transition-all shadow-lg"
                            >
                                <X size={14} />
                            </button>
                        </>
                    ) : (
                        <ImageIcon className="text-stone-200" size={40} />
                    )}
                  </div>
                  <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-stone-900/0 group-hover:bg-stone-900/10 transition-all rounded-[2.5rem]">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    <div className="bg-white p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100"><Plus size={20} className="text-amber-800" /></div>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <input required className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold" 
                  value={formData.nombre} 
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                  placeholder="Nombre de la variedad" />
                
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" required className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold" 
                    value={formData.precio} 
                    onChange={(e) => setFormData({...formData, precio: e.target.value})} 
                    placeholder="Precio" />
                  <input type="number" required className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold" 
                    value={formData.cantidad} 
                    onChange={(e) => setFormData({...formData, cantidad: e.target.value})} 
                    placeholder="Stock" />
                </div>
                
                <select required className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold" 
                  value={formData.idProveedor} 
                  onChange={(e) => setFormData({...formData, idProveedor: e.target.value})}>
                  <option value="">Proveedor...</option>
                  {suppliers?.map(s => <option key={s.id} value={s.id}>{s.nombreEmpresa}</option>)}
                </select>

                <textarea className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold h-24 resize-none" 
                  value={formData.descripcion} 
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})} 
                  placeholder="Descripción..." />
              </div>

              <button type="submit" disabled={saveMutation.isPending} className="w-full bg-stone-900 text-amber-500 py-5 rounded-2xl font-black uppercase shadow-xl flex justify-center items-center gap-2 hover:bg-stone-800 transition-all">
                {saveMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                {editingId ? 'ACTUALIZAR VARIEDAD' : 'GUARDAR EN INVENTARIO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
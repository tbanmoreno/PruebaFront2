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
  
  // COHERENCIA: Nombres alineados con DtoSolicitudProducto.java
  const [formData, setFormData] = useState({ 
    nombre: '', 
    precio: '', 
    cantidad: '', 
    descripcion: '', 
    idProveedor: '', 
    imagen: '' 
  });

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
      // Sincronizamos ambos estados globales
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
      setEditingId(product.id); // 'id' viene de DtoRespuestaProducto
      setPreviewImage(product.imagen);
      setFormData({
        nombre: product.nombre,
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
      {/* ... (Cabecera y Tabla permanecen igual, asegurando usar p.id y p.nombre) ... */}
      
      {/* MODAL CON SOPORTE PARA ELIMINACIÓN DE IMAGEN */}
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
                            {/* BOTÓN PARA QUITAR IMAGEN */}
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
                {/* ... (Select de proveedores y descripción) ... */}
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
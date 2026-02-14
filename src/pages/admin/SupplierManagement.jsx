import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { notify } from '../../utils/alerts';
import { 
  Building2, Loader2, Plus, 
  X, Save, Edit2, Trash2, AlertTriangle, Mail, User 
} from 'lucide-react';

const SupplierManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', correo: '', nombreEmpresa: '', contrasena: 'Valenci2026*' });

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['admin-suppliers'],
    queryFn: async () => (await api.get('/proveedores')).data
  });

  const saveMutation = useMutation({
    mutationFn: (sup) => editingId ? api.put(`/proveedores/${editingId}`, sup) : api.post('/proveedores', sup),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-suppliers']);
      closeModal();
      notify.success("Sincronizado", "Red de aliados actualizada correctamente.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/proveedores/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-suppliers']);
      notify.success("Removido", "Proveedor eliminado de la red.");
    },
    onError: () => notify.error("Error", "Este proveedor tiene productos asociados.")
  });

  const openModal = (sup = null) => {
    if (sup) {
      setEditingId(sup.id);
      setFormData({ nombre: sup.nombre, correo: sup.correo, nombreEmpresa: sup.nombreEmpresa, contrasena: '' });
    } else {
      setEditingId(null);
      setFormData({ nombre: '', correo: '', nombreEmpresa: '', contrasena: 'Valenci2026*' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-amber-800" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 px-2 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-stone-800 uppercase italic">Aliados de Origen</h2>
          <p className="text-stone-400 font-bold text-xs uppercase tracking-widest">Gestión de la cadena de suministro</p>
        </div>
        <button onClick={() => openModal()} className="w-full sm:w-auto bg-stone-900 text-amber-500 px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-amber-600 hover:text-stone-950 transition-all shadow-xl">
          <Plus className="w-4 h-4" /> REGISTRAR ALIADO
        </button>
      </div>

      {/* VISTA MÓVIL (Cards) / DESKTOP (Grid/Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {suppliers?.map(sup => (
          <div key={sup.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-stone-100 shadow-sm hover:border-amber-400 transition-all group overflow-hidden relative">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="p-4 bg-stone-900 rounded-2xl text-amber-400 group-hover:bg-amber-800 transition-colors"><Building2 className="w-6 h-6 md:w-8 md:h-8" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-lg md:text-xl text-stone-800 uppercase italic truncate">{sup.nombreEmpresa}</h3>
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-stone-400 truncate"><User className="w-3 h-3 text-amber-700" /> {sup.nombre}</span>
                    <span className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-stone-400 truncate"><Mail className="w-3 h-3 text-amber-700" /> {sup.correo}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-stone-50">
                <button onClick={() => openModal(sup)} className="p-3 text-stone-400 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                <button onClick={async () => {
                    const res = await notify.confirm("¿Remover aliado?", "Esta acción no se puede deshacer.", "Remover");
                    if (res.isConfirmed) deleteMutation.mutate(sup.id);
                }} className="p-3 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL RESPONSIVE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
            <div className="bg-stone-900 p-6 md:p-8 text-white flex justify-between items-center">
              <h3 className="font-black uppercase tracking-tighter text-xl italic">{editingId ? 'Actualizar Aliado' : 'Nuevo Registro'}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-stone-800 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <form className="p-6 md:p-10 space-y-6" onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }}>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-2">Nombre Comercial</label>
                <input required className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold outline-none focus:border-amber-500 transition-all" value={formData.nombreEmpresa} onChange={(e) => setFormData({...formData, nombreEmpresa: e.target.value})} placeholder="Ej: Finca El Tostadero" />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-2">Representante Legal</label>
                <input required className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold outline-none focus:border-amber-500 transition-all" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} placeholder="Nombre completo" />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-2">Correo Corporativo</label>
                <input required type="email" disabled={!!editingId} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold outline-none focus:border-amber-500 transition-all disabled:opacity-50" value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})} placeholder="aliado@valenci.com" />
              </div>

              <button type="submit" disabled={saveMutation.isPending} className="w-full bg-stone-900 text-amber-500 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-600 hover:text-stone-950 transition-all shadow-xl flex items-center justify-center gap-3">
                {saveMutation.isPending ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'CONFIRMAR CAMBIOS' : 'REGISTRAR ALIADO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;
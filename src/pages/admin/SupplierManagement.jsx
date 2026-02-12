import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { notify } from '../../utils/alerts'; // IMPORTACIÓN DE LA UTILIDAD
import { 
  Building2, Loader2, ExternalLink, Plus, 
  X, Save, Edit2, Trash2, AlertTriangle 
} from 'lucide-react';

const SupplierManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    nombreEmpresa: '',
    contrasena: 'Valenci2026*' 
  });

  // 1. Carga de Proveedores
  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['admin-suppliers'],
    queryFn: async () => (await api.get('/proveedores')).data
  });

  // 2. Mutación para Guardar (Crear o Editar)
  const saveSupplierMutation = useMutation({
    mutationFn: (supplier) => {
      return editingId 
        ? api.put(`/proveedores/${editingId}`, supplier) 
        : api.post('/proveedores', supplier);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-suppliers']);
      closeModal();
      // USO DE SWEETALERT EXITOSO
      notify.success(
        editingId ? "Actualizado" : "Registrado", 
        editingId ? "Los datos del aliado han sido sincronizados." : "El nuevo aliado ha sido añadido a la red."
      );
    },
    onError: (error) => notify.error("Error en operación", error.response?.data?.message || "Fallo de red")
  });

  // 3. Mutación para Eliminar
  const deleteSupplierMutation = useMutation({
    mutationFn: (id) => api.delete(`/proveedores/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-suppliers']);
      notify.success("Removido", "El proveedor ha sido dado de baja exitosamente.");
    },
    onError: (error) => notify.error("Conflicto de integridad", "No se puede eliminar: el proveedor tiene productos o pedidos asociados.")
  });

  const openModal = (supplier = null) => {
    if (supplier) {
      setEditingId(supplier.idUsuario || supplier.id);
      setFormData({
        nombre: supplier.nombre,
        correo: supplier.correo,
        nombreEmpresa: supplier.nombreEmpresa,
        contrasena: '' 
      });
    } else {
      setEditingId(null);
      setFormData({ nombre: '', correo: '', nombreEmpresa: '', contrasena: 'Valenci2026*' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = async (id, nombre) => {
    // REEMPLAZO DE window.confirm POR MODAL DE SWEETALERT
    const result = await notify.confirm(
      "¿Remover Aliado?",
      `Estás a punto de eliminar a "${nombre}". Esta acción afectará la trazabilidad del inventario.`,
      "Sí, eliminar de red"
    );

    if (result.isConfirmed) {
      deleteSupplierMutation.mutate(id);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <Loader2 className="animate-spin text-amber-800 w-12 h-12 mb-4" />
      <p className="text-stone-400 font-black uppercase tracking-widest text-xs italic">Sincronizando cadena de suministro...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-stone-800 tracking-tighter uppercase italic">Red de Proveedores</h2>
          <p className="text-stone-400 font-bold text-sm uppercase tracking-widest">Gestión de alianzas y trazabilidad</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-stone-900 text-amber-500 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-amber-600 hover:text-stone-950 transition-all shadow-xl active:scale-95"
        >
          <Plus className="w-4 h-4" /> Registrar Aliado
        </button>
      </div>

      {/* TABLA DE GESTIÓN */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-stone-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-900 text-stone-400 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="p-6">Empresa Proveedora</th>
              <th className="p-6">Contacto Directo</th>
              <th className="p-6">Estado / Correo</th>
              <th className="p-6 text-center">Gestión de Red</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {suppliers?.map(sup => (
              <tr key={sup.idUsuario || sup.id} className="hover:bg-amber-50/50 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-stone-100 rounded-xl group-hover:bg-amber-100 transition-colors">
                      <Building2 className="w-5 h-5 text-stone-700 group-hover:text-amber-800" />
                    </div>
                    <span className="font-black text-stone-800 uppercase tracking-tight">{sup.nombreEmpresa}</span>
                  </div>
                </td>
                <td className="p-6 text-stone-600 font-bold text-sm">{sup.nombre}</td>
                <td className="p-6">
                  <span className="bg-stone-100 px-4 py-1.5 rounded-full text-[10px] font-black text-stone-500 uppercase tracking-tighter">
                    {sup.correo}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => openModal(sup)}
                      className="p-2 text-stone-400 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(sup.idUsuario || sup.id, sup.nombreEmpresa)}
                      disabled={deleteSupplierMutation.isPending}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar"
                    >
                      {deleteSupplierMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE FORMULARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-stone-900 p-8 text-white flex justify-between items-center border-b border-stone-800">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-amber-500 w-5 h-5" />
                <h3 className="font-black uppercase tracking-tighter text-xl">
                  {editingId ? 'Actualizar Aliado' : 'Nuevo Registro'}
                </h3>
              </div>
              <button onClick={closeModal} className="text-stone-400 hover:text-white transition-colors"><X /></button>
            </div>
            
            <form className="p-10 space-y-6" onSubmit={(e) => { e.preventDefault(); saveSupplierMutation.mutate(formData); }}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-2">Nombre de la Empresa</label>
                <input 
                  required
                  className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold outline-none focus:border-amber-500 transition-all text-stone-800"
                  value={formData.nombreEmpresa}
                  onChange={(e) => setFormData({...formData, nombreEmpresa: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-2">Nombre del Contacto</label>
                <input 
                  required
                  className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold outline-none focus:border-amber-500 transition-all text-stone-800"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-2">Correo de Operaciones</label>
                <input 
                  required
                  type="email"
                  className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold outline-none focus:border-amber-500 transition-all text-stone-800 disabled:opacity-50"
                  value={formData.correo}
                  disabled={!!editingId}
                  onChange={(e) => setFormData({...formData, correo: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={saveSupplierMutation.isPending}
                className="w-full bg-stone-900 text-amber-500 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-3 hover:bg-amber-600 hover:text-stone-950 transition-all shadow-xl shadow-amber-900/10"
              >
                {saveSupplierMutation.isPending ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Confirmar Cambios' : 'Registrar en Red'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;
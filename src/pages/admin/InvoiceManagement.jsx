import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { 
  FileText, Download, Loader2, 
  Calendar, DollarSign, User, Search, FilterX
} from 'lucide-react';
import { generateInvoiceHTML } from '../../utils/invoiceGenerator';

const InvoiceManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['admin-invoices'],
    queryFn: async () => (await api.get('/facturas')).data
  });

  const filteredInvoices = invoices?.filter(inv => {
    const search = searchTerm.toLowerCase();
    return (
      inv.idFactura.toString().includes(search) ||
      inv.nombreCliente?.toLowerCase().includes(search) ||
      inv.total?.toString().includes(search)
    );
  });

  const handleDownload = (inv) => {
    if (!inv) return;
    generateInvoiceHTML(inv);
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20">
      <Loader2 className="animate-spin text-amber-800 w-12 h-12" />
      <p className="text-stone-400 font-black uppercase tracking-widest text-[10px] mt-4">Sincronizando Archivos...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* HEADER & SEARCH RESPONSIVE */}
      <header className="flex flex-col gap-6 px-4 md:px-0">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tighter uppercase italic">Auditoría Fiscal</h2>
            <p className="text-stone-400 font-bold text-xs md:text-sm uppercase tracking-widest mt-1">Control de facturación legal Valenci</p>
          </div>
          <div className="bg-stone-900 text-amber-400 px-6 py-3 rounded-2xl font-black flex items-center gap-3 shadow-lg self-center md:self-end">
            <FileText className="w-5 h-5" /> 
            <span className="text-lg md:text-xl">{filteredInvoices?.length || 0} Registros</span>
          </div>
        </div>
        
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
          <input 
            type="text"
            placeholder="Buscar por ID, cliente o monto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 md:py-5 bg-white border border-stone-200 rounded-[1.5rem] md:rounded-[2rem] text-sm font-bold text-stone-700 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-sm"
          />
        </div>
      </header>

      {/* LISTADO DE FACTURAS (Adaptativo) */}
      <div className="grid gap-4 px-2 md:px-0">
        {filteredInvoices?.length > 0 ? (
          filteredInvoices.map(inv => (
            <div 
              key={inv.idFactura} 
              className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col lg:flex-row items-center justify-between hover:border-amber-400 transition-all duration-500 group relative"
            >
              {/* Bloque Izquierdo: Monto e ID */}
              <div className="flex items-center gap-4 md:gap-6 w-full lg:w-auto">
                <div className="bg-stone-50 p-4 md:p-6 rounded-[1.2rem] md:rounded-[1.5rem] text-stone-400 group-hover:bg-amber-800 group-hover:text-white transition-colors duration-500 shadow-inner">
                  <DollarSign className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] md:text-[10px] font-black text-stone-300 uppercase tracking-widest">Factura #{inv.idFactura}</span>
                    <span className="bg-green-50 text-green-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-green-100">Certificada</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-black text-stone-900 tracking-tighter">
                    ${inv.total?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Bloque Derecho: Detalles y Botón */}
              <div className="flex flex-row md:flex-wrap items-center justify-between lg:justify-end gap-4 md:gap-10 w-full lg:w-auto mt-6 lg:mt-0 pt-6 lg:pt-0 border-t lg:border-t-0 border-stone-50">
                <div className="text-left lg:text-right">
                  <p className="text-[8px] md:text-[9px] font-black text-stone-300 uppercase tracking-widest mb-1 flex items-center lg:justify-end gap-1">
                    <User className="w-3 h-3" /> Cliente
                  </p>
                  <p className="text-xs md:text-sm font-bold text-stone-700 truncate max-w-[120px] md:max-w-none">{inv.nombreCliente || 'Consumidor Final'}</p>
                </div>

                <div className="text-right border-x border-stone-100 px-4 md:px-8">
                  <p className="text-[8px] md:text-[9px] font-black text-stone-300 uppercase tracking-widest mb-1 flex items-center lg:justify-end gap-1">
                    <Calendar className="w-3 h-3" /> Fecha
                  </p>
                  <p className="text-xs md:text-sm font-bold text-stone-600">
                    {new Date(inv.fecha).toLocaleDateString()}
                  </p>
                </div>

                <button 
                  onClick={() => handleDownload(inv)}
                  className="bg-stone-900 text-amber-400 p-4 md:p-5 rounded-2xl hover:bg-amber-600 hover:text-white transition-all shadow-md active:scale-90"
                  title="Descargar PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-stone-100 mx-4">
             <FilterX className="w-16 h-16 text-stone-200 mx-auto mb-4 opacity-50" />
             <h3 className="text-xl font-black text-stone-800">Cosecha vacía</h3>
             <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px] mt-2 italic">No hay facturas con ese criterio</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceManagement;
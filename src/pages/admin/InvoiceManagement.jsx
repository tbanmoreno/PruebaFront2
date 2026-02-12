import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { 
  FileText, 
  Download, 
  Loader2, 
  Calendar, 
  DollarSign, 
  User, 
  Search,
  FilterX
} from 'lucide-react';
import { generateInvoiceHTML } from '../../utils/invoiceGenerator';

const InvoiceManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Carga de datos desde la API
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['admin-invoices'],
    queryFn: async () => (await api.get('/facturas')).data
  });

  // 2. Lógica de Filtrado Local (Mejora la UX al ser instantáneo)
  const filteredInvoices = invoices?.filter(inv => {
    const search = searchTerm.toLowerCase();
    return (
      inv.idFactura.toString().includes(search) ||
      inv.nombreCliente?.toLowerCase().includes(search) ||
      inv.total?.toString().includes(search)
    );
  });

  const handleDownload = (inv) => {
    if (!inv) return alert("Datos de factura no disponibles");
    generateInvoiceHTML(inv);
  };

  if (isLoading) return (
    <div className="flex justify-center mt-20">
      <Loader2 className="animate-spin text-amber-800 w-10 h-10" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* HEADER Y MÉTRICAS */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-stone-800 tracking-tighter">Auditoría de Facturas</h2>
          <p className="text-stone-400 font-bold text-sm uppercase tracking-widest mt-1">Control financiero y fiscal de Valenci</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* BARRA DE BÚSQUEDA PROFESIONAL */}
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
            <input 
              type="text"
              placeholder="Buscar por ID o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-[1.5rem] text-sm font-bold text-stone-700 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-sm"
            />
          </div>

          <div className="bg-stone-900 text-amber-400 px-6 py-4 rounded-[1.5rem] font-black flex items-center gap-3 shadow-lg">
            <FileText className="w-5 h-5" /> 
            <span className="text-xl">{filteredInvoices?.length || 0}</span>
          </div>
        </div>
      </header>

      {/* LISTADO DE FACTURAS */}
      <div className="grid gap-4">
        {filteredInvoices?.length > 0 ? (
          filteredInvoices.map(inv => (
            <div 
              key={inv.idFactura} 
              className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col lg:flex-row items-center justify-between hover:border-amber-400 transition-all duration-300 group"
            >
              <div className="flex items-center gap-6 w-full lg:w-auto">
                <div className="bg-stone-50 p-5 rounded-[1.5rem] text-stone-400 group-hover:bg-amber-800 group-hover:text-white transition-colors duration-500 shadow-inner">
                  <DollarSign className="w-7 h-7" />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em]">Registro #{inv.idFactura}</span>
                    <span className="bg-green-50 text-green-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-green-100">Validada</span>
                  </div>
                  <p className="text-3xl font-black text-stone-800 tracking-tighter">
                    ${inv.total?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between lg:justify-end gap-8 w-full lg:w-auto mt-6 lg:mt-0 pt-6 lg:pt-0 border-t lg:border-t-0 border-stone-50">
                <div className="text-left lg:text-right">
                  <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1 flex items-center lg:justify-end gap-1">
                    <User className="w-3 h-3" /> Cliente
                  </p>
                  <p className="font-bold text-stone-700">{inv.nombreCliente || 'Consumidor Final'}</p>
                </div>

                <div className="text-left lg:text-right border-x border-stone-100 px-8 hidden sm:block">
                  <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1 flex items-center lg:justify-end gap-1">
                    <Calendar className="w-3 h-3" /> Fecha
                  </p>
                  <p className="font-bold text-stone-600">
                    {new Date(inv.fecha).toLocaleDateString()}
                  </p>
                </div>

                <button 
                  onClick={() => handleDownload(inv)}
                  className="bg-stone-900 text-amber-400 p-5 rounded-[1.5rem] hover:bg-amber-800 hover:text-white transition-all shadow-md active:scale-95 group/btn relative"
                  title="Descargar Factura"
                >
                  <Download className="w-5 h-5" />
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-3 py-1 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none font-bold">
                    Descargar
                  </span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-stone-100">
             <FilterX className="w-16 h-16 text-stone-200 mx-auto mb-4" />
             <h3 className="text-xl font-black text-stone-800">Sin coincidencias</h3>
             <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px] mt-2">No encontramos resultados para "{searchTerm}"</p>
             <button 
              onClick={() => setSearchTerm("")}
              className="mt-6 text-amber-800 font-black text-xs uppercase underline decoration-2 underline-offset-4"
             >
               Limpiar búsqueda
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceManagement;
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { FileText, Download, Search, AlertCircle } from 'lucide-react';
import { generateInvoiceHTML } from '../../utils/invoiceGenerator';

const InvoiceManagement = () => {
  const { data: facturas, isLoading, isError } = useQuery({
    queryKey: ['admin-facturas'],
    queryFn: async () => {
      // Sincronizado con ControladorFactura (@RequestMapping("/api/facturas"))
      const response = await api.get('/facturas');
      return response.data;
    }
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-40 space-y-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-stone-200 border-t-amber-800" />
      <p className="text-stone-400 font-black uppercase tracking-widest text-xs">Recuperando archivos legales...</p>
    </div>
  );

  if (isError) return (
    <div className="p-20 text-center space-y-4">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
      <p className="text-stone-800 font-black uppercase tracking-tighter text-xl">Error de Conexión</p>
      <p className="text-stone-500 text-sm">No se pudo contactar con el módulo de facturación.</p>
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-stone-800 mb-2 italic">Facturación</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">Registro Legal de Cosechas</p>
        </div>
      </header>

      {facturas?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facturas.map((factura) => (
            <div key={factura.idFactura} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-stone-50 p-4 rounded-2xl group-hover:bg-amber-50 transition-colors">
                  <FileText className="text-stone-400 group-hover:text-amber-600" size={24} />
                </div>
                <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">
                  ID: {String(factura.idFactura || factura.id).padStart(4, '0')}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-stone-800 mb-1">
                {factura.nombreCliente || factura.clienteNombre || "Cliente Valenci"}
              </h3>
              <p className="text-stone-400 text-xs font-medium mb-6">
                {new Date(factura.fecha || factura.fechaFactura).toLocaleDateString()}
              </p>
              
              <div className="flex justify-between items-center pt-6 border-t border-stone-50">
                <span className="text-2xl font-black text-stone-800">
                  $ {(factura.total || factura.totalFactura || 0).toLocaleString()}
                </span>
                <button 
                  onClick={() => generateInvoiceHTML(factura)}
                  className="bg-stone-900 text-amber-500 p-3 rounded-xl hover:bg-amber-600 hover:text-stone-900 transition-all shadow-lg active:scale-90"
                >
                  <Download size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-stone-50 rounded-[3rem] p-40 text-center border-2 border-dashed border-stone-100">
           <FileText className="w-16 h-16 text-stone-200 mx-auto mb-4" />
           <p className="text-stone-400 font-black uppercase tracking-widest text-xs">No hay registros contables emitidos</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;
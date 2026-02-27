import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { FileText, Download, AlertCircle, ShoppingBag } from 'lucide-react';
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
      <p className="text-stone-400 font-black uppercase tracking-widest text-xs italic">Recuperando registros contables...</p>
    </div>
  );

  if (isError) return (
    <div className="p-20 text-center space-y-4 bg-red-50/50 rounded-[3rem] border border-red-100 m-8">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
      <p className="text-stone-800 font-black uppercase tracking-tighter text-xl">Error de Sincronización</p>
      <p className="text-stone-500 text-sm">No se pudo contactar con el servidor de facturación legal.</p>
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-stone-800 mb-2 italic uppercase">Facturación</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">Historial Oficial de Ventas Valenci</p>
        </div>
        <div className="bg-stone-100 px-6 py-2 rounded-full">
            <p className="text-[10px] font-black text-stone-500 uppercase">Total Documentos: {facturas?.length || 0}</p>
        </div>
      </header>

      {facturas?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facturas.map((factura) => (
            <div key={factura.idFactura} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-2xl hover:border-amber-200 transition-all duration-500 group">
              <div className="flex justify-between items-start mb-8">
                <div className="bg-stone-900 p-4 rounded-2xl group-hover:bg-amber-500 transition-colors duration-500">
                  <FileText className="text-amber-500 group-hover:text-stone-900" size={24} />
                </div>
                <div className="text-right">
                    <span className="block text-[10px] font-black text-stone-300 uppercase tracking-widest">Comprobante</span>
                    <span className="text-sm font-black text-stone-800">#{String(factura.idFactura).padStart(5, '0')}</span>
                </div>
              </div>
              
              <div className="space-y-1 mb-8">
                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Cliente</p>
                  <h3 className="text-2xl font-black text-stone-800 leading-none italic uppercase truncate">
                    {factura.nombreCliente}
                  </h3>
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-tighter">
                    {new Date(factura.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
              </div>
              
              <div className="flex justify-between items-center pt-6 border-t border-stone-100">
                <div>
                    <p className="text-[10px] font-black text-stone-400 uppercase">Total Liquidado</p>
                    <span className="text-3xl font-black text-stone-900 tracking-tighter">
                      ${factura.total?.toLocaleString()}
                    </span>
                </div>
                <button 
                  onClick={() => generateInvoiceHTML(factura)}
                  title="Descargar PDF"
                  className="bg-stone-900 text-amber-500 p-4 rounded-2xl hover:bg-amber-600 hover:text-stone-950 transition-all shadow-lg active:scale-95 group-hover:rotate-3"
                >
                  <Download size={24} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-stone-50 rounded-[4rem] p-32 text-center border-2 border-dashed border-stone-200">
           <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <ShoppingBag className="w-10 h-10 text-stone-200" />
           </div>
           <p className="text-stone-500 font-black uppercase tracking-widest text-sm">No se han emitido facturas legales todavía</p>
           <p className="text-stone-400 text-xs mt-2">Las facturas aparecerán cuando los pedidos cambien a estado "PAGADO".</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;
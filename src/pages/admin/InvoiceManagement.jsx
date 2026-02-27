import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { FileText, Download, Search } from 'lucide-react';
import { generateInvoiceHTML } from '../../utils/invoiceGenerator';

const InvoiceManagement = () => {
  const { data: facturas, isLoading } = useQuery({
    queryKey: ['admin-facturas'],
    queryFn: async () => {
      const response = await api.get('/admin/facturas');
      return response.data;
    }
  });

  if (isLoading) return <div className="p-8 text-center font-black uppercase tracking-widest text-stone-400">Cargando Archivos...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-stone-800 mb-2 italic">Facturación</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">Registro Legal de Cosechas</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facturas?.map((factura) => (
          <div key={factura.idFactura} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-stone-50 p-4 rounded-2xl group-hover:bg-amber-50 transition-colors">
                <FileText className="text-stone-400 group-hover:text-amber-600" size={24} />
              </div>
              <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">
                ID: {String(factura.idFactura).padStart(4, '0')}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-stone-800 mb-1">{factura.nombreCliente}</h3>
            <p className="text-stone-400 text-xs font-medium mb-6">{new Date(factura.fecha).toLocaleDateString()}</p>
            
            <div className="flex justify-between items-center pt-6 border-t border-stone-50">
              <span className="text-2xl font-black text-stone-800">$ {factura.total.toLocaleString()}</span>
              <button 
                onClick={() => generateInvoiceHTML(factura)}
                className="bg-stone-900 text-amber-500 p-3 rounded-xl hover:bg-amber-600 hover:text-stone-900 transition-all"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoiceManagement;
export const generateInvoiceHTML = (factura) => {
  if (!factura) return;
  const printWindow = window.open('', '_blank');
  
  // Mapeo ultra-seguro
  const idFactura = factura.idFactura || "000";
  const nombre = factura.nombreCliente || "Cliente Valenci";
  const email = factura.correoCliente || "";
  const fecha = factura.fecha ? new Date(factura.fecha).toLocaleDateString() : new Date().toLocaleDateString();
  const total = factura.total || 0;
  const iva = factura.iva || 0;
  const items = factura.detalles || [];

  const html = `
    <body class="p-10 bg-stone-50">
      <div class="max-w-4xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl">
        <div class="flex justify-between items-center mb-12">
          <h1 class="text-4xl font-black italic uppercase text-stone-900">Valenci</h1>
          <p class="text-4xl font-black text-amber-900">#${String(idFactura).padStart(4, '0')}</p>
        </div>
        
        <div class="grid grid-cols-2 gap-10 mb-12">
          <div>
            <p class="text-stone-300 font-black text-[10px] uppercase mb-1">Cliente</p>
            <p class="text-2xl font-black text-stone-800">${nombre}</p>
            <p class="text-stone-500 font-bold">${email}</p>
          </div>
          <div class="text-right">
            <p class="text-stone-300 font-black text-[10px] uppercase mb-1">Fecha</p>
            <p class="text-2xl font-black text-stone-800">${fecha}</p>
          </div>
        </div>

        <table class="w-full mb-10">
          <thead class="border-b-2 border-stone-100 text-[10px] font-black uppercase text-stone-400">
            <tr><th class="py-4 text-left">Producto</th><th class="py-4 text-center">Cant.</th><th class="py-4 text-right">Subtotal</th></tr>
          </thead>
          <tbody>
            ${items.length > 0 ? items.map(i => `
              <tr class="border-b border-stone-50">
                <td class="py-6 font-bold text-stone-800">${i.nombreProducto}</td>
                <td class="py-6 text-center text-stone-500 font-bold">${i.cantidad}</td>
                <td class="py-6 text-right font-black text-stone-900">$${i.subtotal?.toLocaleString()}</td>
              </tr>`).join('') : '<tr><td colspan="3" class="py-10 text-center text-stone-300 italic">Cargando detalles...</td></tr>'}
          </tbody>
        </table>

        </div>
    </body>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
};
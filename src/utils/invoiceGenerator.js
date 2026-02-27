export const generateInvoiceHTML = (factura) => {
  const printWindow = window.open('', '_blank');
  
  // Sincronizado con DtoRespuestaFactura: fecha y total
  const nroFactura = factura.idFactura ? String(factura.idFactura).padStart(4, '0') : "0001";
  const clienteNombre = factura.nombreCliente || "Cliente Valenci";
  const clienteEmail = factura.correoCliente || "contacto@valenci.com";
  
  // Prioridad a 'fecha' según tu DTO actual
  const fechaOriginal = factura.fecha || factura.fechaFactura;
  const fechaFormateada = fechaOriginal ? new Date(fechaOriginal).toLocaleDateString() : new Date().toLocaleDateString();

  // Prioridad a 'total' según tu DTO actual
  const montoTotal = factura.total || factura.totalFactura || 0;
  const montoIva = factura.iva || 0;
  const subtotalBase = montoTotal - montoIva;
  const items = factura.detalles || [];

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Factura Valenci #${nroFactura}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; color: #1c1917; background-color: #f5f5f4; }
        @media print { .no-print { display: none !important; } body { background-color: white !important; } }
        .coffee-gradient { background: linear-gradient(135deg, #1c1917 0%, #44403c 100%); }
      </style>
    </head>
    <body class="p-4 md:p-12">
      <div class="max-w-4xl mx-auto flex justify-end mb-8 no-print">
        <button onclick="window.print()" class="bg-amber-600 hover:bg-amber-700 text-white px-10 py-4 rounded-2xl font-extrabold text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95">
          IMPRIMIR COMPROBANTE
        </button>
      </div>

      <div class="max-w-4xl mx-auto bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-stone-100">
        <div class="coffee-gradient p-12 text-white flex justify-between items-center relative">
          <div>
            <div class="flex items-center gap-4 mb-3">
              <div class="bg-amber-600 p-3 rounded-2xl">
                <svg viewBox="0 0 24 24" class="w-8 h-8 text-black" fill="currentColor"><path d="M2 21h18v-2H2M20 8h-2V5h2m0-2H4v10a4 4 0 004 4h6a4 4 0 004-4v-3h2a2 2 0 002-2V5a2 2 0 00-2-2Z"/></svg>
              </div>
              <h1 class="text-4xl font-extrabold tracking-tighter uppercase italic">Valenci</h1>
            </div>
            <p class="text-stone-400 text-[10px] font-black uppercase tracking-[0.4em]">Cosecha de Origen • Premium Coffee</p>
          </div>
          <div class="text-right">
            <h2 class="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-1">Factura Oficial</h2>
            <p class="text-5xl font-extrabold tracking-tighter">#${nroFactura}</p>
          </div>
        </div>

        <div class="p-12">
          <div class="grid grid-cols-2 gap-20 mb-16">
            <div>
              <p class="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-4">Cliente:</p>
              <h3 class="text-2xl font-extrabold text-stone-800">${clienteNombre}</h3>
              <p class="text-stone-500 font-bold text-sm mt-1">${clienteEmail}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-4">Fecha:</p>
              <p class="text-2xl font-extrabold text-stone-800">${fechaFormateada}</p>
            </div>
          </div>

          <table class="w-full mb-16">
            <thead>
              <tr class="text-stone-400 text-[10px] font-black uppercase text-left tracking-widest border-b border-stone-100">
                <th class="pb-6">Descripción</th>
                <th class="pb-6 text-center">Cant.</th>
                <th class="pb-6 text-right">Precio</th>
                <th class="pb-6 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-50">
              ${items.map(item => `
                <tr>
                  <td class="py-8 font-extrabold text-stone-800 text-lg uppercase">${item.nombreProducto}</td>
                  <td class="py-8 text-center font-bold text-stone-500">${item.cantidad}</td>
                  <td class="py-8 text-right font-bold text-stone-400">$${(item.precioUnitario || 0).toLocaleString()}</td>
                  <td class="py-8 text-right font-black text-stone-800 text-lg">$${(item.subtotal || 0).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="flex justify-end pt-10 border-t-4 border-stone-100">
            <div class="w-80 space-y-4">
              <div class="flex justify-between items-center text-[10px] font-black text-stone-400 uppercase tracking-widest px-4">
                <span>Base Imponible</span>
                <span class="text-stone-600 font-bold">$${subtotalBase.toLocaleString()}</span>
              </div>
              <div class="flex justify-between items-center text-[10px] font-black text-stone-400 uppercase tracking-widest px-4">
                <span>IVA (19%)</span>
                <span class="text-stone-600 font-bold">$${montoIva.toLocaleString()}</span>
              </div>
              <div class="flex justify-between items-center p-6 bg-stone-50 rounded-[2rem] border border-stone-100 mt-4 shadow-sm">
                <span class="text-xs font-black text-stone-800 uppercase italic">Total Cobrado</span>
                <span class="text-3xl font-extrabold text-amber-900 italic">$${montoTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="p-12 bg-stone-50 text-center border-t border-stone-100">
          <p class="text-[9px] font-black text-stone-300 uppercase tracking-[0.5em]">VALENCI CAFÉ APP • 2026</p>
        </div>
      </div>
    </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
};
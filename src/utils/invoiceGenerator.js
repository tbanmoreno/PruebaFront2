export const generateInvoiceHTML = (factura) => {
  const printWindow = window.open('', '_blank');
  
  // Sincronización estricta con el nuevo DTO 
  const nroFactura = factura.idFactura ? String(factura.idFactura).padStart(4, '0') : "0000";
  const clienteNombre = factura.nombreCliente || "Cliente Valenci";
  const clienteEmail = factura.correoCliente || "contacto@valenci.com";
  
  const fechaOriginal = factura.fecha || factura.fechaFactura;
  const fechaFormateada = fechaOriginal ? new Date(fechaOriginal).toLocaleDateString() : new Date().toLocaleDateString();

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
          <div class="grid grid-cols-2 gap-12 mb-12">
            <div>
              <h3 class="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">Facturar a</h3>
              <p class="text-xl font-bold text-stone-800">${clienteNombre}</p>
              <p class="text-stone-500 font-medium">${clienteEmail}</p>
            </div>
            <div class="text-right">
              <h3 class="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">Fecha de Emisión</h3>
              <p class="text-xl font-bold text-stone-800">${fechaFormateada}</p>
            </div>
          </div>

          <table class="w-full mb-12">
            <thead>
              <tr class="border-b-2 border-stone-100">
                <th class="text-left py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Producto</th>
                <th class="text-center py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Cant.</th>
                <th class="text-right py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Precio</th>
                <th class="text-right py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr class="border-b border-stone-50">
                  <td class="py-6 font-bold text-stone-800">${item.nombreProducto}</td>
                  <td class="py-6 text-center font-medium text-stone-500">${item.cantidad}</td>
                  <td class="py-6 text-right font-medium text-stone-500">$${item.precioUnitario?.toLocaleString()}</td>
                  <td class="py-6 text-right font-bold text-stone-800">$${item.subtotal?.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="flex justify-end">
            <div class="w-64 space-y-3">
              <div class="flex justify-between text-stone-500 font-medium">
                <span>Subtotal</span>
                <span>$${subtotalBase.toLocaleString()}</span>
              </div>
              <div class="flex justify-between text-stone-500 font-medium">
                <span>IVA (19%)</span>
                <span>$${montoIva.toLocaleString()}</span>
              </div>
              <div class="flex justify-between text-2xl font-black text-amber-800 pt-3 border-t-2 border-stone-100">
                <span>TOTAL</span>
                <span>$${montoTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
};
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, ShieldCheck } from 'lucide-react';

const Cart = () => {
  const { cart, addToCart, removeFromCart, cartTotal, clearCart } = useCart();

  // Mejora en la lógica de actualización para evitar duplicados visuales
  const updateQuantity = (product, delta) => {
    if (delta === -1 && product.quantity === 1) {
      removeFromCart(product.id);
    } else {
      addToCart({ ...product, quantity: delta });
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-32 px-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="bg-white rounded-[3rem] p-16 text-center border border-stone-100 shadow-2xl">
          <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <ShoppingBag className="w-10 h-10 text-stone-200" />
          </div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tighter uppercase mb-4">Tu bolsa está vacía</h2>
          <p className="text-stone-400 font-medium mb-10 leading-relaxed text-sm">Parece que aún no has descubierto el aroma que te acompañará hoy.</p>
          <Link to="/" className="inline-block bg-stone-900 text-amber-500 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-600 hover:text-stone-950 transition-all shadow-xl active:scale-95">
            Explorar Variedades
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 animate-in fade-in duration-700">
      <div className="flex items-end justify-between mb-12 border-b border-stone-100 pb-8">
        <div>
          <h1 className="text-5xl font-black text-stone-800 tracking-tighter uppercase">Tu Carrito</h1>
          <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px] mt-2 italic">Café de especialidad listo para el envío</p>
        </div>
        <button onClick={clearCart} className="text-red-400 text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-colors">
          Limpiar Bolsa
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LISTA DE PRODUCTOS */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-stone-100 flex items-center gap-8 group hover:shadow-xl transition-all duration-500">
              <div className="w-28 h-28 bg-stone-50 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition-transform duration-500">☕</div>
              
              <div className="flex-1">
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Támesis, Antioquia</p>
                <h3 className="text-xl font-black text-stone-800 tracking-tight">{item.name}</h3>
                <p className="text-stone-400 text-xs font-bold mt-1">${item.price.toLocaleString()} unidad</p>
              </div>

              {/* CONTROLES DE CANTIDAD PREMIUM */}
              <div className="flex items-center gap-4 bg-stone-50 rounded-2xl p-2 border border-stone-100">
                <button 
                  onClick={() => updateQuantity(item, -1)}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm text-stone-400 hover:text-amber-800 transition-all active:scale-90"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-black text-stone-800">{item.quantity}</span>
                <button 
                  onClick={() => addToCart({ ...item, quantity: 1 })}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm text-stone-400 hover:text-amber-800 transition-all active:scale-90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-right min-w-[120px]">
                <p className="text-xl font-black text-stone-900 tracking-tighter">${(item.price * item.quantity).toLocaleString()}</p>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-stone-300 hover:text-red-500 transition-colors mt-2"
                >
                  <Trash2 className="w-4 h-4 ml-auto" />
                </button>
              </div>
            </div>
          ))}

          <Link to="/" className="inline-flex items-center gap-3 text-stone-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-amber-800 transition-all mt-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Seguir explorando el origen
          </Link>
        </div>

        {/* RESUMEN DE PAGO */}
        <div className="lg:col-span-1">
          <div className="bg-stone-900 p-10 rounded-[3rem] shadow-2xl text-white sticky top-32">
            <h2 className="text-xl font-black tracking-widest uppercase border-b border-white/10 pb-6 mb-8 text-amber-500">Resumen del Pedido</h2>
            
            <div className="space-y-6 mb-10">
              <div className="flex justify-between font-bold text-stone-400">
                <span className="text-sm">Subtotal</span>
                <span>${cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-400">
                <span className="text-sm">Envío prioritario</span>
                <span className="text-amber-500 uppercase text-xs tracking-widest">Bonificado</span>
              </div>
              <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                <span className="text-stone-400 text-[10px] font-black uppercase tracking-widest">Total Inversión</span>
                <span className="text-4xl font-black tracking-tighter text-white">${cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <Link 
              to="/checkout" 
              className="block w-full bg-amber-600 text-stone-950 text-center py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-500 transition-all shadow-xl active:scale-95"
            >
              Finalizar Compra
            </Link>
            
            <div className="mt-8 flex items-center justify-center gap-3 text-stone-500">
              <ShieldCheck className="w-5 h-5 opacity-50" />
              <p className="text-[9px] font-black uppercase tracking-widest">Transacción Cifrada 256-bit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
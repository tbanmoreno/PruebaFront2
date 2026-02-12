import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { CreditCard, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [loading, setLoading] = useState(false);

  const handleOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Tu carrito está vacío.");
    
    setLoading(true);
    try {
      const payload = {
        detalles: cart.map(item => ({ 
          idProducto: item.id, 
          cantidad: item.quantity 
        })),
        metodoPago
      };

      // Intentamos procesar el pedido
      const response = await api.post('/pedidos', payload);
      
      if (response.status === 201) {
        clearCart();
        alert("¡Cosecha confirmada! Tu pedido ha sido procesado.");
        navigate('/perfil/historial');
      }
    } catch (err) {
      console.error("Fallo en el Checkout:", err.response?.data);
      const errorMsg = err.response?.data?.message || "No se pudo procesar el pago. Verifica tu conexión.";
      alert(`Error en el proceso: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-20 px-6 animate-in fade-in duration-700">
      <button 
        onClick={() => navigate('/cart')}
        className="mb-8 flex items-center gap-2 text-stone-400 hover:text-amber-800 transition-colors font-black text-[10px] uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al Carrito
      </button>

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-stone-100">
        <h2 className="text-3xl font-black text-stone-800 mb-8 tracking-tighter uppercase flex items-center gap-3">
          <CreditCard className="text-amber-800 w-8 h-8" /> Finalizar Pedido
        </h2>

        <form onSubmit={handleOrder} className="space-y-8">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-2">Selecciona tu método de pago</p>
            {['EFECTIVO', 'TARJETA_CREDITO', 'TRANSFERENCIA'].map(m => (
              <label 
                key={m} 
                className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                  metodoPago === m 
                  ? 'border-amber-500 bg-amber-50/30' 
                  : 'border-stone-100 hover:border-stone-200'
                }`}
              >
                <span className="font-black text-stone-800 text-sm tracking-tight">{m.replace('_', ' ')}</span>
                <input 
                  type="radio" 
                  className="w-5 h-5 accent-amber-800" 
                  name="pago" 
                  value={m} 
                  checked={metodoPago === m} 
                  onChange={e => setMetodoPago(e.target.value)} 
                />
              </label>
            ))}
          </div>

          <div className="pt-6 border-t border-stone-50">
            <button 
              disabled={loading} 
              className="w-full bg-stone-900 text-amber-500 py-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-600 hover:text-stone-950 transition-all shadow-xl flex justify-center items-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" /> 
                  Confirmar Inversión: ${cartTotal.toLocaleString()}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
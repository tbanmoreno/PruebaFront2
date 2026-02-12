import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag } from 'lucide-react';

const Success = () => (
  <div className="text-center py-20">
    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6 animate-bounce" />
    <h1 className="text-4xl font-black text-stone-800 mb-2">¡Pedido Confirmado!</h1>
    <p className="text-stone-500 mb-10 text-lg">Tu café Valenci ya se está preparando para el envío.</p>
    <div className="flex justify-center gap-4">
      <Link to="/perfil/historial" className="bg-amber-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-900 transition">
        Ver mis pedidos
      </Link>
      <Link to="/" className="flex items-center gap-2 text-stone-600 font-bold hover:text-stone-900">
        <ShoppingBag className="w-5 h-5" /> Seguir comprando
      </Link>
    </div>
  </div>
);

export default Success;
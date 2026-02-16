import { ShoppingCart, CheckCircle2, Award, Coffee } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    const itemForCart = {
        id: product.id,
        name: product.nombre, 
        price: product.precio,
        quantity: 1
    };
    addToCart(itemForCart);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-4 border border-stone-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
      {/* AREA VISUAL: Renderiza la imagen Base64 o el Icono por defecto */}
      <div className="h-64 bg-stone-100 rounded-[2rem] relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm z-10">
          <Award className="w-3 h-3 text-amber-700" />
          <span className="text-[8px] font-black uppercase tracking-widest text-stone-800">Especialidad</span>
        </div>
        
        {product.imagen ? (
            <img 
                src={product.imagen} 
                alt={product.nombre} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
        ) : (
            <div className="text-6xl group-hover:scale-110 transition-transform duration-700 select-none drop-shadow-2xl">
              <Coffee className="w-16 h-16 text-stone-300" />
            </div>
        )}
        
        <div className="absolute inset-0 bg-amber-900/0 group-hover:bg-amber-900/5 transition-colors duration-500" />
      </div>

      <div className="p-4 pt-6">
        <div className="flex flex-col gap-1 mb-4">
          <h3 className="text-xl font-black text-stone-800 leading-tight tracking-tighter uppercase truncate">
            {product.nombre}
          </h3>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Origen Támesis</p>
        </div>
        
        <p className="text-sm text-stone-500 font-medium line-clamp-2 leading-relaxed mb-6 opacity-80 h-10">
          {product.descripcion}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-stone-50">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest mb-0.5">Precio</span>
            <span className="text-2xl font-black text-stone-900 tracking-tighter">
              ${product.precio?.toLocaleString()}
            </span>
          </div>

          <button 
            onClick={handleAdd}
            disabled={product.cantidad <= 0}
            className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-500 shadow-lg ${
              added 
                ? 'bg-green-600 text-white' 
                : 'bg-stone-900 text-amber-500 hover:bg-amber-600 hover:text-stone-950 active:scale-90 shadow-stone-200'
            } disabled:bg-stone-100 disabled:text-stone-300 disabled:shadow-none`}
          >
            {added ? (
              <CheckCircle2 className="w-6 h-6 animate-in zoom-in" />
            ) : (
              <ShoppingCart className="w-6 h-6" />
            )}
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${product.cantidad > 10 ? 'bg-green-500' : 'bg-orange-500'}`} />
            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                Disponibilidad: {product.cantidad} unidades
            </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
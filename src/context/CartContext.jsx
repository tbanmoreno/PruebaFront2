import { createContext, useContext, useState, useEffect } from 'react';
import { notify } from '../utils/alerts';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart_valenci');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart_valenci', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      
      // Notificación sutil de éxito al añadir
      if ((product.quantity || 1) > 0) {
        notify.success("Bolsa actualizada", `${product.name || 'El producto'} se ha sumado.`);
      }

      if (existing) {
        const newQuantity = existing.quantity + (product.quantity || 1);

        if (newQuantity <= 0) {
          return prev.filter(item => item.id !== product.id);
        }

        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }

      if ((product.quantity || 1) <= 0) return prev;

      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      cartTotal, 
      cartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
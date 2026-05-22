import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.variant_id === item.variant_id);
      if (exists) {
        return prev.map((i) =>
          i.variant_id === item.variant_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (variant_id, quantity) => {
    if (quantity < 1) return removeFromCart(variant_id);
    setCart((prev) =>
      prev.map((i) => (i.variant_id === variant_id ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (variant_id) =>
    setCart((prev) => prev.filter((i) => i.variant_id !== variant_id));

  const clearCart = () => setCart([]);

  const total     = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
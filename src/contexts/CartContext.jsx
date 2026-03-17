import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cartItems');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      // Prevent ordering from multiple merchants at once
      if (prev.length > 0 && prev[0].merchant_id !== product.merchant_id) {
        alert("Vous ne pouvez commander que chez un seul commerçant à la fois. Veuillez vider votre panier ou finaliser votre commande actuelle d'abord.");
        return prev;
      }

      const existing = prev.find(item => item.product_id === product.$id);
      const currentQty = existing ? existing.quantity : 0;
      
      if (currentQty + quantity > product.stock) {
        alert("Stock insuffisant !");
        return prev;
      }
      
      if (existing) {
        return prev.map(item => 
          item.product_id === product.$id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prev, {
        product_id: product.$id,
        name: product.name,
        price: product.price,
        image_id: product.image_id,
        stock: product.stock,
        merchant_id: product.merchant_id,
        quantity
      }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev => prev.map(item => {
      if (item.product_id === productId) {
        if (quantity > item.stock) {
          alert("Stock maximal atteint !");
          return item;
        }
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const merchantId = cartItems.length > 0 ? cartItems[0].merchant_id : null;

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    itemCount,
    merchantId
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

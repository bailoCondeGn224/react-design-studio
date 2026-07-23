// src/contexts/CartContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { StorefrontArticle } from '@/types';

interface CartContextType {
  items: any[];
  itemCount: number;
  subtotal: number;
  addItem: (article: StorefrontArticle, quantity?: number, modeVente?: { id: string; nom: string; prix: number; quantiteStock: number }) => void;
  removeItem: (articleId: string, modeVenteId?: string) => void;
  updateQuantity: (articleId: string, quantity: number, modeVenteId?: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { slug } = useParams<{ slug: string }>();
  const cart = useCart(slug || '');

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return context;
};

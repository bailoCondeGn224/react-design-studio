// src/hooks/useCart.ts
import { useState, useEffect, useCallback } from 'react';
import { CartItem, StorefrontArticle } from '@/types';

const getStorageKey = (slug: string) => `cart_${slug}`;

export const useCart = (slug: string) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (!slug) return [];
    try {
      const stored = localStorage.getItem(getStorageKey(slug));
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse cart data from localStorage:', error);
      localStorage.removeItem(getStorageKey(slug));
      return [];
    }
  });

  useEffect(() => {
    if (!slug) return;
    if (items.length > 0) {
      localStorage.setItem(getStorageKey(slug), JSON.stringify(items));
    } else {
      localStorage.removeItem(getStorageKey(slug));
    }
  }, [items, slug]);

  const addItem = useCallback((article: StorefrontArticle, quantity = 1, modeVente?: { id: string; nom: string; prix: number }) => {
    setItems((prev) => {
      const existing = prev.find((item) =>
        modeVente ? item.articleId === article.id && item.modeVenteId === modeVente.id
                 : item.articleId === article.id && !item.modeVenteId
      );

      if (existing) {
        return prev.map((item) =>
          (modeVente ? item.articleId === article.id && item.modeVenteId === modeVente.id
                     : item.articleId === article.id && !item.modeVenteId)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          articleId: article.id,
          articleNom: article.nom,
          articlePhoto: article.photo,
          modeVenteId: modeVente?.id,
          modeVenteNom: modeVente?.nom,
          prixUnitaire: modeVente?.prix ?? article.prixEnLigne,
          quantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((articleId: string, modeVenteId?: string) => {
    setItems((prev) =>
      prev.filter((item) =>
        modeVenteId
          ? !(item.articleId === articleId && item.modeVenteId === modeVenteId)
          : !(item.articleId === articleId && !item.modeVenteId)
      )
    );
  }, []);

  const updateQuantity = useCallback((articleId: string, quantity: number, modeVenteId?: string) => {
    if (quantity <= 0) {
      removeItem(articleId, modeVenteId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        (modeVenteId
          ? item.articleId === articleId && item.modeVenteId === modeVenteId
          : item.articleId === articleId && !item.modeVenteId)
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  const clear = useCallback(() => {
    setItems([]);
    if (slug) {
      localStorage.removeItem(getStorageKey(slug));
    }
  }, [slug]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.prixUnitaire * item.quantity, 0);

  return { items, itemCount, subtotal, addItem, removeItem, updateQuantity, clear };
};

// src/components/storefront/StorefrontLayout.tsx
import { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { StorefrontHeader } from './StorefrontHeader';
import { CartDrawer } from './CartDrawer';
import { useStorefront } from '@/hooks/useStorefront';
import { CartDrawerProvider, useCartDrawer } from '@/contexts/CartDrawerContext';
import { CartProvider, useCartContext } from '@/contexts/CartContext';
import { Loader2 } from 'lucide-react';

interface StorefrontLayoutProps {
  children: ReactNode;
}

const StorefrontLayoutContent = ({ children }: StorefrontLayoutProps) => {
  const { slug } = useParams<{ slug: string }>();
  const { isOpen, openCart, closeCart } = useCartDrawer();

  const { data: storefront, isLoading, error } = useStorefront(slug || '');
  const { items, itemCount, subtotal, removeItem, updateQuantity } = useCartContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !storefront) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">Boutique introuvable</h1>
        <p className="text-muted-foreground">Cette boutique n'existe pas ou n'est plus disponible.</p>
      </div>
    );
  }

  if (!storefront.isActive) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">Boutique fermée</h1>
        <p className="text-muted-foreground">Cette boutique est temporairement indisponible.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader
        storefront={storefront}
        cartCount={itemCount}
        onCartClick={openCart}
      />
      <main className="pb-20">{children}</main>
      <CartDrawer
        open={isOpen}
        onOpenChange={(open) => !open && closeCart()}
        items={items}
        subtotal={subtotal}
        fraisLivraison={storefront.fraisLivraison}
        onRemove={removeItem}
        onUpdateQuantity={updateQuantity}
        onCheckout={() => {}}
        storefront={storefront}
      />
    </div>
  );
};

export const StorefrontLayout = ({ children }: StorefrontLayoutProps) => {
  return (
    <CartProvider>
      <CartDrawerProvider>
        <StorefrontLayoutContent>{children}</StorefrontLayoutContent>
      </CartDrawerProvider>
    </CartProvider>
  );
};

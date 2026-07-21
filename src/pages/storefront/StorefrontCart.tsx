// src/pages/storefront/StorefrontCart.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
import { CartMobileItem } from '@/components/storefront/CartMobileItem';
import { useStorefront } from '@/hooks/useStorefront';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

const StorefrontCart = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: storefront } = useStorefront(slug || '');
  const { items, subtotal, removeItem, updateQuantity } = useCart(slug || '');

  if (!storefront) return null;

  const total = subtotal + storefront.fraisLivraison;

  return (
    <StorefrontLayout>
      <div className="p-4">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(`/b/${slug}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Continuer mes achats
        </Button>

        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Mon panier ({items.length})
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Votre panier est vide</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-6">
              {items.map((item) => (
                <CartMobileItem
                  key={`${item.articleId}_${item.modeVenteId || ''}`}
                  item={item}
                  onRemove={() => removeItem(item.articleId, item.modeVenteId)}
                  onUpdateQuantity={(qty) => updateQuantity(item.articleId, qty, item.modeVenteId)}
                  formatPrix={formatPrix}
                />
              ))}
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>Sous-total</span>
                <span>{formatPrix(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Livraison estimée</span>
                <span>{formatPrix(storefront.fraisLivraison)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatPrix(total)}</span>
              </div>
            </div>

            <Button
              className="w-full h-14 text-base"
              onClick={() => navigate(`/b/${slug}/checkout`)}
            >
              Passer la commande
            </Button>
          </>
        )}
      </div>
    </StorefrontLayout>
  );
};

export default StorefrontCart;

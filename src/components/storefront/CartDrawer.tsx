// src/components/storefront/CartDrawer.tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CartMobileItem } from './CartMobileItem';
import { CartItem } from '@/types';
import { ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  subtotal: number;
  fraisLivraison: number;
  onRemove: (articleId: string, modeVenteId?: string) => void;
  onUpdateQuantity: (articleId: string, quantity: number, modeVenteId?: string) => void;
  onCheckout: () => void;
}

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

export const CartDrawer = ({
  open,
  onOpenChange,
  items,
  subtotal,
  fraisLivraison,
  onRemove,
  onUpdateQuantity,
  onCheckout,
}: CartDrawerProps) => {
  const total = subtotal + fraisLivraison;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Votre panier ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-16 w-16 mb-4 opacity-50" />
            <p>Votre panier est vide</p>
          </div>
        ) : (
          <>
            {/* Liste des items */}
            <div className="flex-1 overflow-y-auto py-4">
              {items.map((item) => (
                <CartMobileItem
                  key={`${item.articleId}_${item.modeVenteId || ''}`}
                  item={item}
                  onRemove={() => onRemove(item.articleId, item.modeVenteId)}
                  onUpdateQuantity={(qty) => onUpdateQuantity(item.articleId, qty, item.modeVenteId)}
                  formatPrix={formatPrix}
                />
              ))}
            </div>

            {/* Totaux */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{formatPrix(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Livraison</span>
                <span>{formatPrix(fraisLivraison)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatPrix(total)}</span>
              </div>

              <Button
                className="w-full h-12 text-base font-semibold mt-4"
                onClick={onCheckout}
                disabled={items.length === 0}
              >
                Valider la commande
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

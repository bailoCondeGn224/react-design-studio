// src/components/storefront/CartMobileItem.tsx
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/types';
import { getPhotoUrl } from '@/lib/api-client';

interface CartMobileItemProps {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
  formatPrix: (prix: number) => string;
}

export const CartMobileItem = ({ item, onRemove, onUpdateQuantity, formatPrix }: CartMobileItemProps) => {
  const photoUrl = getPhotoUrl(item.articlePhoto);

  // Calculer la quantité réelle d'articles
  const quantiteReelle = item.quantiteStock && item.quantiteStock > 1
    ? item.quantity * item.quantiteStock
    : item.quantity;

  return (
    <div className="flex gap-3 py-3 border-b last:border-0">
      {/* Image */}
      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 flex-shrink-0 overflow-hidden">
        {photoUrl ? (
          <img src={photoUrl} alt={item.articleNom} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            Photo
          </div>
        )}
      </div>

      {/* Détails */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.articleNom}</p>
        {item.modeVenteNom && (
          <p className="text-xs text-muted-foreground">{item.modeVenteNom}</p>
        )}
        <p className="text-sm text-primary font-semibold mt-1">
          {formatPrix(item.prixUnitaire)}
        </p>

        {/* Quantité */}
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(item.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="min-w-12 text-center font-medium text-sm">
            {item.quantiteStock && item.quantiteStock > 1 ? (
              <span className="flex flex-col leading-tight">
                <span>{item.quantity} lot{item.quantity > 1 ? 's' : ''}</span>
                <span className="text-xs text-muted-foreground">({quantiteReelle})</span>
              </span>
            ) : (
              <span>{item.quantity}</span>
            )}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 ml-auto text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// src/components/storefront/CartMobileItem.tsx
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/types';

interface CartMobileItemProps {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
  formatPrix: (prix: number) => string;
}

export const CartMobileItem = ({ item, onRemove, onUpdateQuantity, formatPrix }: CartMobileItemProps) => {
  return (
    <div className="flex gap-3 py-3 border-b last:border-0">
      {/* Image */}
      <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
        {item.articlePhoto ? (
          <img src={item.articlePhoto} alt={item.articleNom} className="w-full h-full object-cover" />
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
          <span className="w-8 text-center font-medium">{item.quantity}</span>
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

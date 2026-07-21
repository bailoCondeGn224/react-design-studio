// src/components/storefront/ProductMobileCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StorefrontArticle } from '@/types';
import { ShoppingCart, ImageOff } from 'lucide-react';
import { getPhotoUrl } from '@/lib/api-client';

interface ProductMobileCardProps {
  article: StorefrontArticle;
  onAddToCart: (article: StorefrontArticle) => void;
  onClick: () => void;
  formatPrix: (prix: number) => string;
}

export const ProductMobileCard = ({ article, onAddToCart, onClick, formatPrix }: ProductMobileCardProps) => {
  const photoUrl = getPhotoUrl(article.photo);
  const isOutOfStock = article.stock <= 0;

  return (
    <Card className="overflow-hidden" onClick={onClick}>
      <CardContent className="p-0">
        {/* Image */}
        <div className="aspect-[4/3] bg-muted relative">
          {photoUrl ? (
            <img src={photoUrl} alt={article.nom} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">Rupture de stock</span>
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="p-4">
          <h3 className="font-medium text-sm line-clamp-2 mb-1">{article.nom}</h3>
          <p className="text-lg font-bold text-primary mb-1">{formatPrix(article.prixEnLigne)}</p>
          {!isOutOfStock && (
            <p className="text-xs text-muted-foreground mb-3">Stock: {article.stock} disponibles</p>
          )}

          <Button
            className="w-full h-12"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(article);
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Ajouter au panier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

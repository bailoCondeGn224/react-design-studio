// src/components/storefront/ProductMobileCard.tsx
import { StorefrontArticle } from '@/types';
import { ShoppingCart, ImageOff, AlertCircle, Package } from 'lucide-react';
import { getPhotoUrl } from '@/lib/api-client';

interface ProductMobileCardProps {
  article: StorefrontArticle;
  onClick: () => void;
  formatPrix: (prix: number) => string;
}

export const ProductMobileCard = ({ article, onClick, formatPrix }: ProductMobileCardProps) => {
  const photoUrl = getPhotoUrl(article.photo);
  const isOutOfStock = article.stock <= 0;

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 border border-border hover:border-primary/30 active:scale-[0.98]">
      {/* IMAGE - Style Post Facebook (pleine largeur, edge-to-edge) */}
      <div
        className="relative w-full aspect-square bg-muted cursor-pointer overflow-hidden group"
        onClick={onClick}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={article.nom}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}

        {/* Badge Rupture de Stock - Overlay en haut à droite */}
        {isOutOfStock && (
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-bold shadow-lg flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            RUPTURE
          </div>
        )}

        {/* Badge Stock Faible - si stock < 10 */}
        {!isOutOfStock && article.stock < 10 && (
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-warning text-warning-foreground text-xs font-bold shadow-lg">
            Stock: {article.stock}
          </div>
        )}

        {/* Badge Catégorie - Overlay en haut à gauche */}
        {article.categorie && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-card/90 backdrop-blur-sm text-[10px] font-medium text-foreground shadow-md">
            {article.categorie}
          </div>
        )}
      </div>

      {/* INFORMATIONS - Style Post Facebook */}
      <div className="p-4 space-y-3">
        {/* Titre */}
        <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-tight">
          {article.nom}
        </h3>

        {/* Prix - Layout adaptatif */}
        <div className="flex items-center justify-between">
          {/* Prix Principal */}
          <div className="flex-1">
            <span className="text-lg font-black text-primary block">
              {formatPrix(article.prixEnLigne || 0)}
            </span>
            {article.prixOriginal && article.prixOriginal > (article.prixEnLigne || 0) && (
              <p className="text-[10px] text-muted-foreground line-through">
                {formatPrix(article.prixOriginal)}
              </p>
            )}
          </div>

          {/* Badge Stock Disponible */}
          {!isOutOfStock && article.stock >= 10 && (
            <div className="px-2 py-1 rounded-lg bg-success/10 border border-success/20">
              <span className="text-xs font-semibold text-success">
                Disponible
              </span>
            </div>
          )}
        </div>

        {/* Prix en Gros - Si disponible */}
        {article.modesVente && article.modesVente.length > 0 && (
          <div className="pt-1.5 border-t border-border">
            <p className="text-[10px] text-muted-foreground mb-1">Vente en gros:</p>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-primary">
                {formatPrix(article.modesVente[0].prix)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Min. {Math.floor(article.modesVente[0].quantiteStock)}+ unités
              </span>
            </div>
          </div>
        )}

        {/* Bouton Commander - Une ligne avec icône */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          disabled={isOutOfStock}
          className={`w-full h-9 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            isOutOfStock
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground active:scale-95 shadow-sm hover:shadow-md'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {isOutOfStock ? 'Rupture de stock' : 'Commander'}
        </button>
      </div>
    </div>
  );
};

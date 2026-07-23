// src/components/storefront/ProductMobileCard.tsx
import { StorefrontArticle } from '@/types';
import { ShoppingCart, ImageOff } from 'lucide-react';
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
    <div
      className="group bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Image container - aspect ratio carré pour plus de visibilité */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={article.nom}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-200/50 flex items-center justify-center">
              <ImageOff className="h-8 w-8 text-gray-300" />
            </div>
          </div>
        )}

        {/* Badge rupture de stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full border border-red-100">
              Rupture
            </span>
          </div>
        )}

        {/* Badge catégorie */}
        {article.categorie && !isOutOfStock && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm text-[10px] font-medium rounded text-white">
              {article.categorie}
            </span>
          </div>
        )}

        {/* Bouton panier sur l'image */}
        <button
          className={`
            absolute bottom-2 right-2 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 shadow-lg
            ${isOutOfStock
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/90 active:scale-95'
            }
          `}
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            if (!isOutOfStock) onClick();
          }}
          aria-label="Commander"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>

      {/* Infos produit - compact */}
      <div className="px-2 py-2">
        <h3 className="font-medium text-sm text-gray-900 line-clamp-1 leading-tight mb-1">
          {article.nom}
        </h3>

        <div className="space-y-0.5">
          <p className="text-base font-bold text-primary">
            {formatPrix(article.prixEnLigne || 0)}
          </p>

          {/* Prix en gros si disponible */}
          {article.modesVente && article.modesVente.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <span className="font-medium">Gros:</span>
              <span className="font-bold text-gray-700">{formatPrix(article.modesVente[0].prix)}</span>
              <span>• {Math.floor(article.modesVente[0].quantiteStock)}+</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

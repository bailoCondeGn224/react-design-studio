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
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 active:scale-[0.98]">
      {/* IMAGE - Style Post Facebook (pleine largeur, edge-to-edge) */}
      <div
        className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer overflow-hidden group"
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
            <Package className="w-16 h-16 text-gray-300/50" />
          </div>
        )}

        {/* Badge Rupture de Stock - Overlay en haut à droite */}
        {isOutOfStock && (
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            RUPTURE
          </div>
        )}

        {/* Badge Stock Faible - si stock < 10 */}
        {!isOutOfStock && article.stock < 10 && (
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-orange-500 text-white text-xs font-bold shadow-lg">
            Stock: {article.stock}
          </div>
        )}

        {/* Badge Catégorie - Overlay en haut à gauche */}
        {article.categorie && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-medium text-gray-700 shadow-md">
            {article.categorie}
          </div>
        )}
      </div>

      {/* INFORMATIONS - Style Post Facebook */}
      <div className="p-3 space-y-2.5">
        {/* Titre */}
        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight">
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
              <p className="text-[10px] text-gray-400 line-through">
                {formatPrix(article.prixOriginal)}
              </p>
            )}
          </div>

          {/* Badge Stock Disponible */}
          {!isOutOfStock && article.stock >= 10 && (
            <div className="px-2 py-1 rounded-lg bg-green-50 border border-green-200">
              <span className="text-xs font-semibold text-green-600">
                Disponible
              </span>
            </div>
          )}
        </div>

        {/* Prix en Gros - Si disponible */}
        {article.modesVente && article.modesVente.length > 0 && (
          <div className="pt-1.5 border-t border-gray-100">
            <p className="text-[10px] text-gray-500 mb-1">Vente en gros:</p>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-primary">
                {formatPrix(article.modesVente[0].prix)}
              </span>
              <span className="text-[10px] text-gray-500">
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
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary hover:bg-primary/90 text-white active:scale-95 shadow-sm hover:shadow-md'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {isOutOfStock ? 'Rupture de stock' : 'Commander'}
        </button>
      </div>
    </div>
  );
};

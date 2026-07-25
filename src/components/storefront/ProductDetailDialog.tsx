// src/components/storefront/ProductDetailDialog.tsx
import { useState } from 'react';
import { X, ShoppingCart, ImageOff, Plus, Minus, Check, ZoomIn } from 'lucide-react';
import { StorefrontArticle } from '@/types';
import { getPhotoUrl } from '@/lib/api-client';
import { toast } from 'sonner';
import { ImageZoomDialog } from './ImageZoomDialog';

interface ProductDetailDialogProps {
  article: StorefrontArticle;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (article: StorefrontArticle, quantity: number, modeVente?: { id: string; nom: string; prix: number; quantiteStock: number }) => void;
  formatPrix: (prix: number) => string;
}

export const ProductDetailDialog = ({
  article,
  isOpen,
  onClose,
  onAddToCart,
  formatPrix
}: ProductDetailDialogProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedModeId, setSelectedModeId] = useState<string | null>(null);
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);

  if (!isOpen) return null;

  const photoUrl = getPhotoUrl(article.photo);
  const isOutOfStock = article.stock <= 0;
  const maxQuantity = Math.min(article.stock, 10);

  const selectedMode = article.modesVente?.find(m => m.id === selectedModeId);
  const currentPrice = selectedMode?.prix || article.prixEnLigne || 0;

  const handleAddToCart = () => {
    onAddToCart(article, quantity, selectedMode);
    toast.success(`${quantity}x ${article.nom} ajouté au panier`, {
      duration: 2000,
      position: 'bottom-center',
    });
    setQuantity(1);
    setSelectedModeId(null);
    onClose();
  };

  const incrementQuantity = () => {
    if (quantity < maxQuantity) setQuantity(q => q + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Dialog - Bottom sheet mobile-first */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 ease-out">
        {/* Drag handle indicator */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Product Image - Full width, compact */}
          <div className="relative bg-white px-4 pt-2 pb-4">
            <div
              className="w-full aspect-square max-h-[320px] bg-gradient-to-br from-gray-50 to-white rounded-xl overflow-hidden flex items-center justify-center relative cursor-zoom-in group"
              onClick={() => photoUrl && setIsImageZoomOpen(true)}
            >
              {photoUrl ? (
                <>
                  <img
                    src={photoUrl}
                    alt={article.nom}
                    className="w-full h-full object-contain"
                  />
                  {/* Zoom indicator */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                      <ZoomIn className="h-6 w-6 text-gray-900" strokeWidth={2.5} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                  <ImageOff className="h-10 w-10 text-gray-300" />
                </div>
              )}

              {/* Category badge over image */}
              {article.categorie && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-md">
                    {article.categorie}
                  </span>
                </div>
              )}

              {/* Out of stock overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="px-5 py-2.5 bg-red-50 border-2 border-red-200 rounded-xl">
                    <span className="text-red-600 font-bold text-sm">Rupture de stock</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Info - Compact */}
          <div className="px-4 pb-6 space-y-3">
            {/* Title and price together */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">
                {article.nom}
              </h2>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">
                  {formatPrix(currentPrice)}
                </span>
                {article.prixOriginal && article.prixOriginal > currentPrice && (
                  <span className="text-base text-gray-400 line-through">
                    {formatPrix(article.prixOriginal)}
                  </span>
                )}
              </div>
            </div>

            {/* Stock badge inline */}
            {!isOutOfStock && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-green-700 font-medium">En stock</span>
              </div>
            )}

            {/* Wholesale options - compact */}
            {article.modesVente && article.modesVente.length > 0 && (
              <div className="space-y-2 pt-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vente en gros</h3>
                <div className="space-y-1.5">
                  {article.modesVente.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedModeId(selectedModeId === mode.id ? null : mode.id)}
                      className={`relative w-full p-3 rounded-lg border transition-all duration-200 text-left active:scale-[0.98] ${
                        selectedModeId === mode.id
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      {selectedModeId === mode.id && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                        </div>
                      )}
                      <div className="flex items-center justify-between pr-5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-gray-500">{mode.nom}</span>
                          <span className="text-primary font-bold text-sm">{formatPrix(mode.prix)}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-600">{Math.floor(mode.quantiteStock)}+ unités</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description if exists */}
            {article.description && (
              <div className="space-y-1.5 pt-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {article.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Bottom CTA - Always visible, no scroll needed */}
        {!isOutOfStock && (
          <div className="border-t border-gray-200 bg-white p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="flex items-stretch gap-2">
              {/* Compact quantity selector */}
              <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                <button
                  className="w-10 h-12 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-all duration-150 disabled:opacity-30"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4 text-gray-700" strokeWidth={2.5} />
                </button>
                <span className="w-8 text-center font-bold text-gray-900 text-sm">{quantity}</span>
                <button
                  className="w-10 h-12 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-all duration-150 disabled:opacity-30"
                  onClick={incrementQuantity}
                  disabled={quantity >= maxQuantity}
                >
                  <Plus className="h-4 w-4 text-gray-700" strokeWidth={2.5} />
                </button>
              </div>

              {/* Add to cart - prominent */}
              <button
                className="flex-1 h-12 flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/95 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" strokeWidth={2.5} />
                <span className="text-sm">Ajouter • {formatPrix(currentPrice * quantity)}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Zoom Dialog */}
      <ImageZoomDialog
        imageUrl={photoUrl}
        isOpen={isImageZoomOpen}
        onClose={() => setIsImageZoomOpen(false)}
        productName={article.nom}
      />
    </>
  );
};

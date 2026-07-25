// src/pages/storefront/StorefrontProduct.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
import { useStorefrontProduct } from '@/hooks/useStorefront';
import { useCart } from '@/hooks/useCart';
import { ArrowLeft, ShoppingCart, ImageOff, Loader2, Plus, Minus, Package, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getPhotoUrl } from '@/lib/api-client';

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

const StorefrontProduct = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart(slug || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedModeId, setSelectedModeId] = useState<string | null>(null);

  const { data: article, isLoading } = useStorefrontProduct(slug || '', id || '');

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="min-h-screen bg-white flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
          <p className="text-sm text-gray-500">Chargement du produit...</p>
        </div>
      </StorefrontLayout>
    );
  }

  if (!article) {
    return (
      <StorefrontLayout>
        <div className="min-h-screen bg-white flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-5">
            <Package className="h-12 w-12 text-gray-300" />
          </div>
          <h2 className="font-semibold text-xl text-gray-900 mb-2">Produit introuvable</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Ce produit n'existe pas ou n'est plus disponible
          </p>
          <button
            onClick={() => navigate(`/b/${slug}`)}
            className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
          >
            Retour au catalogue
          </button>
        </div>
      </StorefrontLayout>
    );
  }

  const photoUrl = getPhotoUrl(article.photo);
  const isOutOfStock = article.stock <= 0;
  const maxQuantity = Math.min(article.stock, 10);

  const selectedMode = article.modesVente?.find(m => m.id === selectedModeId);
  const currentPrice = selectedMode?.prix || article.prixEnLigne || 0;

  const handleAddToCart = () => {
    addItem(article, quantity, selectedMode);
    toast.success(`${quantity}x ${article.nom} ajouté au panier`, {
      duration: 2000,
      position: 'bottom-center',
    });
    setQuantity(1);
    setSelectedModeId(null);
  };

  const incrementQuantity = () => {
    if (quantity < maxQuantity) setQuantity(q => q + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  return (
    <StorefrontLayout>
      <div className="min-h-screen bg-white pb-36">
        {/* Header with back button */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center h-14 px-4">
            <button
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors -ml-1 px-2 py-1.5 rounded-lg hover:bg-gray-100"
              onClick={() => navigate(`/b/${slug}`)}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour</span>
            </button>
          </div>
        </div>

        {/* Product Image */}
        <div className="relative bg-gradient-to-b from-gray-50 to-white">
          <div className="aspect-square max-h-[400px] flex items-center justify-center p-6">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={article.nom}
                className="max-w-full max-h-full object-contain drop-shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                <ImageOff className="h-16 w-16 text-gray-300" />
              </div>
            )}
          </div>

          {/* Category Badge */}
          {article.categorie && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 bg-white shadow-sm text-xs font-medium rounded-full text-gray-700 border border-gray-100">
                {article.categorie}
              </span>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] flex items-center justify-center">
              <div className="px-6 py-3 bg-red-50 border border-red-100 rounded-full">
                <span className="text-red-600 font-semibold">Rupture de stock</span>
              </div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="px-5 py-6 space-y-6">
          {/* Title & Price */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {article.nom}
            </h1>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary tracking-tight">
                {formatPrix(currentPrice)}
              </span>
              {article.prixOriginal && article.prixOriginal > currentPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrix(article.prixOriginal)}
                </span>
              )}
            </div>
          </div>

          {/* Stock Status */}
          {!isOutOfStock ? (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-green-50 rounded-xl">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-700 font-medium">
                En stock
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 rounded-xl">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-sm text-red-700 font-medium">
                Rupture de stock
              </span>
            </div>
          )}

          {/* Vente en gros si disponible */}
          {article.modesVente && article.modesVente.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-900">Vente en gros</h2>
              <div className="space-y-2">
                {article.modesVente.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedModeId(selectedModeId === mode.id ? null : mode.id)}
                    className={`relative w-full p-4 rounded-xl border-2 transition-all duration-200 text-left active:scale-[0.98] ${
                      selectedModeId === mode.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {selectedModeId === mode.id && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="flex items-baseline justify-between pr-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{mode.nom}</p>
                        <p className="text-primary font-bold text-lg">{formatPrix(mode.prix)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Quantité min.</p>
                        <p className="font-bold text-gray-900">{Math.floor(mode.quantiteStock)}+</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {article.description && (
            <div className="space-y-2 pt-2">
              <h2 className="font-semibold text-gray-900">Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {article.description}
              </p>
            </div>
          )}
        </div>

        {/* Fixed Bottom Action Bar */}
        {!isOutOfStock && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <div className="p-5 max-w-lg mx-auto">
              <div className="flex items-center gap-3">
                {/* Quantity Selector */}
                <div className="flex items-center bg-gray-100 rounded-xl">
                  <button
                    className="w-12 h-12 flex items-center justify-center rounded-l-xl hover:bg-gray-200 active:bg-gray-300 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4 text-gray-700" />
                  </button>
                  <span className="w-10 text-center font-bold text-gray-900">{quantity}</span>
                  <button
                    className="w-12 h-12 flex items-center justify-center rounded-r-xl hover:bg-gray-200 active:bg-gray-300 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={incrementQuantity}
                    disabled={quantity >= maxQuantity}
                  >
                    <Plus className="h-4 w-4 text-gray-700" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  className="flex-1 h-12 flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Ajouter • {formatPrix(currentPrice * quantity)}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
};

export default StorefrontProduct;

// src/pages/storefront/StorefrontProduct.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
import { useStorefrontProduct } from '@/hooks/useStorefront';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, ImageOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getPhotoUrl } from '@/lib/api-client';

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

const StorefrontProduct = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart(slug || '');

  const { data: article, isLoading } = useStorefrontProduct(slug || '', id || '');

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StorefrontLayout>
    );
  }

  if (!article) {
    return (
      <StorefrontLayout>
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Produit introuvable</p>
          <Button variant="link" onClick={() => navigate(`/b/${slug}`)}>
            Retour au catalogue
          </Button>
        </div>
      </StorefrontLayout>
    );
  }

  const photoUrl = getPhotoUrl(article.photo);
  const isOutOfStock = article.stock <= 0;

  const handleAddToCart = () => {
    addItem(article);
    toast.success(`${article.nom} ajouté au panier`);
  };

  return (
    <StorefrontLayout>
      <div>
        {/* Bouton retour */}
        <Button
          variant="ghost"
          className="m-4"
          onClick={() => navigate(`/b/${slug}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        {/* Image */}
        <div className="aspect-square bg-muted relative">
          {photoUrl ? (
            <img src={photoUrl} alt={article.nom} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* Détails */}
        <div className="p-4 space-y-4">
          <div>
            <h1 className="text-xl font-bold">{article.nom}</h1>
            {article.categorie && (
              <p className="text-sm text-muted-foreground">{article.categorie}</p>
            )}
          </div>

          <p className="text-2xl font-bold text-primary">
            {formatPrix(article.prixEnLigne || article.prixOriginal || 0)}
          </p>

          {!isOutOfStock ? (
            <p className="text-sm text-muted-foreground">
              {article.stock} en stock
            </p>
          ) : (
            <p className="text-sm text-destructive font-medium">Rupture de stock</p>
          )}

          {article.description && (
            <div>
              <h2 className="font-medium mb-1">Description</h2>
              <p className="text-sm text-muted-foreground">{article.description}</p>
            </div>
          )}

          <Button
            className="w-full h-14 text-base"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Ajouter au panier
          </Button>
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default StorefrontProduct;

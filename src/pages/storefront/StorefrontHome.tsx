// src/pages/storefront/StorefrontHome.tsx
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
import { StorefrontSearch } from '@/components/storefront/StorefrontSearch';
import { CategoryFilter } from '@/components/storefront/CategoryFilter';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { useStorefrontProducts, useStorefrontCategories } from '@/hooks/useStorefront';
import { useCart } from '@/hooks/useCart';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { StorefrontArticle } from '@/types';

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

const StorefrontHome = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { addItem } = useCart(slug || '');

  const { data: productsData, isLoading: loadingProducts } = useStorefrontProducts(slug || '', {
    search: debouncedSearch || undefined,
    categorieId: categoryId || undefined,
  });

  const { data: categories = [] } = useStorefrontCategories(slug || '');

  const articles = useMemo(() => productsData?.data || [], [productsData]);

  const handleAddToCart = (article: StorefrontArticle) => {
    addItem(article);
    toast.success(`${article.nom} ajouté au panier`);
  };

  return (
    <StorefrontLayout>
      <div className="p-4 space-y-4">
        <StorefrontSearch value={search} onChange={setSearch} />

        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            selected={categoryId}
            onSelect={setCategoryId}
          />
        )}

        {loadingProducts ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ProductGrid
            articles={articles}
            onAddToCart={handleAddToCart}
            onProductClick={(id) => navigate(`/b/${slug}/product/${id}`)}
            formatPrix={formatPrix}
          />
        )}
      </div>
    </StorefrontLayout>
  );
};

export default StorefrontHome;

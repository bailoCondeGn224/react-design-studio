// src/components/storefront/ProductGrid.tsx
import { StorefrontArticle } from '@/types';
import { ProductMobileCard } from './ProductMobileCard';

interface ProductGridProps {
  articles: StorefrontArticle[];
  onAddToCart: (article: StorefrontArticle) => void;
  onProductClick: (articleId: string) => void;
  formatPrix: (prix: number) => string;
}

export const ProductGrid = ({ articles, onAddToCart, onProductClick, formatPrix }: ProductGridProps) => {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucun produit trouvé
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {articles.map((article) => (
        <ProductMobileCard
          key={article.id}
          article={article}
          onAddToCart={onAddToCart}
          onClick={() => onProductClick(article.id)}
          formatPrix={formatPrix}
        />
      ))}
    </div>
  );
};

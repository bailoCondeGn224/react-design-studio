// src/components/storefront/ProductGrid.tsx
import { StorefrontArticle } from '@/types';
import { ProductMobileCard } from './ProductMobileCard';

interface ProductGridProps {
  articles: StorefrontArticle[];
  onProductClick: (articleId: string) => void;
  formatPrix: (prix: number) => string;
}

export const ProductGrid = ({ articles, onProductClick, formatPrix }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {articles.map((article) => (
        <ProductMobileCard
          key={article.id}
          article={article}
          onClick={() => onProductClick(article.id)}
          formatPrix={formatPrix}
        />
      ))}
    </div>
  );
};

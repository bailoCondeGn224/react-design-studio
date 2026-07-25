// src/pages/storefront/StorefrontHome.tsx
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { ProductDetailDialog } from '@/components/storefront/ProductDetailDialog';
import { useStorefrontProducts, useStorefrontCategories } from '@/hooks/useStorefront';
import { useCartContext } from '@/contexts/CartContext';
import { Loader2, Search, ChevronDown, Package, X } from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { StorefrontArticle } from '@/types';

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

const StorefrontHomeContent = () => {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<StorefrontArticle | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { addItem } = useCartContext();

  const { data: productsData, isLoading: loadingProducts } = useStorefrontProducts(slug || '', {
    search: debouncedSearch || undefined,
    categorieId: categoryId !== 'all' ? categoryId : undefined,
  });

  const { data: categories = [] } = useStorefrontCategories(slug || '');

  const articles = useMemo(() => productsData?.data || [], [productsData]);

  const selectedCategory = categories.find(c => c.id === categoryId);

  const handleAddToCart = (article: StorefrontArticle, quantity: number = 1, modeVente?: { id: string; nom: string; prix: number; quantiteStock: number }) => {
    addItem(article, quantity, modeVente);
    toast.success(`${quantity > 1 ? `${quantity}x ` : ''}${article.nom} ajouté au panier`, {
      duration: 2000,
      position: 'bottom-center',
    });
    // Ne pas ouvrir le panier automatiquement
    // Le client cliquera sur l'icône panier dans le header quand il aura fini ses achats
  };

  const handleProductClick = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (article) {
      setSelectedArticle(article);
    }
  };

  const handleCategorySelect = (id: string) => {
    setCategoryId(id);
    setIsCategoryOpen(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Search & Filter Section */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="px-2 py-2 space-y-2">
            {/* Search Bar with integrated Category Dropdown */}
            <div className="flex gap-2">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-8 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-200"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="h-3 w-3 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Category Dropdown */}
              {categories.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className={`h-10 px-3 flex items-center gap-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      categoryId !== 'all'
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="max-w-[80px] truncate">
                      {selectedCategory?.nom || 'Catégorie'}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isCategoryOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsCategoryOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[60vh] overflow-y-auto">
                        <button
                          onClick={() => handleCategorySelect('all')}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150 ${
                            categoryId === 'all' ? 'text-primary font-medium bg-primary/5' : 'text-gray-700'
                          }`}
                        >
                          Toutes
                        </button>
                        <div className="h-px bg-gray-100 my-0.5" />
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat.id)}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150 ${
                              categoryId === cat.id ? 'text-primary font-medium bg-primary/5' : 'text-gray-700'
                            }`}
                          >
                            {cat.nom}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Results Count & Active Filter */}
            <div className="flex items-center justify-between">
              {!loadingProducts && (
                <p className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">{articles.length}</span> produit{articles.length > 1 ? 's' : ''}
                </p>
              )}

              {/* Active filter chip */}
              {categoryId !== 'all' && selectedCategory && (
                <button
                  onClick={() => setCategoryId('all')}
                  className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-[10px] font-medium rounded-full hover:bg-primary/20 transition-colors"
                >
                  {selectedCategory.nom}
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Content */}
        <div className="px-2 py-3">
          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
              <p className="text-sm text-gray-500">Chargement des produits...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Aucun produit trouvé</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                {search || categoryId !== 'all'
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Aucun produit n\'est disponible pour le moment'}
              </p>
              {(search || categoryId !== 'all') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setCategoryId('all');
                  }}
                  className="mt-4 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <ProductGrid
              articles={articles}
              onProductClick={handleProductClick}
              formatPrix={formatPrix}
            />
          )}
        </div>
      </div>

      {/* Product Detail Dialog */}
      {selectedArticle && (
        <ProductDetailDialog
          article={selectedArticle}
          isOpen={!!selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onAddToCart={handleAddToCart}
          formatPrix={formatPrix}
        />
      )}
    </>
  );
};

const StorefrontHome = () => {
  return (
    <StorefrontLayout>
      <StorefrontHomeContent />
    </StorefrontLayout>
  );
};

export default StorefrontHome;

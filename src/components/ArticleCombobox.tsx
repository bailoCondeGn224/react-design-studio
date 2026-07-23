import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useStock } from '@/hooks/useStock';

interface Article {
  id: string;
  nom: string;
  stock: number;
  seuilAlerte?: number;
  prixVente?: number;
  prixAchat?: number;
  fournisseurPrefereNom?: string;
  uniteStock?: string;
  modesVente?: Array<{
    id: string;
    nom: string;
    quantiteStock: number;
    prixVente: number;
    parDefaut: boolean;
  }>;
}

interface ArticleComboboxProps {
  value: string;
  onChange: (article: Article | null) => void;
  placeholder?: string;
  disabled?: boolean;
  showPrice?: boolean;
  priceType?: 'vente' | 'achat';
  excludeIds?: string[];
  checkStock?: boolean;
  // Article pré-sélectionné (pour afficher même si pas dans la liste)
  preselectedArticle?: Article | null;
}

const ArticleCombobox = ({
  value,
  onChange,
  placeholder = 'Sélectionner un article...',
  disabled = false,
  showPrice = true,
  priceType = 'vente',
  excludeIds = [],
  checkStock = false,
  preselectedArticle = null,
}: ArticleComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Détecter si mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Charger les articles avec recherche
  const { data: articlesResponse, isLoading } = useStock({
    page: 1,
    limit: 20,
    search: debouncedSearch || undefined,
  });

  const articles = articlesResponse?.data || [];

  const formatPrix = (montant: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    })
      .format(montant)
      .replace('GNF', 'GNF');
  };

  // Trouver l'article sélectionné - utiliser preselectedArticle si fourni, sinon chercher dans la liste
  const selectedArticle = preselectedArticle && preselectedArticle.id === value
    ? preselectedArticle
    : articles.find((a) => a.id === value);

  // Filtrer les articles déjà sélectionnés
  const filteredArticles = articles.filter((article) => !excludeIds.includes(article.id));

  const handleSelectArticle = (article: Article) => {
    onChange(article);
    setOpen(false);
    setSearch('');
  };

  // Bouton trigger commun
  const TriggerButton = (
    <Button
      type="button"
      variant="outline"
      role="combobox"
      aria-expanded={open}
      disabled={disabled}
      onClick={() => setOpen(true)}
      className="w-full justify-between text-left font-normal h-auto min-h-[48px] px-4 py-3"
    >
      <span className="truncate text-sm">
        {selectedArticle ? (
          <span className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{selectedArticle.nom}</span>
            {showPrice && (
              <span className="text-muted-foreground text-xs">
                {formatPrix(
                  priceType === 'vente'
                    ? (selectedArticle.modesVente?.find(m => m.parDefaut)?.prixVente || selectedArticle.prixVente || 0)
                    : selectedArticle.prixAchat || 0
                )}
                {selectedArticle.modesVente && selectedArticle.modesVente.length > 1 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                    +{selectedArticle.modesVente.length - 1}
                  </span>
                )}
              </span>
            )}
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </span>
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  // Version Mobile: Sheet
  if (isMobile) {
    return (
      <>
        {TriggerButton}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="h-[85vh] flex flex-col p-0">
            <SheetHeader className="px-4 py-4 border-b border-border flex-shrink-0">
              <SheetTitle className="text-lg font-semibold text-center">Sélectionner un article</SheetTitle>
              <div className="mx-auto w-12 h-1 bg-muted-foreground/20 rounded-full -mt-2" />
            </SheetHeader>

            <div className="px-4 py-3 border-b border-border flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12 text-base"
                  autoFocus
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Search className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">Aucun article trouvé</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredArticles.map((article) => {
                    const isSelected = value === article.id;
                    const enRupture = checkStock && article.stock === 0;
                    const stockFaible =
                      checkStock &&
                      article.stock > 0 &&
                      article.seuilAlerte &&
                      article.stock <= article.seuilAlerte;
                    const prix = priceType === 'vente' ? article.prixVente || 0 : article.prixAchat || 0;

                    return (
                      <button
                        key={article.id}
                        onClick={() => !enRupture && handleSelectArticle(article)}
                        disabled={enRupture}
                        className={`w-full px-4 py-4 flex items-start gap-3 transition-colors ${
                          enRupture
                            ? 'opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'bg-primary/5 active:bg-primary/10'
                            : 'hover:bg-accent/5 active:bg-accent/10'
                        }`}
                      >
                        <Check
                          className={cn(
                            'w-5 h-5 shrink-0 mt-0.5',
                            isSelected ? 'text-primary opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`font-semibold text-base ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                              {article.nom}
                            </span>
                            {checkStock && (
                              <span
                                className={cn(
                                  'text-xs px-2 py-1 rounded-full font-medium',
                                  enRupture
                                    ? 'bg-destructive/10 text-destructive'
                                    : stockFaible
                                    ? 'bg-warning/10 text-warning'
                                    : 'bg-success/10 text-success'
                                )}
                              >
                                {enRupture ? 'RUPTURE' : `Stock: ${article.stock}`}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                            {!checkStock && <span>Stock: {article.stock}</span>}
                            {showPrice && (
                              <span className="font-medium text-primary">
                                {formatPrix(article.modesVente?.find(m => m.parDefaut)?.prixVente || prix)}
                                {article.modesVente && article.modesVente.length > 1 && (
                                  <span className="ml-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
                                    +{article.modesVente.length - 1} modes
                                  </span>
                                )}
                              </span>
                            )}
                            {article.fournisseurPrefereNom && (
                              <span className="text-xs">Fournisseur: {article.fournisseurPrefereNom}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Version Desktop: Popover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {TriggerButton}
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Rechercher un article..."
            value={search}
            onValueChange={setSearch}
          />
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Aucun article trouvé.
            </div>
          ) : (
            <>
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {filteredArticles.map((article) => {
                  const enRupture = checkStock && article.stock === 0;
                  const stockFaible =
                    checkStock &&
                    article.stock > 0 &&
                    article.seuilAlerte &&
                    article.stock <= article.seuilAlerte;
                  const prix =
                    priceType === 'vente' ? article.prixVente || 0 : article.prixAchat || 0;

                  return (
                    <div
                      key={article.id}
                      onClick={() => !enRupture && handleSelectArticle(article)}
                      className={cn(
                        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                        enRupture && 'opacity-50 cursor-not-allowed pointer-events-none',
                        value === article.id && 'bg-accent'
                      )}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4 shrink-0',
                          value === article.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{article.nom}</span>
                          {checkStock && (
                            <span
                              className={cn(
                                'text-xs px-1.5 py-0.5 rounded',
                                enRupture
                                  ? 'bg-destructive/10 text-destructive'
                                  : stockFaible
                                  ? 'bg-warning/10 text-warning'
                                  : 'bg-success/10 text-success'
                              )}
                            >
                              {enRupture ? 'RUPTURE' : `Stock: ${article.stock}`}
                            </span>
                          )}
                          {!checkStock && (
                            <span className="text-xs text-muted-foreground">Stock: {article.stock}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          {showPrice && (
                            <span className="flex items-center gap-1">
                              {formatPrix(article.modesVente?.find(m => m.parDefaut)?.prixVente || prix)}
                              {article.modesVente && article.modesVente.length > 1 && (
                                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs">
                                  +{article.modesVente.length - 1}
                                </span>
                              )}
                            </span>
                          )}
                          {article.fournisseurPrefereNom && (
                            <span className="text-primary">Fournisseur: {article.fournisseurPrefereNom}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ArticleCombobox;

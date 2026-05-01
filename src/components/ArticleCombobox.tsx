import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useStock } from '@/hooks/useStock';

interface Article {
  id: string;
  nom: string;
  stock: number;
  seuilAlerte?: number;
  prixVente?: number;
  prixAchat?: number;
  fournisseurPrefereNom?: string;
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
}: ArticleComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

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

  // Trouver l'article sélectionné (peut ne pas être dans la liste actuelle si recherche active)
  const selectedArticle = articles.find((a) => a.id === value);

  // Filtrer les articles déjà sélectionnés
  const filteredArticles = articles.filter((article) => !excludeIds.includes(article.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between text-left font-normal h-auto min-h-[42px] px-3 py-2"
        >
          <span className="truncate text-sm">
            {selectedArticle ? (
              <span className="flex items-center gap-2">
                <span>{selectedArticle.nom}</span>
                {showPrice && (
                  <span className="text-muted-foreground text-xs">
                    {formatPrix(
                      priceType === 'vente'
                        ? selectedArticle.prixVente || 0
                        : selectedArticle.prixAchat || 0
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
          ) : (
            <>
              <CommandEmpty>Aucun article trouvé.</CommandEmpty>
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
                <CommandItem
                  key={article.id}
                  value={article.nom}
                  disabled={enRupture}
                  onSelect={() => {
                    onChange(article);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={cn('cursor-pointer', enRupture && 'opacity-50 cursor-not-allowed')}
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
                      {showPrice && <span>{formatPrix(prix)}</span>}
                      {article.fournisseurPrefereNom && (
                        <span className="text-primary">Fournisseur: {article.fournisseurPrefereNom}</span>
                      )}
                    </div>
                  </div>
                </CommandItem>
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

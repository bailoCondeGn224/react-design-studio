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
import { useFournisseurs } from '@/hooks/useFournisseurs';

interface Fournisseur {
  id: string;
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  totalAchats?: number;
  dette?: number;
}

interface FournisseurComboboxProps {
  value: string;
  onChange: (fournisseur: Fournisseur | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const FournisseurCombobox = ({
  value,
  onChange,
  placeholder = 'Sélectionner un fournisseur...',
  disabled = false,
}: FournisseurComboboxProps) => {
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

  // Charger les fournisseurs avec recherche
  const { data: fournisseursResponse, isLoading } = useFournisseurs({
    page: 1,
    limit: 50,
    search: debouncedSearch || undefined,
  });

  const fournisseurs = fournisseursResponse?.data || [];

  const formatPrix = (montant: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    })
      .format(montant)
      .replace('GNF', 'GNF');
  };

  // Trouver le fournisseur sélectionné
  const selectedFournisseur = fournisseurs.find((f) => f.id === value);

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
            {selectedFournisseur ? (
              <span className="flex items-center gap-2">
                <span className="font-medium">{selectedFournisseur.nom} {selectedFournisseur.prenom}</span>
                {selectedFournisseur.telephone && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground text-xs">{selectedFournisseur.telephone}</span>
                  </>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[450px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Rechercher un fournisseur..."
            value={search}
            onValueChange={setSearch}
          />
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <CommandEmpty>Aucun fournisseur trouvé.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {fournisseurs.map((fournisseur) => (
                  <CommandItem
                    key={fournisseur.id}
                    value={`${fournisseur.nom} ${fournisseur.prenom} ${fournisseur.telephone || ''} ${fournisseur.email || ''}`}
                    onSelect={() => {
                      onChange(fournisseur);
                      setOpen(false);
                      setSearch('');
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 shrink-0',
                        value === fournisseur.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{fournisseur.nom} {fournisseur.prenom}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        {fournisseur.telephone && (
                          <>
                            <span>{fournisseur.telephone}</span>
                            <span>•</span>
                          </>
                        )}
                        {fournisseur.totalAchats !== undefined && (
                          <>
                            <span>Total achats: {formatPrix(fournisseur.totalAchats)}</span>
                          </>
                        )}
                        {fournisseur.dette !== undefined && fournisseur.dette > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-destructive">Dette: {formatPrix(fournisseur.dette)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default FournisseurCombobox;

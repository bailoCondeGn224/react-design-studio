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
import { useVentes } from '@/hooks/useVentes';

interface Vente {
  id: string;
  numero: string;
  nom: string;
  prenom: string;
  tel: string;
  total: number;
  date: string;
  lignes?: any[];
}

interface VenteComboboxProps {
  value: string;
  onChange: (vente: Vente | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const VenteCombobox = ({
  value,
  onChange,
  placeholder = 'Sélectionner une vente...',
  disabled = false,
}: VenteComboboxProps) => {
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

  // Charger les ventes avec recherche
  const { data: ventesResponse, isLoading } = useVentes({
    page: 1,
    limit: 50,
    search: debouncedSearch || undefined,
  });

  const ventes = ventesResponse?.data || [];

  const formatPrix = (montant: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    })
      .format(montant)
      .replace('GNF', 'GNF');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Trouver la vente sélectionnée
  const selectedVente = ventes.find((v) => v.id === value);

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
            {selectedVente ? (
              <span className="flex items-center gap-2">
                <span className="font-medium">{selectedVente.numero}</span>
                <span>-</span>
                <span>{selectedVente.nom} {selectedVente.prenom}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{formatPrix(selectedVente.total)}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Rechercher par numéro, client ou téléphone..."
            value={search}
            onValueChange={setSearch}
          />
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <CommandEmpty>Aucune vente trouvée.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {ventes.map((vente) => (
                  <CommandItem
                    key={vente.id}
                    value={`${vente.numero} ${vente.nom} ${vente.prenom} ${vente.tel}`}
                    onSelect={() => {
                      onChange(vente);
                      setOpen(false);
                      setSearch('');
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 shrink-0',
                        value === vente.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{vente.numero}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>{vente.nom} {vente.prenom}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{vente.tel}</span>
                        <span>•</span>
                        <span className="font-medium text-primary">{formatPrix(vente.total)}</span>
                        <span>•</span>
                        <span>{formatDate(vente.date)}</span>
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

export default VenteCombobox;

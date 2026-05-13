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
import { useApprovisionnements } from '@/hooks/useApprovisionnements';

interface Approvisionnement {
  id: string;
  numero: string;
  fournisseurNom: string;
  total: number;
  dateLivraison: string;
  numeroFacture?: string;
  lignes?: any[];
}

interface ApprovisionnementComboboxProps {
  value: string;
  onChange: (appro: Approvisionnement | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ApprovisionnementCombobox = ({
  value,
  onChange,
  placeholder = 'Sélectionner un approvisionnement...',
  disabled = false,
}: ApprovisionnementComboboxProps) => {
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

  // Charger les approvisionnements avec recherche
  const { data: approsResponse, isLoading } = useApprovisionnements({
    page: 1,
    limit: 50,
    search: debouncedSearch || undefined,
  });

  const approvisionnements = approsResponse?.data || [];

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

  // Trouver l'approvisionnement sélectionné
  const selectedAppro = approvisionnements.find((a) => a.id === value);

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
            {selectedAppro ? (
              <span className="flex items-center gap-2">
                <span className="font-medium">{selectedAppro.numero}</span>
                <span>-</span>
                <span>{selectedAppro.fournisseurNom}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{formatPrix(selectedAppro.total)}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[550px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Rechercher par numéro ou fournisseur..."
            value={search}
            onValueChange={setSearch}
          />
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <CommandEmpty>Aucun approvisionnement trouvé.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {approvisionnements.map((appro) => (
                  <CommandItem
                    key={appro.id}
                    value={`${appro.numero} ${appro.fournisseurNom} ${appro.numeroFacture || ''}`}
                    onSelect={() => {
                      onChange(appro);
                      setOpen(false);
                      setSearch('');
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 shrink-0',
                        value === appro.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{appro.numero}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>{appro.fournisseurNom}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="font-medium text-primary">{formatPrix(appro.total)}</span>
                        <span>•</span>
                        <span>{formatDate(appro.dateLivraison)}</span>
                        {appro.numeroFacture && (
                          <>
                            <span>•</span>
                            <span>Facture: {appro.numeroFacture}</span>
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

export default ApprovisionnementCombobox;

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
import { useClients } from '@/hooks/useClients';

interface Client {
  id: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  totalAchats?: number;
  totalCredits?: number;
}

interface ClientComboboxProps {
  value: string;
  onChange: (client: Client | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ClientCombobox = ({
  value,
  onChange,
  placeholder = 'Sélectionner un client...',
  disabled = false,
}: ClientComboboxProps) => {
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

  // Charger les clients avec recherche
  const { data: clientsResponse, isLoading } = useClients({
    page: 1,
    limit: 50,
    search: debouncedSearch || undefined,
  });

  const clients = clientsResponse?.data || [];

  const formatPrix = (montant: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    })
      .format(montant)
      .replace('GNF', 'GNF');
  };

  // Trouver le client sélectionné
  const selectedClient = clients.find((c) => c.id === value);

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
            {selectedClient ? (
              <span className="flex items-center gap-2">
                <span className="font-medium">{selectedClient.nom}</span>
                {selectedClient.prenom && <span>{selectedClient.prenom}</span>}
                {selectedClient.telephone && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground text-xs">{selectedClient.telephone}</span>
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
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Rechercher un client..."
            value={search}
            onValueChange={setSearch}
          />
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <CommandEmpty>Aucun client trouvé.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {clients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={`${client.nom} ${client.prenom || ''} ${client.telephone || ''} ${client.email || ''}`}
                    onSelect={() => {
                      onChange(client);
                      setOpen(false);
                      setSearch('');
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 shrink-0',
                        value === client.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{client.nom}</span>
                        {client.prenom && <span>{client.prenom}</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        {client.telephone && (
                          <>
                            <span>{client.telephone}</span>
                          </>
                        )}
                        {client.totalAchats !== undefined && client.totalAchats > 0 && (
                          <>
                            <span>•</span>
                            <span>Total achats: {formatPrix(client.totalAchats)}</span>
                          </>
                        )}
                        {client.totalCredits !== undefined && client.totalCredits > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-destructive">Crédit: {formatPrix(client.totalCredits)}</span>
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

export default ClientCombobox;

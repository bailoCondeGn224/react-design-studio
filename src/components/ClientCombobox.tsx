import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2, Search, X } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
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

  const handleSelectClient = (client: Client) => {
    onChange(client);
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
        {selectedClient ? (
          <span className="flex items-center gap-2 flex-wrap">
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
  );

  // Version Mobile: Sheet
  if (isMobile) {
    return (
      <>
        {TriggerButton}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="h-[85vh] flex flex-col p-0">
            {/* Header */}
            <SheetHeader className="px-4 py-4 border-b border-border flex-shrink-0">
              <SheetTitle className="text-lg font-semibold text-center">Sélectionner un client</SheetTitle>
              {/* Indicateur de swipe */}
              <div className="mx-auto w-12 h-1 bg-muted-foreground/20 rounded-full -mt-2" />
            </SheetHeader>

            {/* Recherche */}
            <div className="px-4 py-3 border-b border-border flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher un client..."
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

            {/* Liste */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Search className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">Aucun client trouvé</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {clients.map((client) => {
                    const isSelected = value === client.id;
                    return (
                      <button
                        key={client.id}
                        onClick={() => handleSelectClient(client)}
                        className={`w-full px-4 py-4 flex items-start gap-3 transition-colors active:bg-accent/10 ${
                          isSelected ? 'bg-primary/5' : 'hover:bg-accent/5'
                        }`}
                      >
                        <Check
                          className={cn(
                            'w-5 h-5 shrink-0 mt-0.5',
                            isSelected ? 'text-primary opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-semibold text-base ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                              {client.nom}
                            </span>
                            {client.prenom && <span className="text-base">{client.prenom}</span>}
                          </div>
                          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                            {client.telephone && <span>{client.telephone}</span>}
                            {client.totalAchats !== undefined && client.totalAchats > 0 && (
                              <span>Total achats: {formatPrix(client.totalAchats)}</span>
                            )}
                            {client.totalCredits !== undefined && client.totalCredits > 0 && (
                              <span className="text-destructive font-medium">
                                Crédit: {formatPrix(client.totalCredits)}
                              </span>
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
                    onSelect={() => handleSelectClient(client)}
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

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Building2, ChevronDown } from 'lucide-react';
import { getAllOrganizationsAdmin } from '@/api/admin-dashboard';
import { useAuth } from '@/contexts/AuthContext';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const OrganizationSelector = () => {
  const { organization, switchOrganization, isSuperAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: organizations = [] } = useQuery({
    queryKey: ['admin-all-organizations'],
    queryFn: getAllOrganizationsAdmin,
    enabled: isSuperAdmin, // Charger seulement si super admin
  });

  if (!isSuperAdmin) {
    return null; // Ne rien afficher si pas super admin
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal"
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="truncate">
              {organization ? organization.nom : 'Sélectionner une organisation'}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher une organisation..." />
          <CommandEmpty>Aucune organisation trouvée.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {organizations.map((org) => (
              <CommandItem
                key={org.id}
                value={org.nom}
                onSelect={() => {
                  switchOrganization(org);
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    organization?.id === org.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{org.nom}</span>
                    <Badge
                      variant={org.actif ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {org.actif ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {org.plan?.nom || 'Sans plan'}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default OrganizationSelector;

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useApprovisionnementsByFournisseur } from "@/hooks/useApprovisionnements";

interface ApprovisionnementFournisseurSelectorProps {
  fournisseurId: string;
  value?: string;
  onChange: (approvisionnement: any) => void;
  selectedApprovisionnement?: any;
  placeholder?: string;
}

const ApprovisionnementFournisseurSelector = ({
  fournisseurId,
  value,
  onChange,
  selectedApprovisionnement,
  placeholder = "Sélectionner un approvisionnement...",
}: ApprovisionnementFournisseurSelectorProps) => {
  const [open, setOpen] = useState(false);

  // Utiliser le hook pour récupérer les approvisionnements du fournisseur
  const { data: allApprovisionnements, isLoading: loading } = useApprovisionnementsByFournisseur(fournisseurId);

  // Filtrer uniquement les approvisionnements avec un montant restant > 0
  const approvisionnements = useMemo(() => {
    if (!Array.isArray(allApprovisionnements)) return [];
    return allApprovisionnements.filter(
      (appro: any) => Number(appro.montantRestant) > 0
    );
  }, [allApprovisionnements]);

  const formatPrix = (prix: number) => {
    return new Intl.NumberFormat("fr-GN", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    })
      .format(prix)
      .replace("GNF", "GNF");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (!fournisseurId) {
    return (
      <div className="w-full px-3 h-11 rounded-lg border border-border bg-muted/30 text-muted-foreground flex items-center text-sm">
        Sélectionnez d'abord un fournisseur
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-11 font-normal"
        >
          {selectedApprovisionnement ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Package className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="truncate">
                {selectedApprovisionnement.numero} - {formatPrix(selectedApprovisionnement.montantRestant)} restant
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher un approvisionnement..." />
          <CommandEmpty>
            {loading ? "Chargement..." : "Aucun approvisionnement avec reste à payer pour ce fournisseur"}
          </CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {approvisionnements.map((appro) => (
              <CommandItem
                key={appro.id}
                value={`${appro.numero}-${appro.id}`}
                onSelect={() => {
                  onChange(appro);
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === appro.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium truncate">{appro.numero}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(appro.dateLivraison || appro.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs mt-1">
                    <span className="text-muted-foreground">
                      Total: {formatPrix(appro.total)}
                    </span>
                    <span className="font-semibold text-destructive">
                      Reste: {formatPrix(appro.montantRestant)}
                    </span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ApprovisionnementFournisseurSelector;

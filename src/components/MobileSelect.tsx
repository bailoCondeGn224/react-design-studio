import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MobileSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  required?: boolean;
}

const MobileSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Sélectionner...",
  disabled = false,
  searchable = true,
  required = false,
}: MobileSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrer les options selon la recherche
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Trouver le label de la valeur sélectionnée
  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      {/* Bouton trigger */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
        <button
          type="button"
          onClick={() => !disabled && setOpen(true)}
          disabled={disabled}
          className={`w-full px-4 h-12 rounded-lg border border-border bg-card text-foreground text-left flex items-center justify-between transition-colors ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "active:bg-accent/10 hover:bg-accent/5"
          }`}
        >
          <span className={selectedLabel ? "text-foreground" : "text-muted-foreground"}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Sheet avec les options */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-[85vh] flex flex-col p-0">
          {/* Header */}
          <SheetHeader className="px-4 py-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold">{label}</SheetTitle>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-secondary active:scale-95 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </SheetHeader>

          {/* Barre de recherche */}
          {searchable && options.length > 5 && (
            <div className="px-4 py-3 border-b border-border flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Liste des options */}
          <div className="flex-1 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Search className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Aucun résultat trouvé</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredOptions.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={`w-full px-4 py-4 flex items-center justify-between transition-colors active:bg-accent/10 ${
                        isSelected
                          ? "bg-primary/5"
                          : "hover:bg-accent/5"
                      }`}
                    >
                      <span
                        className={`text-base ${
                          isSelected
                            ? "font-semibold text-primary"
                            : "font-medium text-foreground"
                        }`}
                      >
                        {option.label}
                      </span>
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer avec bouton d'action */}
          <div className="px-4 py-3 border-t border-border flex-shrink-0 bg-card">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              size="lg"
              className="w-full h-12 text-base font-semibold"
            >
              Fermer
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileSelect;

import { useState, useMemo, useRef, useEffect } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface MobileComboboxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  emptyMessage?: string;
}

const MobileCombobox = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Rechercher ou sélectionner...",
  disabled = false,
  required = false,
  emptyMessage = "Aucun résultat trouvé",
}: MobileComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Trouver le label de la valeur sélectionnée
  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption?.label || "";

  // Filtrer les options selon la recherche
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Gérer le clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (selectedValue: string, selectedLabel: string) => {
    onChange(selectedValue);
    setSearchQuery(selectedLabel);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    onChange("");
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleInputClick = () => {
    if (disabled) return;

    // Sur mobile (< 768px), ouvrir le Sheet
    if (window.innerWidth < 768) {
      setOpen(true);
    } else {
      // Sur desktop, afficher les suggestions
      setShowSuggestions(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);

    // Si on efface tout, réinitialiser la sélection
    if (!e.target.value.trim() && value) {
      onChange("");
    }
  };

  // Synchroniser l'input avec la valeur sélectionnée
  useEffect(() => {
    if (value && !searchQuery) {
      const option = options.find(opt => opt.value === value);
      if (option) {
        setSearchQuery(option.label);
      }
    }
  }, [value, options, searchQuery]);

  return (
    <>
      {/* Desktop & Mobile Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>

        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onClick={handleInputClick}
              onFocus={() => !disabled && window.innerWidth >= 768 && setShowSuggestions(true)}
              placeholder={placeholder}
              disabled={disabled}
              className={`w-full pl-10 pr-20 h-12 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-base transition-all ${
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"
              }`}
              readOnly={disabled}
            />

            {/* Boutons à droite */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-full hover:bg-secondary active:scale-95 transition-all"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              <button
                type="button"
                onClick={handleInputClick}
                disabled={disabled}
                className="p-1.5 rounded-full hover:bg-secondary active:scale-95 transition-all md:hidden"
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Dropdown Desktop (suggestions sous l'input) */}
          {showSuggestions && !disabled && window.innerWidth >= 768 && (
            <div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-[300px] overflow-y-auto"
            >
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                  <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  {emptyMessage}
                </div>
              ) : (
                <div className="py-1">
                  {filteredOptions.map((option) => {
                    const isSelected = option.value === value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value, option.label)}
                        className={`w-full px-4 py-3 flex items-center justify-between transition-colors hover:bg-accent/10 ${
                          isSelected ? "bg-primary/5" : ""
                        }`}
                      >
                        <span
                          className={`text-sm ${
                            isSelected
                              ? "font-semibold text-primary"
                              : "font-medium text-foreground"
                          }`}
                        >
                          {option.label}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sheet Mobile (drawer du bas) */}
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

          {/* Barre de recherche dans le Sheet */}
          <div className="px-4 py-3 border-b border-border flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 h-12 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-base"
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

          {/* Liste des options */}
          <div className="flex-1 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground px-4">
                <Search className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm text-center">{emptyMessage}</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredOptions.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        handleSelect(option.value, option.label);
                        setOpen(false);
                      }}
                      className={`w-full px-4 py-4 flex items-center justify-between transition-colors active:bg-accent/10 ${
                        isSelected ? "bg-primary/5" : "hover:bg-accent/5"
                      }`}
                    >
                      <span
                        className={`text-base text-left ${
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
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileCombobox;

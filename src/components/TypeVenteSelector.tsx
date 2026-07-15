import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Package, ShoppingBag, Layers } from "lucide-react";

export type TypeVente = "detail" | "gros" | "gros_et_detail";

interface TypeVenteSelectorProps {
  value: TypeVente;
  onChange: (value: TypeVente) => void;
  uniteStock: string;
  quantiteGros: number;
  onQuantiteGrosChange: (q: number) => void;
}

export function TypeVenteSelector({
  value,
  onChange,
  uniteStock,
  quantiteGros,
  onQuantiteGrosChange,
}: TypeVenteSelectorProps) {
  const options = [
    {
      value: "detail" as TypeVente,
      label: "Détail uniquement",
      description: `Vente à l'unité (1 ${uniteStock || "unité"})`,
      icon: ShoppingBag,
    },
    {
      value: "gros" as TypeVente,
      label: "Gros uniquement",
      description: `Vente en gros (par ${quantiteGros} ${uniteStock || "unités"})`,
      icon: Package,
    },
    {
      value: "gros_et_detail" as TypeVente,
      label: "Gros et Détail",
      description: "Les deux modes de vente disponibles",
      icon: Layers,
    },
  ];

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Type de vente</Label>

      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as TypeVente)}
        className="grid gap-3"
      >
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;

          return (
            <label
              key={option.value}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value={option.value} className="sr-only" />
              <div
                className={`p-2 rounded-full ${
                  isSelected ? "bg-primary text-white" : "bg-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{option.label}</p>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </label>
          );
        })}
      </RadioGroup>

      {/* Champ quantité gros - visible si gros ou gros_et_detail */}
      {(value === "gros" || value === "gros_et_detail") && (
        <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-3">
          <Label htmlFor="quantiteGros">
            Quantité par unité de gros
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="quantiteGros"
              type="number"
              min={2}
              value={quantiteGros}
              onChange={(e) => onQuantiteGrosChange(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-muted-foreground">
              {uniteStock || "unités"} par vente en gros
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Ex: 12 bouteilles par casier, 6 pièces par pack
          </p>
        </div>
      )}
    </div>
  );
}

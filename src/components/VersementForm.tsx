import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import FournisseurVersementSelector from "@/components/FournisseurVersementSelector";
import { toast } from "sonner";
import { Versement } from "@/types";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";

interface VersementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  versement?: Versement;
  fournisseurId?: string;
}

const VersementForm = ({ open, onOpenChange, onSubmit, versement, fournisseurId }: VersementFormProps) => {
  const getInitialState = () => {
    if (versement) {
      return {
        fournisseurId: versement.fournisseurId,
        montant: String(versement.montant),
        modePaiement: versement.modePaiement,
        reference: versement.reference || "",
        date: versement.date.split('T')[0],
        note: versement.note || "",
      };
    }
    return {
      fournisseurId: fournisseurId || "",
      montant: "",
      modePaiement: "especes",
      reference: "",
      date: new Date().toISOString().split('T')[0],
      note: "",
    };
  };

  const [form, setForm] = useState(getInitialState());
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);

  useEffect(() => {
    if (open) {
      setForm(getInitialState());
      if (!versement && !fournisseurId) {
        setSelectedFournisseur(null);
      }
    }
  }, [open]);

  const update = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fournisseurId || !form.montant || !form.date) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    const montant = parseFloat(form.montant);
    if (isNaN(montant) || montant <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    // Validation: le montant ne doit pas dépasser la dette
    if (selectedFournisseur && montant > selectedFournisseur.dette) {
      toast.error(
        `Le montant (${formatPrix(montant)}) dépasse la dette du fournisseur (${formatPrix(selectedFournisseur.dette)})`
      );
      return;
    }

    onSubmit({
      fournisseurId: form.fournisseurId,
      montant,
      modePaiement: form.modePaiement,
      reference: form.reference || undefined,
      date: form.date,
      note: form.note || undefined,
    });

    setForm(getInitialState());
    setSelectedFournisseur(null);
  };

  const formatPrix = (prix: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(prix).replace('GNF', 'GNF');
  };

  const getModeLabel = (mode: string) => {
    const labels: any = {
      especes: "Espèces",
      mobile: "Mobile Money",
      virement: "Virement Bancaire",
      cheque: "Chèque"
    };
    return labels[mode] || mode;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {versement ? 'Modifier le Versement' : 'Enregistrer un Versement'}
          </DialogTitle>
          <DialogDescription>
            {versement
              ? 'Modifiez les informations du versement'
              : 'Enregistrez un paiement effectué à un fournisseur'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FournisseurVersementSelector
            value={form.fournisseurId}
            onChange={(fournisseur) => {
              if (fournisseur) {
                setSelectedFournisseur(fournisseur);
                update("fournisseurId", fournisseur.id);
              } else {
                setSelectedFournisseur(null);
                update("fournisseurId", "");
              }
            }}
            selectedFournisseur={selectedFournisseur}
            placeholder="Rechercher un fournisseur..."
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Montant versé (GNF) *</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={formatPrixInput(form.montant)}
              onChange={e => update("montant", handlePrixChange(e.target.value))}
              onFocus={e => e.target.select()}
              className={`w-full px-4 py-2.5 rounded-lg border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 ${
                selectedFournisseur && form.montant && parseFloat(form.montant) > selectedFournisseur.dette
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-border"
              }`}
            />
            {selectedFournisseur && form.montant && parseFloat(form.montant) > selectedFournisseur.dette && (
              <p className="text-xs text-red-500 mt-1">
                ⚠️ Le montant dépasse la dette actuelle ({formatPrix(selectedFournisseur.dette)})
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Mode de paiement *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["especes", "mobile", "virement", "cheque"].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => update("modePaiement", mode)}
                  className={`text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
                    form.modePaiement === mode
                      ? "gradient-gold text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-accent/20 border border-border"
                  }`}
                >
                  {getModeLabel(mode)}
                </button>
              ))}
            </div>
          </div>

          {(form.modePaiement === "mobile" || form.modePaiement === "virement" || form.modePaiement === "cheque") && (
            <FormField
              label="Référence transaction"
              placeholder={form.modePaiement === "mobile" ? "Ex: MM123456" : form.modePaiement === "cheque" ? "N° Chèque" : "Référence"}
              value={form.reference}
              onChange={e => update("reference", (e.target as HTMLInputElement).value)}
              maxLength={50}
            />
          )}

          <FormField
            label="Date du versement *"
            type="date"
            value={form.date}
            onChange={e => update("date", (e.target as HTMLInputElement).value)}
          />

          <FormField
            label="Note (optionnel)"
            as="textarea"
            placeholder="Informations complémentaires..."
            value={form.note}
            onChange={e => update("note", (e.target as HTMLTextAreaElement).value)}
            maxLength={200}
            rows={2}
          />

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg gradient-gold text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {versement ? 'Modifier' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VersementForm;

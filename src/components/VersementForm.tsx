import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import FournisseurVersementSelector from "@/components/FournisseurVersementSelector";
import ApprovisionnementFournisseurSelector from "@/components/ApprovisionnementFournisseurSelector";
import { toast } from "sonner";
import { Versement } from "@/types";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";
import { Wallet, Truck, DollarSign, CreditCard, FileText, Check, AlertCircle, Calendar, Package } from "lucide-react";

interface VersementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  versement?: Versement;
  fournisseurId?: string;
  fournisseur?: any; // Objet fournisseur complet avec dette
}

const VersementForm = ({ open, onOpenChange, onSubmit, versement, fournisseurId, fournisseur }: VersementFormProps) => {
  const isMobile = useIsMobile();

  const getInitialState = () => {
    if (versement) {
      return {
        fournisseurId: versement.fournisseurId,
        approvisionnementId: versement.approvisionnementId || "",
        montant: String(versement.montant),
        modePaiement: versement.modePaiement,
        reference: versement.reference || "",
        date: versement.date.split('T')[0],
        note: versement.note || "",
      };
    }
    return {
      fournisseurId: fournisseurId || fournisseur?.id || "",
      approvisionnementId: "",
      montant: "",
      modePaiement: "especes",
      reference: "",
      date: new Date().toISOString().split('T')[0],
      note: "",
    };
  };

  const [form, setForm] = useState(getInitialState());
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);
  const [selectedApprovisionnement, setSelectedApprovisionnement] = useState<any>(null);

  useEffect(() => {
    if (open) {
      setForm(getInitialState());
      setSelectedApprovisionnement(null);
      // Initialiser selectedFournisseur avec le fournisseur passé en prop
      if (fournisseur) {
        setSelectedFournisseur(fournisseur);
      } else if (!versement && !fournisseurId) {
        setSelectedFournisseur(null);
      }
    }
  }, [open, fournisseur]);

  const update = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fournisseurId || !form.montant || !form.date) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    if (!form.approvisionnementId) {
      toast.error("Veuillez sélectionner un approvisionnement concerné");
      return;
    }

    const montant = parseFloat(form.montant);
    if (isNaN(montant) || montant <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    // Validation: le montant ne doit pas dépasser le montant restant de l'approvisionnement si sélectionné
    if (selectedApprovisionnement && montant > selectedApprovisionnement.montantRestant) {
      toast.error(
        `Le montant (${formatPrix(montant)}) dépasse le reste à payer de l'approvisionnement (${formatPrix(selectedApprovisionnement.montantRestant)})`
      );
      return;
    }

    // Validation: le montant ne doit pas dépasser la dette globale du fournisseur
    if (selectedFournisseur && montant > selectedFournisseur.dette) {
      toast.error(
        `Le montant (${formatPrix(montant)}) dépasse la dette du fournisseur (${formatPrix(selectedFournisseur.dette)})`
      );
      return;
    }

    onSubmit({
      fournisseurId: form.fournisseurId,
      approvisionnementId: form.approvisionnementId,
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

  const formContent = (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-success/5">
      {/* Header avec gradient */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-success/10 via-success/5 to-transparent flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0 pr-12">
            <div className="hidden md:flex w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-success to-success/70 flex items-center justify-center shadow-lg flex-shrink-0">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                <span className="md:hidden">{versement ? 'Modifier' : 'Versement'}</span>
                <span className="hidden md:inline">{versement ? 'Modifier le Versement' : 'Enregistrer un Versement'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {versement
                  ? 'Modifiez les informations du versement'
                  : 'Enregistrez un paiement effectué à un fournisseur'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zone scrollable */}
      <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
        {/* Section Fournisseur */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
          <div className="relative space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Truck className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Fournisseur *</h3>
            </div>
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
                // Réinitialiser l'approvisionnement quand le fournisseur change
                setSelectedApprovisionnement(null);
                update("approvisionnementId", "");
              }}
              selectedFournisseur={selectedFournisseur}
              placeholder="Rechercher un fournisseur..."
            />
          </div>
        </div>

        {/* Section Approvisionnement */}
        {form.fournisseurId && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-warning/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-warning" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Approvisionnement concerné *</h3>
              </div>
              <div className="text-xs text-muted-foreground mb-3 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-warning" />
                <span>Obligatoire pour assurer le suivi précis des paiements par approvisionnement</span>
              </div>
              <ApprovisionnementFournisseurSelector
                fournisseurId={form.fournisseurId}
                value={form.approvisionnementId}
                onChange={(appro) => {
                  if (appro) {
                    setSelectedApprovisionnement(appro);
                    update("approvisionnementId", appro.id);
                  } else {
                    setSelectedApprovisionnement(null);
                    update("approvisionnementId", "");
                  }
                }}
                selectedApprovisionnement={selectedApprovisionnement}
                placeholder="Sélectionner un approvisionnement (optionnel)..."
              />
              {selectedApprovisionnement && (
                <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/20 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground">Total approvisionnement:</span>
                    <span className="font-semibold text-foreground">{formatPrix(selectedApprovisionnement.total)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground">Déjà payé:</span>
                    <span className="font-semibold text-success">{formatPrix(selectedApprovisionnement.montantPaye)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-secondary/20">
                    <span className="font-semibold text-foreground">Reste à payer:</span>
                    <span className="font-bold text-destructive">{formatPrix(selectedApprovisionnement.montantRestant)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section Montant */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-success/5 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full -mr-12 -mt-12"></div>
          <div className="relative space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-success" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Montant du versement *</h3>
            </div>
            <div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={formatPrixInput(form.montant)}
                onChange={e => update("montant", handlePrixChange(e.target.value))}
                onFocus={e => e.target.select()}
                className={`w-full px-4 h-11 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
                  (selectedApprovisionnement && form.montant && parseFloat(form.montant) > selectedApprovisionnement.montantRestant) ||
                  (selectedFournisseur && form.montant && parseFloat(form.montant) > selectedFournisseur.dette)
                    ? "border-destructive focus:ring-destructive/20"
                    : "border-border focus:ring-success/20"
                }`}
              />
              {selectedApprovisionnement && form.montant && parseFloat(form.montant) > selectedApprovisionnement.montantRestant && (
                <div className="flex items-start gap-2 mt-2 p-2 bg-destructive/10 rounded-lg border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">
                    Le montant dépasse le reste à payer de l'approvisionnement ({formatPrix(selectedApprovisionnement.montantRestant)})
                  </p>
                </div>
              )}
              {!selectedApprovisionnement && selectedFournisseur && form.montant && parseFloat(form.montant) > selectedFournisseur.dette && (
                <div className="flex items-start gap-2 mt-2 p-2 bg-destructive/10 rounded-lg border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">
                    Le montant dépasse la dette actuelle ({formatPrix(selectedFournisseur.dette)})
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section Mode de paiement */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary/5 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -mr-12 -mt-12"></div>
          <div className="relative space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-secondary-foreground" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Mode de paiement *</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["especes", "mobile", "virement", "cheque"].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => update("modePaiement", mode)}
                  className={`px-3 h-11 rounded-lg font-medium transition-all text-sm ${
                    form.modePaiement === mode
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-muted text-foreground hover:bg-primary/10 hover:border-primary/30 border border-transparent"
                  }`}
                >
                  {getModeLabel(mode)}
                </button>
              ))}
            </div>

            {(form.modePaiement === "mobile" || form.modePaiement === "virement" || form.modePaiement === "cheque") && (
              <div className="pt-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Référence transaction
                </label>
                <input
                  type="text"
                  placeholder={form.modePaiement === "mobile" ? "Ex: MM123456" : form.modePaiement === "cheque" ? "N° Chèque" : "Référence"}
                  value={form.reference}
                  onChange={e => update("reference", e.target.value)}
                  maxLength={50}
                  className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section Informations complémentaires - Gris */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/30 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-muted/20 rounded-full -mr-12 -mt-12"></div>
          <div className="relative space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Informations complémentaires</h3>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Date du versement *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => update("date", e.target.value)}
                className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Note (optionnelle)
              </label>
              <textarea
                placeholder="Informations complémentaires..."
                value={form.note}
                onChange={e => update("note", e.target.value)}
                maxLength={200}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Footer avec actions - fixe en bas */}
      <div className="px-4 sm:px-6 py-4 border-t bg-muted/30 flex-shrink-0">
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            onClick={(e: any) => {
              const dialogContent = e.target.closest('[role="dialog"]');
              const formElement = dialogContent?.querySelector('form');
              if (formElement) {
                formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
              }
            }}
            className="w-full sm:w-auto"
          >
            <Check className="w-4 h-4 mr-2" />
            {versement ? 'Modifier le versement' : 'Enregistrer le versement'}
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl h-[90vh] flex flex-col p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="sr-only">
          <DialogTitle>{versement ? 'Modifier le Versement' : 'Enregistrer un Versement'}</DialogTitle>
          <DialogDescription>
            {versement
              ? 'Modifiez les informations du versement'
              : 'Enregistrez un paiement effectué à un fournisseur'}
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default VersementForm;

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import FormField from "@/components/FormField";
import { toast } from "sonner";
import { useClients } from "@/hooks/useClients";
import { useVentesACredit, useVente } from "@/hooks/useVentes";
import { VersementClient } from "@/types";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";
import { useIsMobile } from "@/hooks/useMediaQuery";

interface VersementClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  versementClient?: VersementClient;
  clientId?: string;
  client?: any; // Objet client complet avec dette
  isSubmitting?: boolean;
}

const VersementClientForm = ({ open, onOpenChange, onSubmit, versementClient, clientId, client, isSubmitting = false }: VersementClientFormProps) => {
  const isMobile = useIsMobile();
  const { data: clientsResponse } = useClients({ page: 1, limit: 100 });
  const clients = clientsResponse?.data || [];

  const getInitialState = () => {
    if (versementClient) {
      return {
        clientId: versementClient.clientId,
        venteId: versementClient.venteId || "",
        montant: String(versementClient.montant),
        modePaiement: versementClient.modePaiement,
        reference: versementClient.reference || "",
        date: versementClient.date.split('T')[0],
        note: versementClient.note || "",
      };
    }
    return {
      clientId: clientId || client?.id || "",
      venteId: "",
      montant: "",
      modePaiement: "especes",
      reference: "",
      date: new Date().toISOString().split('T')[0],
      note: "",
    };
  };

  const [form, setForm] = useState(getInitialState());
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedVente, setSelectedVente] = useState<any>(null);

  // Récupérer les ventes à crédit du client sélectionné (montantRestant > 0)
  const { data: ventesACredit } = useVentesACredit(form.clientId);

  // En mode édition, récupérer aussi la vente originale (si elle existe)
  const { data: venteOriginale } = useVente(versementClient?.venteId || '');

  // Fusionner les listes: ventes du client + vente originale (si pas déjà dans la liste)
  const ventesClient = (() => {
    const ventes = ventesACredit || [];

    // Si vente originale existe et n'est pas déjà dans la liste, l'ajouter
    if (venteOriginale && !ventes.find(v => v.id === venteOriginale.id)) {
      return [venteOriginale, ...ventes];
    }

    return ventes;
  })();

  useEffect(() => {
    if (open) {
      setForm(getInitialState());
      // Initialiser selectedClient avec le client passé en prop
      if (client) {
        setSelectedClient(client);
      } else if (versementClient) {
        const c = clients.find((x: any) => x.id === versementClient.clientId);
        setSelectedClient(c || null);
      } else if (!clientId) {
        setSelectedClient(null);
      }
    }
  }, [open, client, versementClient]);

  const update = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));

    if (field === "clientId") {
      const c = clients.find((x: any) => x.id === value);
      setSelectedClient(c || null);
      // Réinitialiser la vente sélectionnée quand on change de client
      setForm(prev => ({ ...prev, venteId: "" }));
      setSelectedVente(null);
    }

    if (field === "venteId") {
      const v = ventesClient.find((x: any) => x.id === value);
      setSelectedVente(v || null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.clientId || !form.montant || !form.date) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    const montant = parseFloat(form.montant);
    if (isNaN(montant) || montant <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    // En mode CRÉATION uniquement, valider contre la dette et la vente
    if (!versementClient) {
      // Vérifier que le montant ne dépasse pas la dette totale
      if (selectedClient && montant > selectedClient.totalCredits) {
        toast.error(`Le montant (${formatPrix(montant)}) dépasse la dette du client (${formatPrix(selectedClient.totalCredits)})`);
        return;
      }

      // Si une vente spécifique est sélectionnée, vérifier que le montant ne dépasse pas le montant restant
      if (selectedVente && montant > selectedVente.montantRestant) {
        toast.error(`Le montant (${formatPrix(montant)}) dépasse le montant restant de cette vente (${formatPrix(selectedVente.montantRestant)})`);
        return;
      }
    }
    // En mode ÉDITION, on laisse le backend valider

    onSubmit({
      clientId: form.clientId,
      clientNom: selectedClient?.nom || '',
      venteId: form.venteId || undefined,
      montant,
      modePaiement: form.modePaiement,
      reference: form.reference || undefined,
      date: form.date,
      note: form.note || undefined,
    });

    setForm(getInitialState());
    setSelectedClient(null);
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
      mobile_money: "Mobile Money",
      virement: "Virement",
      cheque: "Chèque",
      carte: "Carte"
    };
    return labels[mode] || mode;
  };

  const formContent = (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-card/50 backdrop-blur-sm flex-shrink-0">
        <h2 className="font-heading text-base sm:text-lg font-semibold text-foreground">
          <span className="md:hidden">{versementClient ? 'Modifier' : 'Paiement Client'}</span>
          <span className="hidden md:inline">{versementClient ? 'Modifier le Paiement' : 'Enregistrer un Paiement Client'}</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {versementClient
            ? 'Modifiez les informations du paiement'
            : 'Enregistrez un paiement de dette effectué par un client'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Client <span className="text-destructive">*</span></label>
          <select
            value={form.clientId}
            onChange={e => update("clientId", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            <option value="">Sélectionner un client</option>
            {clients.length === 0 && (
              <option disabled>Aucun client disponible</option>
            )}
            {clients
              .sort((a: any, b: any) => b.totalCredits - a.totalCredits)
              .map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.nom} — {c.totalCredits > 0 ? `Dette: ${formatPrix(c.totalCredits)}` : 'À jour ✓'}
                </option>
              ))}
          </select>
          {clients.filter((c: any) => c.totalCredits > 0).length === 0 && clients.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1.5">
              ℹ️ Tous les clients sont à jour. Aucun paiement de dette nécessaire.
            </p>
          )}
        </div>

        {selectedClient && (
          <div className={`border rounded-lg p-3 ${
            selectedClient.totalCredits > 0
              ? 'bg-secondary/50 border-border'
              : 'bg-success/10 border-success/30'
          }`}>
            <p className="text-xs text-muted-foreground mb-1">Dette actuelle</p>
            <p className={`text-lg font-heading font-semibold ${
              selectedClient.totalCredits > 0 ? 'text-destructive' : 'text-success'
            }`}>
              {formatPrix(selectedClient.totalCredits || 0)}
            </p>
            {versementClient && (
              <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                ℹ️ Mode édition : validation assouplie
              </p>
            )}
            {selectedClient.totalCredits === 0 && !versementClient && (
              <p className="text-xs text-success mt-2 flex items-center gap-1">
                ✓ Ce client est à jour. Aucun paiement de dette nécessaire.
              </p>
            )}
          </div>
        )}

        {selectedClient && ventesClient.length > 0 && (
          <FormField
            label="Vente spécifique (optionnel)"
            as="select"
            value={form.venteId}
            onChange={e => update("venteId", (e.target as HTMLSelectElement).value)}
          >
            <option value="">Paiement global (non lié à une vente)</option>
            {ventesClient
              .filter((v: any) => v.montantRestant > 0)
              .map((v: any) => (
                <option key={v.id} value={v.id}>
                  {v.numero} — Reste: {formatPrix(v.montantRestant)}
                </option>
              ))}
          </FormField>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Montant versé (GNF) <span className="text-destructive">*</span></label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={formatPrixInput(form.montant)}
            onChange={e => update("montant", handlePrixChange(e.target.value))}
            onFocus={e => e.target.select()}
            className={`w-full px-4 py-2.5 rounded-lg border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 ${
              (() => {
                // Validation visuelle uniquement en mode création
                if (versementClient) return "border-border";

                const montant = parseFloat(form.montant);
                return (selectedClient && form.montant && montant > selectedClient.totalCredits) ||
                       (selectedVente && form.montant && montant > selectedVente.montantRestant)
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-border";
              })()
            }`}
          />
          {(() => {
            // Avertissements uniquement en mode création
            if (versementClient) return null;

            const montant = parseFloat(form.montant);

            if (selectedClient && form.montant && montant > selectedClient.totalCredits) {
              return (
                <p className="text-xs text-red-500 mt-1">
                  ⚠️ Le montant dépasse la dette totale du client ({formatPrix(selectedClient.totalCredits)})
                </p>
              );
            }

            if (selectedVente && form.montant && montant > selectedVente.montantRestant && montant <= (selectedClient?.totalCredits || 0)) {
              return (
                <p className="text-xs text-red-500 mt-1">
                  ⚠️ Le montant dépasse le montant restant de cette vente ({formatPrix(selectedVente.montantRestant)})
                </p>
              );
            }

            return null;
          })()}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Mode de paiement <span className="text-destructive">*</span></label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {["especes", "mobile_money", "virement", "cheque", "carte"].map(mode => (
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

        {(form.modePaiement === "mobile_money" || form.modePaiement === "virement" || form.modePaiement === "cheque" || form.modePaiement === "carte") && (
          <FormField
            label="Référence transaction"
            placeholder={
              form.modePaiement === "mobile_money" ? "Ex: MM123456" :
              form.modePaiement === "cheque" ? "N° Chèque" :
              form.modePaiement === "carte" ? "N° Transaction" :
              "Référence"
            }
            value={form.reference}
            onChange={e => update("reference", (e.target as HTMLInputElement).value)}
            maxLength={50}
          />
        )}

        <FormField
          label="Date du paiement *"
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
      </form>

      <div className="px-4 sm:px-6 py-4 border-t bg-card/50 backdrop-blur-sm flex gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 py-2.5 rounded-lg gradient-gold text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'En cours...' : (versementClient ? 'Modifier' : 'Enregistrer')}
        </button>
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
      <DialogContent className="max-w-[95vw] sm:max-w-md h-[90vh] flex flex-col p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="sr-only">
          <DialogTitle>
            {versementClient ? 'Modifier le Paiement' : 'Enregistrer un Paiement Client'}
          </DialogTitle>
          <DialogDescription>
            {versementClient
              ? 'Modifiez les informations du paiement'
              : 'Enregistrez un paiement de dette effectué par un client'}
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default VersementClientForm;

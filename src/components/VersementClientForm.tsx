import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { toast } from "sonner";
import { useClients } from "@/hooks/useClients";
import { useVentes } from "@/hooks/useVentes";
import { VersementClient } from "@/types";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";

interface VersementClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  versementClient?: VersementClient;
}

const VersementClientForm = ({ open, onOpenChange, onSubmit, versementClient }: VersementClientFormProps) => {
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
      clientId: "",
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

  // Récupérer les ventes à crédit du client sélectionné
  const { data: ventesResponse } = useVentes({
    clientId: form.clientId,
    modePaiement: 'credit',
    page: 1,
    limit: 50
  });
  const ventesClient = ventesResponse?.data || [];

  useEffect(() => {
    if (open) {
      setForm(getInitialState());
      if (versementClient) {
        const c = clients.find((x: any) => x.id === versementClient.clientId);
        setSelectedClient(c || null);
      } else {
        setSelectedClient(null);
      }
    }
  }, [open, versementClient]);

  const update = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));

    if (field === "clientId") {
      const c = clients.find((x: any) => x.id === value);
      setSelectedClient(c || null);
      // Réinitialiser la vente sélectionnée quand on change de client
      setForm(prev => ({ ...prev, venteId: "" }));
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

    // Vérifier que le montant ne dépasse pas la dette
    if (selectedClient && montant > selectedClient.totalCredits) {
      toast.error(`Le montant ne peut pas dépasser la dette (${formatPrix(selectedClient.totalCredits)})`);
      return;
    }

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {versementClient ? 'Modifier le Paiement' : 'Enregistrer un Paiement Client'}
          </DialogTitle>
          <DialogDescription>
            {versementClient
              ? 'Modifiez les informations du paiement'
              : 'Enregistrez un paiement de dette effectué par un client'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Client *</label>
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
              {selectedClient.totalCredits === 0 && (
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
            <label className="block text-sm font-medium text-foreground mb-2">Montant versé (GNF) *</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={formatPrixInput(form.montant)}
              onChange={e => update("montant", handlePrixChange(e.target.value))}
              onFocus={e => e.target.select()}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Mode de paiement *</label>
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
              {versementClient ? 'Modifier' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VersementClientForm;

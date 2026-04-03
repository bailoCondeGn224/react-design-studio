import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import VenteForm from "@/components/VenteForm";
import { Plus, Receipt, Clock, CreditCard, Banknote, Smartphone } from "lucide-react";
import { useState } from "react";

const initialVentes = [
  { id: "V-001", client: "Fatimata Diallo", articles: "Abaya Noire Premium, Hijab Soie", total: "110 000 GNF", paiement: "Cash", date: "03/04/2026", heure: "09:15" },
  { id: "V-002", client: "Aissatou Barry", articles: "Lot Foulards Soie (x5)", total: "125 000 GNF", paiement: "Mobile Money", date: "03/04/2026", heure: "10:32" },
  { id: "V-003", client: "Mamadou Sow", articles: "Bazin Riche Bleu 10m", total: "350 000 GNF", paiement: "Virement", date: "03/04/2026", heure: "11:45" },
  { id: "V-004", client: "Kadiatou Camara", articles: "Djellaba Brodée", total: "120 000 GNF", paiement: "Cash", date: "03/04/2026", heure: "14:20" },
  { id: "V-005", client: "Oumar Bah (B2B)", articles: "Abayas x20, Foulards x30", total: "1 850 000 GNF", paiement: "Acompte 50%", date: "02/04/2026", heure: "16:00" },
  { id: "V-006", client: "Mariama Touré", articles: "Boubou Wax, Pagne", total: "95 000 GNF", paiement: "Mobile Money", date: "02/04/2026", heure: "10:10" },
];

const paymentIcons: Record<string, typeof Banknote> = {
  "Cash": Banknote, "Mobile Money": Smartphone, "Virement": CreditCard, "Acompte 50%": Clock,
};

const Ventes = () => {
  const [list, setList] = useState(initialVentes);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <AppLayout>
      <PageHeader
        title="Gestion des Ventes"
        description="Registre des transactions et suivi commercial"
        action={
          <button onClick={() => setFormOpen(true)} className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Nouvelle Vente
          </button>
        }
      />

      <VenteForm open={formOpen} onOpenChange={setFormOpen} onSubmit={(data) => setList(prev => [data, ...prev])} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <p className="text-xs text-muted-foreground mb-1">Ventes Aujourd'hui</p>
          <p className="text-xl font-heading font-bold text-foreground">705 000 GNF</p>
          <p className="text-xs text-success font-medium">4 transactions</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <p className="text-xs text-muted-foreground mb-1">Ventes B2B en cours</p>
          <p className="text-xl font-heading font-bold text-foreground">1 850 000 GNF</p>
          <p className="text-xs text-warning font-medium">1 acompte en attente</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-card">
          <p className="text-xs text-muted-foreground mb-1">Panier Moyen</p>
          <p className="text-xl font-heading font-bold text-foreground">108 333 GNF</p>
          <p className="text-xs text-muted-foreground">Détail uniquement</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Réf</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Client</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Articles</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Total</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Paiement</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {list.map((v) => {
              const PayIcon = paymentIcons[v.paiement] || Receipt;
              return (
                <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{v.id}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-foreground">{v.client}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground max-w-[200px] truncate">{v.articles}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-foreground">{v.total}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <PayIcon className="w-3.5 h-3.5" /> {v.paiement}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{v.date} à {v.heure}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
};

export default Ventes;

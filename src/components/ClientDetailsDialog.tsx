import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useClientHistorique } from "@/hooks/useClients";
import Pagination from "@/components/Pagination";
import { TrendingUp, DollarSign, AlertCircle, CheckCircle, ShoppingCart, Wallet } from "lucide-react";

interface ClientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientNom: string;
}

const ClientDetailsDialog = ({ open, onOpenChange, clientId, clientNom }: ClientDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState<'tous' | 'achats' | 'paiements'>('tous');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data: historique, isLoading } = useClientHistorique(clientId, {
    page,
    limit,
    type: activeTab,
  });

  // Réinitialiser la page quand on change d'onglet
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const formatPrix = (prix: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(prix).replace('GNF', 'GNF');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement de l'historique...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!historique) return null;

  const { stats, ventes, paiements, timeline } = historique;

  const getTimelineIcon = (type: string) => {
    return type === 'achat' ? '🛒' : '💰';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-heading text-2xl">{clientNom}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Historique complet • {stats.nombreVentes} achats • {stats.nombrePaiements} paiements
          </p>
        </DialogHeader>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Achats</p>
            </div>
            <p className="text-xl font-heading font-bold text-blue-700 dark:text-blue-300">
              {formatPrix(stats.totalAchats)}
            </p>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
              {stats.nombreVentes} ventes
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-xs font-medium text-green-600 dark:text-green-400">Total Payé</p>
            </div>
            <p className="text-xl font-heading font-bold text-green-700 dark:text-green-300">
              {formatPrix(stats.totalPaye)}
            </p>
            <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
              {stats.nombrePaiements} paiements
            </p>
          </div>

          <div className={`border rounded-lg p-4 ${
            stats.detteActuelle > 0
              ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
              : 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className={`w-4 h-4 ${
                stats.detteActuelle > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`} />
              <p className={`text-xs font-medium ${
                stats.detteActuelle > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                Dette
              </p>
            </div>
            <p className={`text-xl font-heading font-bold ${
              stats.detteActuelle > 0
                ? 'text-red-700 dark:text-red-300'
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              {formatPrix(stats.detteActuelle)}
            </p>
            {stats.detteActuelle === 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">À jour ✓</p>
            )}
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Bénéfice</p>
            </div>
            <p className="text-xl font-heading font-bold text-purple-700 dark:text-purple-300">
              {formatPrix(stats.beneficeTotal)}
            </p>
            <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
              Marge totale
            </p>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 border-b border-border flex-shrink-0">
          <button
            onClick={() => setActiveTab('tous')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tous'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Tous ({timeline.length})
          </button>
          <button
            onClick={() => setActiveTab('achats')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'achats'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Achats ({ventes.length})
          </button>
          <button
            onClick={() => setActiveTab('paiements')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'paiements'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Paiements ({paiements.length})
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {activeTab === 'tous' && timeline.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg hover:bg-secondary/30 transition-colors">
              <div className="text-3xl flex-shrink-0">{getTimelineIcon(item.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{item.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(item.date)}</p>
                    {item.reference && (
                      <p className="text-xs text-muted-foreground mt-1">Réf: {item.reference}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-lg font-bold ${
                      item.type === 'achat' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {formatPrix(item.montant)}
                    </p>
                    {item.benefice !== undefined && item.benefice > 0 && (
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        +{formatPrix(item.benefice)} bénéfice
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'achats' && ventes.map((vente) => (
            <div key={vente.id} className="p-4 bg-card border border-border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{vente.numero}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(vente.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatPrix(vente.total)}
                  </p>
                  {vente.benefice > 0 && (
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      +{formatPrix(vente.benefice)} bénéfice
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 mb-3">
                {vente.lignes.map((ligne, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-secondary/30 rounded px-3 py-1.5">
                    <span className="text-foreground">
                      {ligne.quantite}x {ligne.articleNom}
                    </span>
                    <span className="font-medium text-foreground">{formatPrix(ligne.sousTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                <span className="text-muted-foreground">
                  {vente.modePaiement} • Payé: {formatPrix(vente.montantPaye)}
                </span>
                {vente.montantRestant > 0 && (
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    Reste: {formatPrix(vente.montantRestant)}
                  </span>
                )}
                {vente.montantRestant === 0 && (
                  <span className="text-green-600 dark:text-green-400 font-medium">Payé ✓</span>
                )}
              </div>
            </div>
          ))}

          {activeTab === 'paiements' && paiements.map((paiement) => (
            <div key={paiement.id} className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg">
              <div className="text-3xl">💰</div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Paiement {paiement.modePaiement}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(paiement.date)}</p>
                    {paiement.venteNumero && (
                      <p className="text-xs text-muted-foreground mt-1">Pour: {paiement.venteNumero}</p>
                    )}
                    {paiement.reference && (
                      <p className="text-xs text-muted-foreground">Réf: {paiement.reference}</p>
                    )}
                    {paiement.note && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{paiement.note}</p>
                    )}
                  </div>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatPrix(paiement.montant)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {((activeTab === 'tous' && timeline.length === 0) ||
            (activeTab === 'achats' && ventes.length === 0) ||
            (activeTab === 'paiements' && paiements.length === 0)) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun historique à afficher</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {historique?.meta && historique.meta.totalPages > 1 && (
          <div className="flex-shrink-0 border-t border-border pt-4">
            <Pagination meta={historique.meta} onPageChange={setPage} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsDialog;

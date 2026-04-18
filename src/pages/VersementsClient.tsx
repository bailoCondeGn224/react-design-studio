import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import VersementClientForm from "@/components/VersementClientForm";
import Pagination from "@/components/Pagination";
import CanAccess from "@/components/CanAccess";
import { Plus, Wallet, AlertCircle, Search, ArrowDownLeft, CheckCircle, Eye, Edit2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useVersementsClient, useCreateVersementClient, useUpdateVersementClient, useDeleteVersementClient } from "@/hooks/useVersementsClient";
import { useClients, useStatsClients } from "@/hooks/useClients";
import { VersementClient } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

const VersementsClient = () => {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [formOpen, setFormOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [selectedVersement, setSelectedVersement] = useState<VersementClient | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [versementToDelete, setVersementToDelete] = useState<VersementClient | null>(null);

  // Utiliser le filtre backend avec recherche débouncée
  const { data: versementsResponse, isLoading: loadingVersements } = useVersementsClient({
    page,
    limit,
    search: debouncedSearch || undefined,
  });
  const versements = versementsResponse?.data || [];
  const metaVersements = versementsResponse?.meta;

  // Charger les clients pour afficher la liste avec dettes
  const { data: clientsResponse } = useClients({ page: 1, limit: 100 });
  const clients = clientsResponse?.data || [];

  // Utiliser les stats depuis le backend
  const { data: statsClients, isLoading: loadingStatsClients } = useStatsClients();
  const createVersement = useCreateVersementClient();
  const updateVersement = useUpdateVersementClient();
  const deleteVersement = useDeleteVersementClient();

  const handleSubmitVersement = (data: any) => {
    if (selectedVersement) {
      updateVersement.mutate({ id: selectedVersement.id, data });
    } else {
      createVersement.mutate(data);
    }
    setFormOpen(false);
    setSelectedVersement(null);
  };

  const handleEdit = (versement: VersementClient) => {
    setSelectedVersement(versement);
    setFormOpen(true);
  };

  const handleViewDetails = (versement: VersementClient) => {
    setSelectedVersement(versement);
    setDetailsOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedVersement(null);
  };

  const handleDelete = (versement: VersementClient) => {
    setVersementToDelete(versement);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (versementToDelete) {
      deleteVersement.mutate(versementToDelete.id);
      setDeleteDialogOpen(false);
      setVersementToDelete(null);
      if (detailsOpen) {
        setDetailsOpen(false);
      }
    }
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

  const getModeIcon = (mode: string) => {
    if (mode === "mobile_money") return "📱";
    if (mode === "virement") return "🏦";
    if (mode === "cheque") return "📝";
    if (mode === "carte") return "💳";
    return "💵";
  };

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
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Réinitialiser la page quand le filtre change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Calculer les statistiques du mois en cours
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const versementsMois = versements.filter((v: any) => new Date(v.date) >= firstDay);
  const totalMois = versementsMois.reduce((sum: number, v: any) => sum + parseFloat(v.montant), 0);

  // Utiliser les statistiques depuis le backend
  const totalCreditsEnCours = statsClients?.totalCreditsEnCours || 0;
  const clientsEnCredit = statsClients?.avecCredits || 0;

  if (loadingVersements || loadingStatsClients) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Paiements Clients"
        description="Gestion des paiements de dettes et suivi des crédits"
        action={
          <CanAccess permissions={['versements-client.create']}>
            <button
              onClick={() => setFormOpen(true)}
              className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Enregistrer un Paiement
            </button>
          </CanAccess>
        }
      />

      <VersementClientForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        onSubmit={handleSubmitVersement}
        versementClient={selectedVersement || undefined}
      />

      {/* Dialog Confirmation Suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Annuler le Paiement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir annuler ce paiement ? La dette du client sera restaurée.
            </p>
            {versementToDelete && (
              <div className="bg-secondary/50 border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Montant à restaurer</p>
                <p className="text-lg font-heading font-bold text-destructive">
                  {formatPrix(versementToDelete.montant)}
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Détails */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Détails du Paiement</DialogTitle>
          </DialogHeader>
          {selectedVersement && (() => {
            const client = clients.find((c: any) => c.id === selectedVersement.clientId);
            return (
              <div className="space-y-4">
                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Montant versé</p>
                  <p className="text-2xl font-heading font-bold text-success">
                    {formatPrix(selectedVersement.montant)}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Client</p>
                    <p className="text-sm font-semibold text-foreground">{selectedVersement.clientNom}</p>
                  </div>

                  {selectedVersement.venteNumero && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Vente associée</p>
                      <p className="text-sm text-foreground font-mono">{selectedVersement.venteNumero}</p>
                    </div>
                  )}

                  {client && (
                    <div className="bg-secondary/50 border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">Dette actuelle</p>
                        {client.totalCredits > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
                            En dette
                          </span>
                        )}
                        {client.totalCredits === 0 && (
                          <span className="text-xs px-2 py-0.5 rounded bg-success/10 text-success font-medium">
                            À jour
                          </span>
                        )}
                      </div>
                      <p className={`text-lg font-heading font-bold ${client.totalCredits > 0 ? 'text-destructive' : 'text-success'}`}>
                        {formatPrix(client.totalCredits)}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                        <span>Total achats: {formatPrix(client.totalAchats || 0)}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Mode de paiement</p>
                    <p className="text-sm text-foreground">
                      {getModeIcon(selectedVersement.modePaiement)} {getModeLabel(selectedVersement.modePaiement)}
                    </p>
                  </div>

                  {selectedVersement.reference && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Référence</p>
                      <p className="text-sm text-foreground font-mono">{selectedVersement.reference}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Date du paiement</p>
                    <p className="text-sm text-foreground">{formatDate(selectedVersement.date)}</p>
                  </div>

                  {selectedVersement.note && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Note</p>
                      <p className="text-sm text-foreground">{selectedVersement.note}</p>
                    </div>
                  )}

                  {selectedVersement.userNom && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Enregistré par</p>
                      <p className="text-sm text-foreground">{selectedVersement.userNom}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <CanAccess permissions={['versements-client.update']}>
                    <button
                      onClick={() => {
                        setDetailsOpen(false);
                        handleEdit(selectedVersement);
                      }}
                      className="flex-1 py-2.5 rounded-lg gradient-gold text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" /> Modifier
                    </button>
                  </CanAccess>
                  <CanAccess permissions={['versements-client.delete']}>
                    <button
                      onClick={() => {
                        setDetailsOpen(false);
                        handleDelete(selectedVersement);
                      }}
                      className="py-2.5 px-4 rounded-lg border border-destructive/30 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Annuler
                    </button>
                  </CanAccess>
                  <button
                    onClick={() => setDetailsOpen(false)}
                    className="py-2.5 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <StatCard
          title="Crédits en Cours"
          value={formatPrix(totalCreditsEnCours)}
          subtitle={`${clientsEnCredit} clients`}
          icon={<AlertCircle className="w-5 h-5 text-destructive" />}
        />
        <StatCard
          title="Paiements ce Mois"
          value={formatPrix(totalMois)}
          subtitle={`${versementsMois.length} paiements`}
          icon={<Wallet className="w-5 h-5 text-success" />}
        />
        <StatCard
          title="Clients à Jour"
          value={String(clients.length - clientsEnCredit)}
          subtitle={`sur ${clients.length} total`}
          icon={<CheckCircle className="w-5 h-5 text-success" />}
        />
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher par client ou référence..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients avec dettes */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <h3 className="font-heading font-semibold text-base text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Clients avec Dettes
          </h3>
          <div className="space-y-3">
            {clients
              .filter((c: any) => c.totalCredits > 0)
              .sort((a: any, b: any) => b.totalCredits - a.totalCredits)
              .slice(0, 5)
              .map((c: any) => (
                <div key={c.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{c.nom}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>Total achats: {formatPrix(c.totalAchats)}</span>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm font-bold text-destructive whitespace-nowrap">{formatPrix(c.totalCredits)}</p>
                    <p className="text-xs text-muted-foreground">Dette</p>
                  </div>
                </div>
              ))}
            {clients.filter((c: any) => c.totalCredits > 0).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Tous les clients sont à jour !
              </p>
            )}
          </div>
        </div>

        {/* Historique des paiements */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-heading font-semibold text-base text-foreground flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-success" />
              Historique des Paiements
            </h3>
          </div>
          <div className="p-5 space-y-3">
            {versements.map((v: any) => (
              <div key={v.id} className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors rounded-lg px-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 flex items-center justify-center text-2xl flex-shrink-0 bg-secondary/50 rounded-lg">
                    {getModeIcon(v.modePaiement)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{v.clientNom}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{getModeLabel(v.modePaiement)}</span>
                      {v.reference && (
                        <>
                          <span>•</span>
                          <span className="truncate">{v.reference}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-bold text-success whitespace-nowrap">{formatPrix(v.montant)}</p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(v.date)}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleViewDetails(v)}
                      className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                      title="Voir détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <CanAccess permissions={['versements-client.update']}>
                      <button
                        onClick={() => handleEdit(v)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </CanAccess>
                    <CanAccess permissions={['versements-client.delete']}>
                      <button
                        onClick={() => handleDelete(v)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                        title="Annuler"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </CanAccess>
                  </div>
                </div>
              </div>
            ))}
            {versements.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun paiement enregistré
              </p>
            )}
          </div>

          {/* Pagination */}
          {metaVersements && (
            <Pagination meta={metaVersements} onPageChange={setPage} />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default VersementsClient;

import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import VersementForm from "@/components/VersementForm";
import Pagination from "@/components/Pagination";
import CanAccess from "@/components/CanAccess";
import { Plus, Wallet, AlertCircle, Search, ArrowDownRight, CheckCircle, Eye, Edit2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useVersements, useCreateVersement, useUpdateVersement, useMontantsMois } from "@/hooks/useVersements";
import { useFournisseurs, useStatsFournisseurs } from "@/hooks/useFournisseurs";
import { Versement } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/useDebounce";

const Versements = () => {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [formOpen, setFormOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [selectedVersement, setSelectedVersement] = useState<Versement | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Utiliser le filtre backend avec recherche débouncée
  const { data: versementsResponse, isLoading: loadingVersements } = useVersements({
    page,
    limit,
    search: debouncedSearch || undefined,
  });
  const versements = versementsResponse?.data || [];
  const metaVersements = versementsResponse?.meta;

  // Charger les fournisseurs pour afficher la liste avec dettes (TODO: créer endpoint /fournisseurs/top-dettes)
  const { data: fournisseursResponse } = useFournisseurs({ page: 1, limit: 100 });
  const fournisseurs = fournisseursResponse?.data || [];

  // Utiliser les stats depuis le backend
  const { data: statsFournisseurs, isLoading: loadingStatsFournisseurs } = useStatsFournisseurs();
  const { data: montantsMois } = useMontantsMois();
  const createVersement = useCreateVersement();
  const updateVersement = useUpdateVersement();

  const handleSubmitVersement = (data: any) => {
    if (selectedVersement) {
      updateVersement.mutate({ id: selectedVersement.id, data });
    } else {
      createVersement.mutate(data);
    }
    setFormOpen(false);
    setSelectedVersement(null);
  };

  const handleEdit = (versement: Versement) => {
    setSelectedVersement(versement);
    setFormOpen(true);
  };

  const handleViewDetails = (versement: Versement) => {
    setSelectedVersement(versement);
    setDetailsOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedVersement(null);
  };

  const getModeLabel = (mode: string) => {
    const labels: any = {
      especes: "Espèces",
      mobile: "Mobile Money",
      virement: "Virement",
      cheque: "Chèque"
    };
    return labels[mode] || mode;
  };

  const getModeIcon = (mode: string) => {
    if (mode === "mobile") return "📱";
    if (mode === "virement") return "🏦";
    if (mode === "cheque") return "📝";
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

  // Utiliser les statistiques depuis le backend
  const totalDette = statsFournisseurs?.totalDette || 0;
  const fournisseursEnDette = statsFournisseurs?.fournisseursEnDette || 0;

  if (loadingVersements || loadingStatsFournisseurs) {
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
        title="Versements Fournisseurs"
        description="Gestion des paiements et suivi des dettes"
        action={
          <CanAccess permissions={['versements.create']}>
            <button
              onClick={() => setFormOpen(true)}
              className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Enregistrer un Versement
            </button>
          </CanAccess>
        }
      />

      <VersementForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        onSubmit={handleSubmitVersement}
        versement={selectedVersement || undefined}
      />

      {/* Dialog Détails */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Détails du Versement</DialogTitle>
          </DialogHeader>
          {selectedVersement && (() => {
            const fournisseur = fournisseurs.find((f: any) => f.id === selectedVersement.fournisseurId);
            return (
              <div className="space-y-4">
                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Montant versé</p>
                  <p className="text-2xl font-heading font-bold text-foreground">
                    {formatPrix(selectedVersement.montant)}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Fournisseur</p>
                    <p className="text-sm font-semibold text-foreground">{selectedVersement.fournisseurNom}</p>
                  </div>

                  {fournisseur && (
                    <div className="bg-secondary/50 border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">Dette actuelle</p>
                        {fournisseur.dette > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
                            En dette
                          </span>
                        )}
                        {fournisseur.dette === 0 && (
                          <span className="text-xs px-2 py-0.5 rounded bg-success/10 text-success font-medium">
                            À jour
                          </span>
                        )}
                      </div>
                      <p className={`text-lg font-heading font-bold ${fournisseur.dette > 0 ? 'text-destructive' : 'text-success'}`}>
                        {formatPrix(fournisseur.dette)}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                        <span>Total achats: {formatPrix(fournisseur.totalAchats || 0)}</span>
                        <span>•</span>
                        <span>Total payé: {formatPrix(fournisseur.totalPaye || 0)}</span>
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
                  <p className="text-xs text-muted-foreground mb-1">Date du versement</p>
                  <p className="text-sm text-foreground">{formatDate(selectedVersement.date)}</p>
                </div>

                {selectedVersement.note && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Note</p>
                    <p className="text-sm text-foreground">{selectedVersement.note}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Statut</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    selectedVersement.statut === 'valide' ? 'bg-success/10 text-success' :
                    selectedVersement.statut === 'en_attente' ? 'bg-warning/10 text-warning' :
                    'bg-destructive/10 text-destructive'
                  }`}>
                    {selectedVersement.statut === 'valide' ? 'Validé' :
                     selectedVersement.statut === 'en_attente' ? 'En attente' : 'Annulé'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <CanAccess permissions={['versements.update']}>
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
          title="Dette Totale"
          value={formatPrix(totalDette)}
          subtitle={`${fournisseursEnDette} fournisseurs`}
          icon={<AlertCircle className="w-5 h-5 text-destructive" />}
        />
        <StatCard
          title="Versements ce Mois"
          value={formatPrix(montantsMois?.total || 0)}
          subtitle={`${montantsMois?.count || 0} paiements`}
          icon={<Wallet className="w-5 h-5 text-success" />}
        />
        <StatCard
          title="Fournisseurs à Jour"
          value={String(fournisseurs.length - fournisseursEnDette)}
          subtitle={`sur ${fournisseurs.length} total`}
          icon={<CheckCircle className="w-5 h-5 text-success" />}
        />
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fournisseurs avec dettes */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <h3 className="font-heading font-semibold text-base text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Fournisseurs avec Dettes
          </h3>
          <div className="space-y-3">
            {fournisseurs
              .filter((f: any) => f.dette > 0)
              .sort((a: any, b: any) => b.dette - a.dette)
              .slice(0, 5)
              .map((f: any) => (
                <div key={f.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{f.nom}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>Total: {formatPrix(f.totalAchats)}</span>
                      <span>•</span>
                      <span>Versé: {formatPrix(f.totalPaye)}</span>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm font-bold text-destructive whitespace-nowrap">{formatPrix(f.dette)}</p>
                    <p className="text-xs text-muted-foreground">Dette</p>
                  </div>
                </div>
              ))}
            {fournisseurs.filter((f: any) => f.dette > 0).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Tous les fournisseurs sont à jour ! ✅
              </p>
            )}
          </div>
        </div>

        {/* Historique des versements */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-heading font-semibold text-base text-foreground flex items-center gap-2">
              <ArrowDownRight className="w-5 h-5 text-success" />
              Historique des Versements
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
                    <p className="text-sm font-semibold text-foreground truncate">{v.fournisseurNom}</p>
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
                    <CanAccess permissions={['versements.update']}>
                      <button
                        onClick={() => handleEdit(v)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </CanAccess>
                  </div>
                </div>
              </div>
            ))}
            {versements.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun versement enregistré
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

export default Versements;

import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import VersementForm from "@/components/VersementForm";
import FournisseurVersementMobileCard from "@/components/FournisseurVersementMobileCard";
import Pagination from "@/components/Pagination";
import CanAccess from "@/components/CanAccess";
import { Plus, Wallet, AlertCircle, Search, ArrowDownRight, CheckCircle, Eye, Edit2, X, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useVersements, useCreateVersement, useUpdateVersement, useDeleteVersement, useMontantsMois } from "@/hooks/useVersements";
import { useFournisseurs, useStatsFournisseurs } from "@/hooks/useFournisseurs";
import { Versement } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useDebounce } from "@/hooks/useDebounce";
import { versementsApi } from "@/api/versements";

const Versements = () => {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 800);
  const [formOpen, setFormOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [selectedVersement, setSelectedVersement] = useState<Versement | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);
  const [fournisseurVersements, setFournisseurVersements] = useState<any[]>([]);
  const isMobile = useIsMobile();

  // Charger les fournisseurs avec recherche et pagination
  const { data: fournisseursResponse, isLoading: loadingFournisseurs } = useFournisseurs({
    page,
    limit,
    search: debouncedSearch || undefined,
  });
  const fournisseurs = fournisseursResponse?.data || [];
  const fournisseursMeta = fournisseursResponse?.meta;

  // Utiliser les stats depuis le backend
  const { data: statsFournisseurs, isLoading: loadingStatsFournisseurs } = useStatsFournisseurs();
  const { data: montantsMois } = useMontantsMois();
  const createVersement = useCreateVersement();
  const updateVersement = useUpdateVersement();
  const deleteVersement = useDeleteVersement();

  const handleSubmitVersement = (data: any) => {
    if (selectedVersement) {
      updateVersement.mutate({ id: selectedVersement.id, data });
    } else {
      createVersement.mutate(data);
    }
    setFormOpen(false);
    setSelectedVersement(null);
    setSelectedFournisseur(null);
  };

  const handleEdit = (versement: Versement) => {
    setSelectedVersement(versement);
    setSelectedFournisseur(null);
    setFormOpen(true);
  };

  const handleViewDetails = (versement: Versement) => {
    setSelectedVersement(versement);
    setDetailsOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedVersement(null);
    setSelectedFournisseur(null);
  };

  const handleShowHistory = async (fournisseur: any) => {
    setSelectedFournisseur(fournisseur);
    try {
      // Charger tous les versements du fournisseur
      const response = await versementsApi.getAll({ fournisseurId: fournisseur.id, limit: 100 });
      setFournisseurVersements(response.data || []);
      setHistoryDialogOpen(true);
    } catch (error) {
      console.error('Erreur lors du chargement des versements:', error);
      setFournisseurVersements([]);
      setHistoryDialogOpen(true);
    }
  };

  const handleDeleteVersement = (versementId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      deleteVersement.mutate(versementId, {
        onSuccess: () => {
          // Recharger l'historique du fournisseur
          if (selectedFournisseur) {
            handleShowHistory(selectedFournisseur);
          }
        },
      });
    }
  };

  const handlePayFournisseur = (fournisseur: any) => {
    setSelectedFournisseur(fournisseur);
    setFormOpen(true);
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

  if (loadingFournisseurs || loadingStatsFournisseurs) {
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
        fournisseurId={selectedFournisseur?.id}
      />

      {/* Dialog Détails */}
      {isMobile ? (
        <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
          <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col">
            {/* Header mobile */}
            <div className="px-4 py-4 border-b flex-shrink-0">
              <h2 className="font-heading text-base font-bold">Détails du Versement</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
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
            </div>
          </SheetContent>
        </Sheet>
      ) : (
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
      )}

      {/* Stats - cachées sur mobile */}
      <div className="hidden md:grid md:grid-cols-3 gap-5 mb-8">
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

      {/* Version mobile: Cartes */}
      <div className="md:hidden space-y-3 mb-6">
        {fournisseurs.length > 0 ? (
          fournisseurs
            .sort((a: any, b: any) => b.dette - a.dette)
            .map((fournisseur: any) => (
              <FournisseurVersementMobileCard
                key={fournisseur.id}
                fournisseur={fournisseur}
                formatPrix={formatPrix}
                onPay={handlePayFournisseur}
                onViewHistory={handleShowHistory}
              />
            ))
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Wallet className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-foreground font-medium">Aucun fournisseur</p>
            <p className="text-sm text-muted-foreground mt-1">Aucun fournisseur à afficher</p>
          </div>
        )}
      </div>

      {/* Version desktop: Tableau */}
      <div className="hidden md:block bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Liste des Fournisseurs</h3>
        </div>

        {fournisseurs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fournisseur
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Achats
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Dette Actuelle
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fournisseurs
                  .sort((a: any, b: any) => b.dette - a.dette)
                  .map((fournisseur: any) => {
                    const hasDebt = fournisseur.dette > 0;
                    return (
                      <tr key={fournisseur.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-3 px-6">
                          <p className="text-sm font-semibold text-foreground">{fournisseur.nom}</p>
                          {fournisseur.telephone && (
                            <p className="text-xs text-muted-foreground mt-0.5">{fournisseur.telephone}</p>
                          )}
                        </td>
                        <td className="py-3 px-6">
                          <p className="text-sm text-foreground font-medium">{formatPrix(fournisseur.totalAchats || 0)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Payé: {formatPrix(fournisseur.totalPaye || 0)}
                          </p>
                        </td>
                        <td className="py-3 px-6">
                          <p className={`text-sm font-bold ${hasDebt ? 'text-destructive' : 'text-success'}`}>
                            {formatPrix(fournisseur.dette)}
                          </p>
                        </td>
                        <td className="py-3 px-6">
                          {hasDebt ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                              <AlertCircle className="w-3 h-3" />
                              En Dette
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                              <CheckCircle className="w-3 h-3" />
                              À Jour
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-6">
                          <div className="flex items-center justify-end gap-2">
                            {hasDebt && (
                              <CanAccess permissions={['versements.create']}>
                                <button
                                  onClick={() => handlePayFournisseur(fournisseur)}
                                  className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                                  title="Enregistrer un paiement"
                                >
                                  <Wallet className="w-4 h-4" />
                                </button>
                              </CanAccess>
                            )}
                            <button
                              onClick={() => handleShowHistory(fournisseur)}
                              className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                              title="Voir l'historique"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-foreground font-medium">Aucun fournisseur trouvé</p>
            <p className="text-sm mt-1">Commencez par ajouter des fournisseurs</p>
          </div>
        )}
      </div>

      {/* Pagination partagée */}
      {fournisseursMeta && fournisseursMeta.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            meta={fournisseursMeta}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Dialog Historique Fournisseur */}
      {isMobile ? (
        <Sheet open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col">
            {/* Header mobile */}
            <div className="px-4 py-4 border-b flex-shrink-0">
              <h2 className="font-heading text-base font-bold">Historique des Paiements</h2>
              {selectedFournisseur && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedFournisseur.nom} {selectedFournisseur.prenom}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {selectedFournisseur && (
                <div className="space-y-4">
                  {/* Info Fournisseur */}
                  <div className="bg-secondary/50 border border-border rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Achats</p>
                        <p className="text-lg font-heading font-bold text-foreground">
                          {formatPrix(selectedFournisseur.totalAchats || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Payé</p>
                        <p className="text-lg font-heading font-bold text-success">
                          {formatPrix(selectedFournisseur.totalPaye || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Dette Actuelle</p>
                        <p className={`text-lg font-heading font-bold ${selectedFournisseur.dette > 0 ? 'text-destructive' : 'text-success'}`}>
                          {formatPrix(selectedFournisseur.dette)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Statut</p>
                        {selectedFournisseur.dette > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                            <AlertCircle className="w-3 h-3" />
                            En Dette
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                            <CheckCircle className="w-3 h-3" />
                            À Jour
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Liste des paiements */}
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3">
                      Paiements ({fournisseurVersements.length})
                    </p>
                    {fournisseurVersements.length > 0 ? (
                      <div className="space-y-2">
                        {fournisseurVersements.map((versement: any) => (
                          <div
                            key={versement.id}
                            className="p-3 bg-success/10 border border-success/20 rounded-lg flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-success">
                                {formatPrix(versement.montant)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(versement.date)} • {getModeLabel(versement.modePaiement)}
                              </p>
                              {versement.reference && (
                                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                  Réf: {versement.reference}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 ml-3">
                              <button
                                onClick={() => {
                                  setHistoryDialogOpen(false);
                                  handleViewDetails(versement);
                                }}
                                className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                                title="Voir détails"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <CanAccess permissions={['versements.update']}>
                                <button
                                  onClick={() => {
                                    setHistoryDialogOpen(false);
                                    handleEdit(versement);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                                  title="Modifier"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              </CanAccess>
                              <CanAccess permissions={['versements.delete']}>
                                <button
                                  onClick={() => handleDeleteVersement(versement.id)}
                                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </CanAccess>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8 bg-secondary/30 rounded-lg">
                        Aucun paiement enregistré pour ce fournisseur
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Historique des Paiements</DialogTitle>
            </DialogHeader>
            {selectedFournisseur && (
              <div className="space-y-4">
                {/* Info Fournisseur */}
                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                  <p className="text-sm font-semibold text-foreground mb-3">{selectedFournisseur.nom} {selectedFournisseur.prenom}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Achats</p>
                      <p className="text-lg font-heading font-bold text-foreground">
                        {formatPrix(selectedFournisseur.totalAchats || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Payé</p>
                      <p className="text-lg font-heading font-bold text-success">
                        {formatPrix(selectedFournisseur.totalPaye || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Dette Actuelle</p>
                      <p className={`text-lg font-heading font-bold ${selectedFournisseur.dette > 0 ? 'text-destructive' : 'text-success'}`}>
                        {formatPrix(selectedFournisseur.dette)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Statut</p>
                      {selectedFournisseur.dette > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                          <AlertCircle className="w-3 h-3" />
                          En Dette
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                          <CheckCircle className="w-3 h-3" />
                          À Jour
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Liste des paiements */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3">
                    Paiements ({fournisseurVersements.length})
                  </p>
                  {fournisseurVersements.length > 0 ? (
                    <div className="space-y-2">
                      {fournisseurVersements.map((versement: any) => (
                        <div
                          key={versement.id}
                          className="p-3 bg-success/10 border border-success/20 rounded-lg flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-success">
                              {formatPrix(versement.montant)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(versement.date)} • {getModeLabel(versement.modePaiement)}
                            </p>
                            {versement.reference && (
                              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                Réf: {versement.reference}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-3">
                            <button
                              onClick={() => {
                                setHistoryDialogOpen(false);
                                handleViewDetails(versement);
                              }}
                              className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <CanAccess permissions={['versements.update']}>
                              <button
                                onClick={() => {
                                  setHistoryDialogOpen(false);
                                  handleEdit(versement);
                                }}
                                className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                                title="Modifier"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </CanAccess>
                            <CanAccess permissions={['versements.delete']}>
                              <button
                                onClick={() => handleDeleteVersement(versement.id)}
                                className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </CanAccess>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8 bg-secondary/30 rounded-lg">
                      Aucun paiement enregistré pour ce fournisseur
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setHistoryDialogOpen(false)}
                    className="py-2.5 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
};

export default Versements;

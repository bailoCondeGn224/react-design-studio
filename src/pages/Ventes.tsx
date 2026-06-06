import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import VenteForm from "@/components/VenteForm";
import VenteMobileCard from "@/components/VenteMobileCard";
import Pagination from "@/components/Pagination";
import CanAccess from "@/components/CanAccess";
import { Plus, Receipt, CreditCard, Banknote, Smartphone, Edit, Trash, MoreVertical, AlertCircle, Printer, Eye, TrendingUp, DollarSign, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useVentes, useVente, useVenteVersements, useVentesStats, useCreateVente, useUpdateVente, useDeleteVente, useMoisDisponibles } from "@/hooks/useVentes";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { ventesApi } from "@/api/ventes";
import { printInvoice, shareInvoiceWhatsApp } from "@/utils/invoice-generator";
import { useCurrentUser } from "@/hooks/useAuth";
import { toast } from "sonner";

const paymentIcons: Record<string, typeof Banknote> = {
  "especes": Banknote,
  "mobile_money": Smartphone,
  "virement": CreditCard,
  "credit": AlertCircle,
  "acompte_50": CreditCard,
};

const paymentLabels: Record<string, string> = {
  "especes": "Espèces",
  "mobile_money": "Mobile Money",
  "virement": "Virement",
  "credit": "Crédit",
  "acompte_50": "Acompte 50%",
};

const Ventes = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [versementPage, setVersementPage] = useState(1);
  const [versementLimit] = useState(10);

  // État pour le filtre de mois
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const { data: ventesResponse, isLoading } = useVentes({ page, limit });
  const ventes = ventesResponse?.data || [];
  const meta = ventesResponse?.meta;
  const { data: venteDetails } = useVente(detailsId || '');
  const { data: versementsResponse } = useVenteVersements(detailsId, versementPage, versementLimit);
  const versements = versementsResponse?.data || [];
  const versementsMeta = versementsResponse?.meta;
  const { data: statsVentes } = useVentesStats({ mois: selectedMonth, annee: selectedYear });
  const { data: moisDisponibles } = useMoisDisponibles();
  const isMobile = useIsMobile();

  // Reset pagination versements quand on ouvre le dialog
  useEffect(() => {
    if (detailsId) {
      setVersementPage(1);
    }
  }, [detailsId]);
  const user = useCurrentUser();
  const organization = user?.organization;
  const createVente = useCreateVente();
  const updateVente = useUpdateVente();
  const deleteVente = useDeleteVente();

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editingItem) {
      updateVente.mutate({ id: editingItem.id, data });
    } else {
      createVente.mutate(data);
    }
    setEditingItem(null);
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteVente.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingItem(null);
    }
  };

  const handlePrintInvoice = async (id: string) => {
    // Charger les détails complets avant d'imprimer
    try {
      const details = await ventesApi.getById(id);

      // Préparer les informations de l'entreprise depuis organization
      const companyInfo = organization ? {
        nomComplet: organization.nom,
        nomCourt: organization.nomCourt || organization.nom,
        slogan: organization.slogan || '',
        logo: organization.logo ? `${import.meta.env.VITE_API_URL}/organizations/logo/${organization.id}` : undefined,
        email: organization.email || '',
        telephone: organization.telephone || '',
        adresse: organization.adresse || '',
        siteWeb: organization.siteWeb || '',
        rccm: organization.rccm || '',
        nif: organization.nif || '',
        registreCommerce: organization.registreCommerce || '',
        devise: organization.devise || 'GNF',
        mentionsLegales: organization.mentionsLegales || '',
      } : undefined;

      printInvoice({
        numero: details.numero,
        date: details.date,
        heure: details.heure,
        clientNom: `${details.nom} ${details.prenom}`,
        clientTelephone: details.tel,
        lignes: details.lignes || [],
        total: details.total,
        typePaiement: details.modePaiement,
        montantPaye: details.montantPaye,
        montantRestant: details.montantRestant,
        note: details.note,
      }, companyInfo);
    } catch (error) {
      toast.error('Erreur lors du chargement des détails');
    }
  };

  const handleShareWhatsApp = async (id: string) => {
    // Charger les détails complets avant de partager
    try {
      const details = await ventesApi.getById(id);

      // Préparer les informations de l'entreprise
      const companyInfo = organization ? {
        nomComplet: organization.nom,
        nomCourt: organization.nomCourt || organization.nom,
        telephone: organization.telephone || '',
      } : undefined;

      shareInvoiceWhatsApp({
        numero: details.numero,
        date: details.date,
        heure: details.heure,
        clientNom: `${details.nom} ${details.prenom}`,
        clientTelephone: details.tel,
        lignes: details.lignes || [],
        total: details.total,
        typePaiement: details.modePaiement,
        montantPaye: details.montantPaye,
        montantRestant: details.montantRestant,
        note: details.note,
      }, companyInfo);
    } catch (error) {
      toast.error('Erreur lors du chargement des détails');
    }
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

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des ventes...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Gestion des Ventes"
        description="Registre des transactions et suivi commercial"
        action={
          <CanAccess permissions={['ventes.create']}>
            <button onClick={() => setFormOpen(true)} className="gradient-gold text-primary-foreground px-4 h-11 rounded-lg text-sm sm:text-base font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 active:scale-[0.98] transition-all">
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nouvelle Vente</span><span className="sm:hidden">Nouvelle</span>
            </button>
          </CanAccess>
        }
      />

      <VenteForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleSubmit}
        initialData={editingItem}
        mode={editingItem ? 'edit' : 'create'}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler la vente</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette transaction ? Le stock sera restauré.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Détails */}
      {isMobile ? (
        <Sheet open={detailsId !== null} onOpenChange={() => setDetailsId(null)}>
          <SheetContent side="bottom" className="h-[95vh] p-0">
            <div className="h-full flex flex-col">
              <div className="p-4 sm:p-6 border-b sticky top-0 bg-background z-10">
                <h2 className="font-heading text-base sm:text-lg font-bold">Détails de la Vente</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {venteDetails && (
            <div className="space-y-3 sm:space-y-4 overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Numéro</p>
                  <p className="font-semibold">{venteDetails.numero}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-semibold">{formatDate(venteDetails.date)} à {venteDetails.heure}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Statut</p>
                  {venteDetails.statut === 'annulee' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      Annulée
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Active
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Client</p>
                  <p className="font-semibold">{venteDetails.nom} {venteDetails.prenom}</p>
                  {venteDetails.tel && (
                    <p className="text-xs text-muted-foreground">Tél: {venteDetails.tel}</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Articles vendus ({venteDetails.lignes?.length || 0})
                </p>
                <div className="space-y-2">
                  {venteDetails.lignes && venteDetails.lignes.length > 0 ? (
                    venteDetails.lignes.map((ligne: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg text-sm">
                        <div>
                          <p className="font-semibold">{ligne.nom}</p>
                          <p className="text-xs text-muted-foreground">
                            {ligne.quantite} × {formatPrix(ligne.prixUnitaire)}
                          </p>
                        </div>
                        <p className="font-bold">{formatPrix(ligne.sousTotal)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun article</p>
                  )}
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mode de paiement initial</span>
                  <span className="font-semibold">{paymentLabels[venteDetails.modePaiement] || venteDetails.modePaiement}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-lg">{formatPrix(venteDetails.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Montant payé</span>
                  <span className="font-semibold text-success">{formatPrix(venteDetails.montantPaye)}</span>
                </div>
                {venteDetails.montantRestant > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Montant restant</span>
                    <span className="font-semibold text-destructive">{formatPrix(venteDetails.montantRestant)}</span>
                  </div>
                )}
              </div>

              {/* Historique des paiements */}
              {versements && versements.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Historique des Paiements ({versementsMeta?.total || versements.length})
                  </p>
                  <div className="space-y-2">
                    {versements.map((versement: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-success/10 border border-success/20 rounded-lg text-sm">
                        <div>
                          <p className="font-semibold text-success">{formatPrix(versement.montant)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(versement.date)} • {paymentLabels[versement.modePaiement] || versement.modePaiement}
                          </p>
                          {versement.reference && (
                            <p className="text-xs text-muted-foreground">Réf: {versement.reference}</p>
                          )}
                          {versement.note && (
                            <p className="text-xs text-muted-foreground italic mt-1">{versement.note}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Par: {versement.userNom || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination si nécessaire */}
                  {versementsMeta && versementsMeta.totalPages > 1 && (
                    <div className="mt-2 -mx-1">
                      <Pagination
                        meta={versementsMeta}
                        onPageChange={setVersementPage}
                      />
                    </div>
                  )}
                </div>
              )}

              {venteDetails.note && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Note</p>
                  <p className="text-sm p-3 bg-secondary/30 rounded-lg">{venteDetails.note}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SheetContent>
  </Sheet>
      ) : (
        <Dialog open={detailsId !== null} onOpenChange={() => setDetailsId(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="font-heading text-base sm:text-lg">Détails de la Vente</DialogTitle>
            </DialogHeader>
            {venteDetails && (
              <div className="space-y-3 sm:space-y-4 overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Numéro</p>
                    <p className="font-semibold">{venteDetails.numero}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-semibold">{formatDate(venteDetails.date)} à {venteDetails.heure}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Statut</p>
                    {venteDetails.statut === 'annulee' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Annulée
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Active
                      </span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Client</p>
                    <p className="font-semibold">{venteDetails.nom} {venteDetails.prenom}</p>
                    {venteDetails.tel && (
                      <p className="text-xs text-muted-foreground">Tél: {venteDetails.tel}</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Articles vendus ({venteDetails.lignes?.length || 0})
                  </p>
                  <div className="space-y-2">
                    {venteDetails.lignes && venteDetails.lignes.length > 0 ? (
                      venteDetails.lignes.map((ligne: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg text-sm">
                          <div>
                            <p className="font-semibold">{ligne.nom}</p>
                            <p className="text-xs text-muted-foreground">
                              {ligne.quantite} × {formatPrix(ligne.prixUnitaire)}
                            </p>
                          </div>
                          <p className="font-bold">{formatPrix(ligne.sousTotal)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">Aucun article</p>
                    )}
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mode de paiement initial</span>
                    <span className="font-semibold">{paymentLabels[venteDetails.modePaiement] || venteDetails.modePaiement}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold text-lg">{formatPrix(venteDetails.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Montant payé</span>
                    <span className="font-semibold text-success">{formatPrix(venteDetails.montantPaye)}</span>
                  </div>
                  {venteDetails.montantRestant > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Montant restant</span>
                      <span className="font-semibold text-destructive">{formatPrix(venteDetails.montantRestant)}</span>
                    </div>
                  )}
                </div>

                {/* Historique des paiements */}
                {versements && versements.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">
                      Historique des Paiements ({versementsMeta?.total || versements.length})
                    </p>
                    <div className="space-y-2">
                      {versements.map((versement: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-success/10 border border-success/20 rounded-lg text-sm">
                          <div>
                            <p className="font-semibold text-success">{formatPrix(versement.montant)}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(versement.date)} • {paymentLabels[versement.modePaiement] || versement.modePaiement}
                            </p>
                            {versement.reference && (
                              <p className="text-xs text-muted-foreground">Réf: {versement.reference}</p>
                            )}
                            {versement.note && (
                              <p className="text-xs text-muted-foreground italic mt-1">{versement.note}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Par: {versement.userNom || 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination si nécessaire */}
                    {versementsMeta && versementsMeta.totalPages > 1 && (
                      <div className="mt-2 -mx-1">
                        <Pagination
                          meta={versementsMeta}
                          onPageChange={setVersementPage}
                        />
                      </div>
                    )}
                  </div>
                )}

                {venteDetails.note && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Note</p>
                    <p className="text-sm p-3 bg-secondary/30 rounded-lg">{venteDetails.note}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Filtre de mois/année */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-foreground">Statistiques</h3>
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 text-sm border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {[
              { value: 1, label: 'Janvier' },
              { value: 2, label: 'Février' },
              { value: 3, label: 'Mars' },
              { value: 4, label: 'Avril' },
              { value: 5, label: 'Mai' },
              { value: 6, label: 'Juin' },
              { value: 7, label: 'Juillet' },
              { value: 8, label: 'Août' },
              { value: 9, label: 'Septembre' },
              { value: 10, label: 'Octobre' },
              { value: 11, label: 'Novembre' },
              { value: 12, label: 'Décembre' },
            ].map(month => {
              // Désactiver les mois futurs
              const isFutureMonth = selectedYear === now.getFullYear() && month.value > (now.getMonth() + 1);

              // Désactiver les mois sans ventes
              const hasVentes = moisDisponibles?.some(
                m => m.annee === selectedYear && m.mois === month.value
              );

              const isDisabled = isFutureMonth || !hasVentes;

              return (
                <option key={month.value} value={month.value} disabled={isDisabled}>
                  {month.label}{!hasVentes && !isFutureMonth ? ' (vide)' : ''}
                </option>
              );
            })}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 text-sm border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {(() => {
              // Année de création de l'organisation (ou 2020 par défaut)
              const orgCreationYear = organization?.createdAt
                ? new Date(organization.createdAt).getFullYear()
                : 2020;

              const startYear = Math.max(orgCreationYear, 2020);
              const currentYear = now.getFullYear();
              const yearsCount = currentYear - startYear + 1;

              return Array.from({ length: yearsCount }, (_, i) => currentYear - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ));
            })()}
          </select>
        </div>
      </div>

      {/* Message si aucune donnée */}
      {statsVentes?.mois && statsVentes.mois.count === 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Aucune vente enregistrée</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Aucune donnée disponible pour {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][selectedMonth - 1]} {selectedYear}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques du mois */}
      {statsVentes?.mois && statsVentes.mois.count > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ventes du Mois</p>
                <p className="text-xl font-bold text-foreground">{formatPrix(statsVentes.mois.total)}</p>
                <p className="text-xs text-muted-foreground">{statsVentes.mois.count} ventes</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bénéfice du Mois</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatPrix(statsVentes.mois.benefice || 0)}</p>
                <p className="text-xs text-muted-foreground">Marge totale</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dettes du Mois</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatPrix(statsVentes.mois.dette || 0)}</p>
                <p className="text-xs text-muted-foreground">Crédits en cours</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version mobile: Cartes */}
      <div className="md:hidden space-y-3 mb-6">
        {ventes.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground">Aucune vente enregistrée</p>
          </div>
        ) : (
          ventes.map((vente: any) => (
            <VenteMobileCard
              key={vente.id}
              vente={vente}
              onEdit={handleEdit}
              onDelete={setDeleteId}
              onViewDetails={setDetailsId}
              onPrintInvoice={handlePrintInvoice}
              onShareWhatsApp={handleShareWhatsApp}
              formatPrix={formatPrix}
              formatDate={formatDate}
            />
          ))
        )}
      </div>

      {/* Version desktop: Tableau */}
      <div className="hidden md:block bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-secondary border-b border-border">
                <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Numéro</th>
                <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Client</th>
                <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">Articles</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Quantité</th>
                <th className="text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Total</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Paiement</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Date</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">Statut</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ventes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                    Aucune vente enregistrée
                  </td>
                </tr>
              ) : (
                ventes.map((item: any) => {
                  const Icon = paymentIcons[item.modePaiement] || Receipt;
                  const hasCredit = item.montantRestant > 0;

                  return (
                    <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-semibold text-foreground">{item.numero}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {item.nom} {item.prenom}
                          </p>
                          {item.tel && (
                            <p className="text-xs text-muted-foreground">{item.tel}</p>
                          )}
                          {hasCredit && (
                            <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-semibold bg-destructive/10 text-destructive mt-1">
                              Crédit: {formatPrix(item.montantRestant)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                        {item.lignes && item.lignes.length > 0 ? (
                          <div className="text-sm text-foreground">
                            {item.lignes.slice(0, 3).map((ligne: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between gap-2 py-0.5">
                                <span className="truncate">{ligne.nom}</span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">×{ligne.quantite}</span>
                              </div>
                            ))}
                            {item.lignes.length > 3 && (
                              <div className="text-xs text-primary font-medium mt-1 cursor-pointer hover:underline" onClick={() => setDetailsId(item.id)}>
                                + {item.lignes.length - 3} autre{item.lignes.length - 3 > 1 ? 's' : ''} article{item.lignes.length - 3 > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-center hidden md:table-cell">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                          <span className="text-sm font-bold">
                            {item.lignes && item.lignes.length > 0
                              ? item.lignes.reduce((sum: number, ligne: any) => sum + (ligne.quantite || 0), 0)
                              : 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                        <p className="text-sm font-bold text-foreground">{formatPrix(item.total)}</p>
                        {item.montantPaye < item.total && (
                          <p className="text-xs text-success">Payé: {formatPrix(item.montantPaye)}</p>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-center hidden md:table-cell">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{paymentLabels[item.modePaiement] || item.modePaiement}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs text-muted-foreground hidden sm:table-cell">
                        <div>
                          <p>{formatDate(item.date)}</p>
                          <p className="text-[10px]">{item.heure}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-center hidden lg:table-cell">
                        {item.statut === 'annulee' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Annulée
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-muted-foreground hover:text-foreground transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDetailsId(item.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrintInvoice(item.id)}>
                              <Printer className="w-4 h-4 mr-2" />
                              Imprimer Facture
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShareWhatsApp(item.id)}>
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Partager sur WhatsApp
                            </DropdownMenuItem>
                            <CanAccess permissions={['ventes.update']}>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(item)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                            </CanAccess>
                            <CanAccess permissions={['ventes.delete']}>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteId(item.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </CanAccess>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination partagée */}
      {meta && (
        <div className="mt-6">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}
    </AppLayout>
  );
};

export default Ventes;

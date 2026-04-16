import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import ApprovisionnementForm from "@/components/ApprovisionnementForm";
import Pagination from "@/components/Pagination";
import CanAccess from "@/components/CanAccess";
import { Truck, Package, CreditCard, Search, Plus, Edit, Trash, MoreVertical, Eye, Printer } from "lucide-react";
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
import { useApprovisionnements, useApprovisionnement, useCreateApprovisionnement, useUpdateApprovisionnement, useDeleteApprovisionnement } from "@/hooks/useApprovisionnements";
import { useStockAlerts } from "@/hooks/useStock";
import { approvisionnementsApi } from "@/api/approvisionnements";
import { printInvoice } from "@/utils/invoice-generator";
import { useParametres } from "@/hooks/useParametres";
import { parametresApi } from "@/api/parametres";
import { toast } from "sonner";

const Approvisionnements = () => {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  // Utiliser le filtre backend
  const { data: approvisionnementsResponse, isLoading } = useApprovisionnements({
    page,
    limit,
    search: search || undefined,
  });
  const approvisionnements = approvisionnementsResponse?.data || [];
  const meta = approvisionnementsResponse?.meta;
  const { data: approvisionnementDetails } = useApprovisionnement(detailsId || '');
  const { data: articlesAlerts = [] } = useStockAlerts();
  const { data: parametres } = useParametres();
  const createApprovisionnement = useCreateApprovisionnement();
  const updateApprovisionnement = useUpdateApprovisionnement();
  const deleteApprovisionnement = useDeleteApprovisionnement();

  // Articles à réapprovisionner (déjà filtrés par le backend)
  const articlesAReapprovisionner = articlesAlerts.slice(0, 6);

  // Catégoriser les articles pour le compteur
  const articlesEnRupture = articlesAlerts.filter((a: any) => a.stock === 0);
  const articlesStockCritique = articlesAlerts.filter((a: any) => a.stock > 0 && a.stock <= a.seuilAlerte * 0.3);
  const articlesStockFaible = articlesAlerts.filter((a: any) => a.stock > a.seuilAlerte * 0.3 && a.stock <= a.seuilAlerte);
  const totalArticlesEnAlerte = articlesAlerts.length;

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editingItem) {
      updateApprovisionnement.mutate({ id: editingItem.id, data });
    } else {
      createApprovisionnement.mutate(data);
    }
    setEditingItem(null);
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteApprovisionnement.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingItem(null);
    }
  };

  const handlePrintReceipt = async (id: string) => {
    // Charger les détails complets avant d'imprimer
    try {
      const details = await approvisionnementsApi.getById(id);

      // Préparer les informations de l'entreprise
      const companyInfo = parametres ? {
        nomComplet: parametres.nomComplet,
        nomCourt: parametres.nomCourt,
        slogan: parametres.slogan,
        logo: parametres.logo ? parametresApi.getLogoUrl() : undefined,
        email: parametres.email,
        telephone: parametres.telephone,
        adresse: parametres.adresse,
        siteWeb: parametres.siteWeb,
        rccm: parametres.rccm,
        nif: parametres.nif,
        registreCommerce: parametres.registreCommerce,
        devise: parametres.devise,
        mentionsLegales: parametres.mentionsLegales,
      } : undefined;

      printInvoice({
        numero: details.numero,
        date: details.dateLivraison,
        clientNom: details.fournisseurNom,
        clientTelephone: details.fournisseurTelephone,
        lignes: details.lignes || [],
        total: details.total,
        typePaiement: 'virement',
        montantPaye: details.montantPaye,
        montantRestant: details.montantRestant,
        note: details.note || `Facture fournisseur N°: ${details.numeroFacture || 'N/A'}`,
      }, companyInfo);
    } catch (error) {
      toast.error('Erreur lors du chargement des détails');
    }
  };

  // Réinitialiser la page quand le filtre change
  useEffect(() => {
    setPage(1);
  }, [search]);

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

  // Calculer statistiques
  const totalApprovisionnements = approvisionnements.length;
  const montantTotal = approvisionnements.reduce((sum: number, a: any) => sum + (Number(a.total) || 0), 0);
  const montantTotalPaye = approvisionnements.reduce((sum: number, a: any) => sum + (Number(a.montantPaye) || 0), 0);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des approvisionnements...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Gestion des Approvisionnements"
        description="Suivi des livraisons fournisseurs et mises à jour stock"
        action={
          <CanAccess permissions={['approvisionnements.create']}>
            <button onClick={() => setFormOpen(true)} className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Nouvel Approvisionnement
            </button>
          </CanAccess>
        }
      />

      <ApprovisionnementForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleSubmit}
        initialData={editingItem}
        mode={editingItem ? 'edit' : 'create'}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler l'approvisionnement</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler cet approvisionnement ? Le stock sera ajusté en conséquence.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Détails */}
      <Dialog open={detailsId !== null} onOpenChange={() => setDetailsId(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Détails Approvisionnement</DialogTitle>
          </DialogHeader>
          {approvisionnementDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Numéro</p>
                  <p className="font-semibold">{approvisionnementDetails.numero}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fournisseur</p>
                  <p className="font-semibold">{approvisionnementDetails.fournisseurNom}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date livraison</p>
                  <p className="font-semibold">{formatDate(approvisionnementDetails.dateLivraison)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Numéro facture</p>
                  <p className="font-semibold">{approvisionnementDetails.numeroFacture || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Articles</p>
                <div className="space-y-2">
                  {approvisionnementDetails.lignes.map((ligne: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg text-sm">
                      <div>
                        <p className="font-semibold">{ligne.nom}</p>
                        <p className="text-xs text-muted-foreground">
                          {ligne.quantite} × {formatPrix(ligne.prixUnitaire)}
                        </p>
                      </div>
                      <p className="font-bold">{formatPrix(ligne.sousTotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-lg">{formatPrix(approvisionnementDetails.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Montant payé</span>
                  <span className="font-semibold text-success">{formatPrix(approvisionnementDetails.montantPaye)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Montant restant</span>
                  <span className="font-semibold text-destructive">{formatPrix(approvisionnementDetails.montantRestant)}</span>
                </div>
              </div>

              {approvisionnementDetails.note && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Note</p>
                  <p className="text-sm p-3 bg-secondary/30 rounded-lg">{approvisionnementDetails.note}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Articles à Réapprovisionner */}
      {articlesAReapprovisionner.length > 0 && (
        <div className="bg-gradient-to-r from-warning/10 via-destructive/10 to-warning/10 border border-warning rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-warning flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Articles à Réapprovisionner</h3>
                <p className="text-xs text-muted-foreground">{totalArticlesEnAlerte} articles nécessitent une attention</p>
              </div>
            </div>
            <CanAccess permissions={['approvisionnements.create']}>
              <button
                onClick={() => setFormOpen(true)}
                className="text-xs px-3 py-1.5 rounded-lg bg-warning text-white hover:bg-warning/90 transition-colors font-medium"
              >
                Créer Approvisionnement
              </button>
            </CanAccess>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {articlesAReapprovisionner.map((article: any) => {
              const isRupture = article.stock === 0;
              const isCritique = article.stock > 0 && article.stock <= article.seuilAlerte * 0.3;

              return (
                <div key={article.id} className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{article.nom}</p>
                      <p className="text-xs text-muted-foreground">Zone {article.zone}</p>
                    </div>
                    {isRupture ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive text-destructive-foreground whitespace-nowrap ml-2">
                        RUPTURE
                      </span>
                    ) : isCritique ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/20 text-destructive whitespace-nowrap ml-2">
                        CRITIQUE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning/20 text-warning whitespace-nowrap ml-2">
                        FAIBLE
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Stock actuel</p>
                      <p className={`font-bold ${isRupture ? 'text-destructive' : isCritique ? 'text-destructive' : 'text-warning'}`}>
                        {article.stock}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Seuil mini</p>
                      <p className="font-bold text-foreground">{article.seuilAlerte}</p>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-[10px] text-muted-foreground mb-1">Suggestion</p>
                    <p className="text-xs font-semibold text-success">
                      Commander: {Math.max(article.seuilAlerte * 2 - article.stock, article.seuilAlerte)} unités
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {(totalArticlesEnAlerte) > 6 && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              + {(totalArticlesEnAlerte) - 6} autres articles nécessitent un réapprovisionnement
            </p>
          )}
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Approvisionnements</p>
              <p className="text-xl font-bold text-foreground">{totalApprovisionnements}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Montant Total</p>
              <p className="text-lg font-bold text-foreground">{formatPrix(montantTotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Payé</p>
              <p className="text-lg font-bold text-foreground">{formatPrix(montantTotalPaye)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par numéro, fournisseur, facture..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-secondary border-b border-border">
                <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Numéro</th>
                <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Fournisseur</th>
                <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Date</th>
                <th className="text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Total</th>
                <th className="text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Payé</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Statut</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {approvisionnements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Aucun approvisionnement trouvé
                  </td>
                </tr>
              ) : (
                approvisionnements.map((item: any) => (
                  <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <p className="text-sm font-semibold text-foreground">{item.numero}</p>
                      {item.numeroFacture && (
                        <p className="text-xs text-muted-foreground">Fact. {item.numeroFacture}</p>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <p className="text-sm font-medium text-foreground">{item.fournisseurNom}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-muted-foreground hidden md:table-cell">
                      {formatDate(item.dateLivraison)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right text-sm font-bold text-foreground">
                      {formatPrix(item.total)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right text-sm font-semibold text-success hidden sm:table-cell">
                      {formatPrix(item.montantPaye)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                      {item.montantRestant > 0 ? (
                        <span className="inline-flex items-center text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-semibold bg-warning/10 text-warning">
                          Partiel
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-semibold bg-success/10 text-success">
                          Payé
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
                          <DropdownMenuItem onClick={() => handlePrintReceipt(item.id)}>
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimer Reçu
                          </DropdownMenuItem>
                          <CanAccess permissions={['approvisionnements.update']}>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                          </CanAccess>
                          <CanAccess permissions={['approvisionnements.delete']}>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteId(item.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Annuler
                            </DropdownMenuItem>
                          </CanAccess>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && (
          <Pagination meta={meta} onPageChange={setPage} />
        )}
      </div>
    </AppLayout>
  );
};

export default Approvisionnements;

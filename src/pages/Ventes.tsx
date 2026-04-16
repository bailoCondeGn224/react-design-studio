import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import VenteForm from "@/components/VenteForm";
import Pagination from "@/components/Pagination";
import CanAccess from "@/components/CanAccess";
import { Plus, Receipt, CreditCard, Banknote, Smartphone, Edit, Trash, MoreVertical, AlertCircle, Printer, Eye, TrendingUp, DollarSign } from "lucide-react";
import { useState } from "react";
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
import { useVentes, useVente, useVentesStats, useCreateVente, useUpdateVente, useDeleteVente } from "@/hooks/useVentes";
import { ventesApi } from "@/api/ventes";
import { printInvoice } from "@/utils/invoice-generator";
import { useParametres } from "@/hooks/useParametres";
import { parametresApi } from "@/api/parametres";
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

  const { data: ventesResponse, isLoading } = useVentes({ page, limit });
  const ventes = ventesResponse?.data || [];
  const meta = ventesResponse?.meta;
  const { data: venteDetails } = useVente(detailsId || '');
  const { data: statsVentes } = useVentesStats();
  const { data: parametres } = useParametres();
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
            <button onClick={() => setFormOpen(true)} className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Nouvelle Vente
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
      <Dialog open={detailsId !== null} onOpenChange={() => setDetailsId(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Détails de la Vente</DialogTitle>
          </DialogHeader>
          {venteDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Numéro</p>
                  <p className="font-semibold">{venteDetails.numero}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-semibold">{formatDate(venteDetails.date)} à {venteDetails.heure}</p>
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
                <p className="text-sm text-muted-foreground mb-2">Articles vendus</p>
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
                  <span className="text-muted-foreground">Mode de paiement</span>
                  <span className="font-semibold">{paymentLabels[venteDetails.modePaiement] || venteDetails.modePaiement}</span>
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
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-lg">{formatPrix(venteDetails.total)}</span>
                </div>
              </div>

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

      {/* Statistiques du mois */}
      {statsVentes?.mois && (
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

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-secondary border-b border-border">
                <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Numéro</th>
                <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Client</th>
                <th className="text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Total</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Paiement</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Date</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ventes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
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

        {/* Pagination */}
        {meta && (
          <Pagination meta={meta} onPageChange={setPage} />
        )}
      </div>
    </AppLayout>
  );
};

export default Ventes;

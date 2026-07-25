import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import CommandeForm from "@/components/CommandeForm";
import CommandeMobileCard from "@/components/CommandeMobileCard";
import CommandeReceipt from "@/components/CommandeReceipt";
import Pagination from "@/components/Pagination";
import CanAccess from "@/components/CanAccess";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import FormField from "@/components/FormField";
import { Plus, MoreVertical, Eye, Edit, Trash2, CheckCircle, XCircle, Package, Printer, User, Calendar, ShoppingBag, DollarSign, AlertTriangle, Filter, X, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  useCommandes,
  useCommandesStats,
  useCommandeLignes,
  useCreateCommande,
  useUpdateCommande,
  useLivrerCommande,
  useAnnulerCommande,
  useDeleteCommande,
} from "@/hooks/useCommandes";
import { useClients } from "@/hooks/useClients";
import { Commande } from "@/types";

const Commandes = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    statut: "",
    clientId: "",
    dateDebut: "",
    dateFin: "",
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingCommande, setEditingCommande] = useState<Commande | null>(null);
  const [detailsCommande, setDetailsCommande] = useState<Commande | null>(null);
  const [livrerCommande, setLivrerCommande] = useState<Commande | null>(null);
  const [livrerData, setLivrerData] = useState({ montantPaye: 0, modePaiement: "especes", note: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [annulerId, setAnnulerId] = useState<string | null>(null);
  const [printCommande, setPrintCommande] = useState<Commande | null>(null);
  const [lignesPage, setLignesPage] = useState(1);
  const [lignesLimit] = useState(10);
  const [filtresOpen, setFiltresOpen] = useState(false);
  const isMobile = useIsMobile();

  // Hooks
  const { data: commandesResponse, isLoading } = useCommandes({ page, limit: 15, ...filters });
  const { data: stats } = useCommandesStats();
  const { data: clientsResponse } = useClients({ page: 1, limit: 100 });
  const { data: lignesResponse } = useCommandeLignes(detailsCommande?.id || null, lignesPage, lignesLimit);
  const lignes = lignesResponse?.data || [];
  const lignesMeta = lignesResponse?.meta;
  const createCommande = useCreateCommande();
  const updateCommande = useUpdateCommande();
  const livrerCommandeMutation = useLivrerCommande();
  const annulerCommande = useAnnulerCommande();
  const deleteCommande = useDeleteCommande();

  const commandes = commandesResponse?.data || [];
  const meta = commandesResponse?.meta;
  const clients = clientsResponse?.data || [];

  // Reset pagination lignes quand on ouvre le dialog
  useEffect(() => {
    if (detailsCommande) {
      setLignesPage(1);
    }
  }, [detailsCommande?.id]);

  const handleCreate = (data: any) => {
    createCommande.mutate(data);
    setFormOpen(false);
  };

  const handleUpdate = (data: any) => {
    if (editingCommande) {
      updateCommande.mutate({ id: editingCommande.id, data });
      setEditingCommande(null);
    }
  };

  const handleLivrer = () => {
    if (livrerCommande) {
      livrerCommandeMutation.mutate(
        { id: livrerCommande.id, data: livrerData },
        {
          onSuccess: () => {
            setLivrerCommande(null);
            setLivrerData({ montantPaye: 0, modePaiement: "especes", note: "" });
          },
        }
      );
    }
  };

  const handleAnnuler = () => {
    if (annulerId) {
      annulerCommande.mutate(annulerId, {
        onSuccess: () => setAnnulerId(null),
      });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteCommande.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'livree':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Livrée</Badge>;
      case 'annulee':
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge>{statut}</Badge>;
    }
  };

  const countActiveFilters = () => {
    let count = 0;
    if (filters.statut) count++;
    if (filters.clientId) count++;
    if (filters.dateDebut) count++;
    if (filters.dateFin) count++;
    return count;
  };

  const resetFilters = () => {
    setFilters({
      statut: "",
      clientId: "",
      dateDebut: "",
      dateFin: "",
    });
  };

  const formatPrix = (montant: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(montant).replace('GNF', 'GNF');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const calculateTotalPaye = () => {
    if (!livrerCommande) return 0;
    return Number(livrerCommande.acompte) + Number(livrerData.montantPaye);
  };

  const calculateRestant = () => {
    if (!livrerCommande) return 0;
    return Number(livrerCommande.total) - calculateTotalPaye();
  };

  return (
    <AppLayout>
      <PageHeader
        title="Gestion des Commandes"
        description="Commandes clients en attente et historique"
        action={
          <CanAccess permissions={['commandes.create']}>
            <Button onClick={() => setFormOpen(true)} className="h-11">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nouvelle Commande</span>
              <span className="sm:hidden">Nouvelle</span>
            </Button>
          </CanAccess>
        }
      />

      {/* Statistiques */}
      {stats && (
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-yellow-50 border-yellow-200 p-4 rounded-lg border">
            <div className="text-sm text-yellow-800">En attente</div>
            <div className="text-2xl font-bold text-yellow-900">{stats.enAttente}</div>
          </div>
          <div className="bg-green-50 border-green-200 p-4 rounded-lg border">
            <div className="text-sm text-green-800">Livrées</div>
            <div className="text-2xl font-bold text-green-900">{stats.livrees}</div>
          </div>
          <div className="bg-red-50 border-red-200 p-4 rounded-lg border">
            <div className="text-sm text-red-800">Annulées</div>
            <div className="text-2xl font-bold text-red-900">{stats.annulees}</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-sm text-muted-foreground">Acomptes</div>
            <div className="text-lg font-bold">{formatPrix(stats.totalAcomptes)}</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-sm text-muted-foreground">Valeur en attente</div>
            <div className="text-lg font-bold">{formatPrix(stats.valeurEnAttente)}</div>
          </div>
        </div>
      )}

      {/* Filtres version mobile */}
      <div className="md:hidden mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltresOpen(true)}
            className="flex-1 flex items-center justify-between h-11 px-4 rounded-lg border-2 border-border bg-card hover:bg-secondary/50 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filtres</span>
              {countActiveFilters() > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {countActiveFilters()}
                </span>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          {countActiveFilters() > 0 && (
            <button
              onClick={resetFilters}
              className="h-11 px-4 rounded-lg border border-border bg-card hover:bg-destructive/10 active:scale-[0.98] transition-all"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Chips des filtres actifs */}
        {countActiveFilters() > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.statut && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-xs font-medium text-primary">
                  {filters.statut === 'en_attente' ? 'En attente' : filters.statut === 'livree' ? 'Livrée' : 'Annulée'}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, statut: "" })}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3 text-primary" />
                </button>
              </div>
            )}
            {filters.clientId && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {clients.find((c: any) => c.id === filters.clientId)?.nom || 'Client'}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, clientId: "" })}
                  className="hover:bg-blue-200 dark:hover:bg-blue-900 rounded-full p-0.5"
                >
                  <X className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </button>
              </div>
            )}
            {filters.dateDebut && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                <Calendar className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                  Depuis {formatDate(filters.dateDebut)}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, dateDebut: "" })}
                  className="hover:bg-purple-200 dark:hover:bg-purple-900 rounded-full p-0.5"
                >
                  <X className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                </button>
              </div>
            )}
            {filters.dateFin && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                <Calendar className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                  Jusqu'au {formatDate(filters.dateFin)}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, dateFin: "" })}
                  className="hover:bg-purple-200 dark:hover:bg-purple-900 rounded-full p-0.5"
                >
                  <X className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sheet Filtres Mobile */}
      <Sheet open={filtresOpen} onOpenChange={setFiltresOpen}>
        <SheetContent side="bottom" className="h-[85vh] p-0">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="px-4 py-4 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <h2 className="font-heading text-lg font-bold">Filtres</h2>
              </div>
              {countActiveFilters() > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <FormField
                label="Statut"
                as="select"
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: (e.target as HTMLSelectElement).value })}
              >
                <option value="">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="livree">Livrée</option>
                <option value="annulee">Annulée</option>
              </FormField>

              <FormField
                label="Client"
                as="select"
                value={filters.clientId}
                onChange={(e) => setFilters({ ...filters, clientId: (e.target as HTMLSelectElement).value })}
              >
                <option value="">Tous les clients</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </FormField>

              <FormField
                label="Date début"
                type="date"
                value={filters.dateDebut}
                onChange={(e) => setFilters({ ...filters, dateDebut: (e.target as HTMLInputElement).value })}
              />

              <FormField
                label="Date fin"
                type="date"
                value={filters.dateFin}
                onChange={(e) => setFilters({ ...filters, dateFin: (e.target as HTMLInputElement).value })}
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-card">
              <button
                onClick={() => setFiltresOpen(false)}
                className="w-full h-12 rounded-lg gradient-gold text-primary-foreground font-semibold active:scale-[0.98] transition-all"
              >
                Appliquer les filtres
                {countActiveFilters() > 0 && ` (${countActiveFilters()})`}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Filtres version desktop */}
      <div className="hidden md:grid md:grid-cols-4 gap-4 mb-6">
        <FormField
          label="Statut"
          as="select"
          value={filters.statut}
          onChange={(e) => setFilters({ ...filters, statut: (e.target as HTMLSelectElement).value })}
        >
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="livree">Livrée</option>
          <option value="annulee">Annulée</option>
        </FormField>

        <FormField
          label="Client"
          as="select"
          value={filters.clientId}
          onChange={(e) => setFilters({ ...filters, clientId: (e.target as HTMLSelectElement).value })}
        >
          <option value="">Tous les clients</option>
          {clients.map((c: any) => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </FormField>

        <FormField
          label="Date début"
          type="date"
          value={filters.dateDebut}
          onChange={(e) => setFilters({ ...filters, dateDebut: (e.target as HTMLInputElement).value })}
        />

        <FormField
          label="Date fin"
          type="date"
          value={filters.dateFin}
          onChange={(e) => setFilters({ ...filters, dateFin: (e.target as HTMLInputElement).value })}
        />
      </div>

      {/* Version mobile: Cartes */}
      <div className="md:hidden space-y-3 mb-6">
        {isLoading ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : commandes.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground">Aucune commande trouvée</p>
          </div>
        ) : (
          commandes.map((commande: Commande) => (
            <CommandeMobileCard
              key={commande.id}
              commande={commande}
              clientNom={clients.find((c: any) => c.id === commande.clientId)?.nom || 'Client inconnu'}
              onViewDetails={setDetailsCommande}
              onLivrer={setLivrerCommande}
              onEdit={setEditingCommande}
              onAnnuler={setAnnulerId}
              onDelete={setDeleteId}
              onPrint={setPrintCommande}
              formatPrix={formatPrix}
              formatDate={formatDate}
            />
          ))
        )}
      </div>

      {/* Version desktop: Tableau */}
      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Numéro</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Acompte</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Restant</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date livraison</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date création</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    Chargement...
                  </td>
                </tr>
              ) : commandes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                commandes.map((commande: Commande) => (
                  <tr key={commande.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">{commande.numero}</td>
                    <td className="px-4 py-3 text-sm">
                      {clients.find((c: any) => c.id === commande.clientId)?.nom || 'Client inconnu'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatPrix(commande.total)}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatPrix(commande.acompte)}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatPrix(commande.montantRestant)}</td>
                    <td className="px-4 py-3 text-sm">{getStatutBadge(commande.statut)}</td>
                    <td className="px-4 py-3 text-sm">
                      {commande.dateLivraison ? formatDate(commande.dateLivraison) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{formatDate(commande.createdAt!)}</td>
                    <td className="px-4 py-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetailsCommande(commande)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir détails
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => setPrintCommande(commande)}>
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimer reçu
                          </DropdownMenuItem>

                          {commande.statut === 'en_attente' && (
                            <>
                              <CanAccess permissions={['commandes.update']}>
                                <DropdownMenuItem onClick={() => setEditingCommande(commande)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                              </CanAccess>

                              <CanAccess permissions={['commandes.livrer']}>
                                <DropdownMenuItem onClick={() => {
                                  setLivrerCommande(commande);
                                  setLivrerData({ montantPaye: commande.montantRestant, modePaiement: "especes", note: "" });
                                }}>
                                  <Package className="mr-2 h-4 w-4" />
                                  Livrer
                                </DropdownMenuItem>
                              </CanAccess>

                              <CanAccess permissions={['commandes.delete']}>
                                <DropdownMenuItem onClick={() => setAnnulerId(commande.id)}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Annuler
                                </DropdownMenuItem>
                              </CanAccess>
                            </>
                          )}

                          {(commande.statut === 'en_attente' || commande.statut === 'annulee') && (
                            <CanAccess permissions={['commandes.delete']}>
                              <DropdownMenuItem onClick={() => setDeleteId(commande.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </CanAccess>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {meta && <Pagination meta={meta} onPageChange={setPage} />}

      {/* Formulaire Create/Edit */}
      <CommandeForm
        open={formOpen || !!editingCommande}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false);
            setEditingCommande(null);
          }
        }}
        onSubmit={editingCommande ? handleUpdate : handleCreate}
        initialData={editingCommande}
        mode={editingCommande ? 'edit' : 'create'}
      />

      {/* Dialog Détails */}
      {isMobile ? (
        <Sheet open={!!detailsCommande} onOpenChange={() => setDetailsCommande(null)}>
          <SheetContent side="bottom" className="h-[95vh] p-0">
            <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
              {/* Header amélioré */}
              <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-bold">Commande {detailsCommande?.numero}</h2>
                    {detailsCommande && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Créée le {formatDate(detailsCommande.createdAt!)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {detailsCommande && (
                  <div className="space-y-4">
                    {/* Informations principales en cartes */}
                    <div className="grid grid-cols-1 gap-3">
                      {/* Client */}
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Client</p>
                        </div>
                        <p className="font-heading font-bold text-blue-700 dark:text-blue-300">
                          {clients.find((c: any) => c.id === detailsCommande.clientId)?.nom || 'Client inconnu'}
                        </p>
                      </div>

                      {/* Statut et dates */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`border rounded-lg p-3 ${
                          detailsCommande.statut === 'livree'
                            ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                            : detailsCommande.statut === 'annulee'
                            ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                            : 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
                        }`}>
                          <p className="text-xs font-medium mb-1.5 text-muted-foreground">Statut</p>
                          {getStatutBadge(detailsCommande.statut)}
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Calendar className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Livraison</p>
                          </div>
                          <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                            {detailsCommande.dateLivraison ? formatDate(detailsCommande.dateLivraison) : 'Non définie'}
                          </p>
                        </div>
                      </div>

                      {detailsCommande.dateLivree && (
                        <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <p className="text-xs font-medium text-teal-600 dark:text-teal-400">Livré le</p>
                          </div>
                          <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                            {formatDate(detailsCommande.dateLivree)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Articles */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ShoppingBag className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Articles commandés</h3>
                      </div>
                      <div className="space-y-2">
                        {lignes.map((ligne: any, idx: number) => {
                          const quantiteBase = ligne.quantiteBase || ligne.quantite;
                          const isGros = ligne.modeVente && ligne.modeVente.quantiteStock > 1;
                          const quantiteLots = isGros ? Math.round(quantiteBase / ligne.modeVente.quantiteStock) : ligne.quantite;

                          return (
                            <div key={idx} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                              <div className="flex-1 min-w-0 mr-3">
                                <p className="font-semibold text-foreground truncate">{ligne.nom}</p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-xs">
                                    {quantiteBase} unités
                                  </span>
                                  {isGros && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs">
                                      {quantiteLots} × {ligne.modeVente.nom}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Prix: {formatPrix(ligne.prixUnitaire)} / {ligne.modeVente ? ligne.modeVente.nom : 'unité'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-primary">{formatPrix(ligne.sousTotal)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination */}
                      {lignesMeta && lignesMeta.totalPages > 1 && (
                        <div className="mt-3">
                          <Pagination meta={lignesMeta} onPageChange={setLignesPage} />
                        </div>
                      )}
                    </div>

                    {/* Récapitulatif financier */}
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-xl border-2 border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Récapitulatif</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total commande</span>
                          <span className="font-bold text-lg">{formatPrix(detailsCommande.total)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Acompte versé</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">{formatPrix(detailsCommande.acompte)}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-primary/20">
                          <span className="font-medium text-foreground">Montant restant</span>
                          <span className="font-bold text-lg text-primary">{formatPrix(detailsCommande.montantRestant)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Note */}
                    {detailsCommande.note && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Note</p>
                        </div>
                        <p className="text-sm text-amber-900 dark:text-amber-100">{detailsCommande.note}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={!!detailsCommande} onOpenChange={() => setDetailsCommande(null)}>
          <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-6 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent space-y-0 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="font-heading text-xl font-bold">
                    Commande {detailsCommande?.numero}
                  </DialogTitle>
                  {detailsCommande && (
                    <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                      Créée le {formatDate(detailsCommande.createdAt!)}
                    </DialogDescription>
                  )}
                </div>
              </div>
            </DialogHeader>

            {detailsCommande && (
              <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                {/* Informations principales en cartes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Client */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Client</p>
                    </div>
                    <p className="font-heading text-lg font-bold text-blue-700 dark:text-blue-300">
                      {clients.find((c: any) => c.id === detailsCommande.clientId)?.nom || 'Client inconnu'}
                    </p>
                  </div>

                  {/* Statut */}
                  <div className={`border rounded-lg p-4 ${
                    detailsCommande.statut === 'livree'
                      ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                      : detailsCommande.statut === 'annulee'
                      ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                      : 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
                  }`}>
                    <p className="text-xs font-medium mb-2 text-muted-foreground">Statut</p>
                    {getStatutBadge(detailsCommande.statut)}
                  </div>

                  {/* Date livraison souhaitée */}
                  <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Livraison souhaitée</p>
                    </div>
                    <p className="text-base font-semibold text-purple-700 dark:text-purple-300">
                      {detailsCommande.dateLivraison ? formatDate(detailsCommande.dateLivraison) : 'Non définie'}
                    </p>
                  </div>

                  {/* Date livraison réelle si existe */}
                  {detailsCommande.dateLivree && (
                    <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg p-4 col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <p className="text-xs font-medium text-teal-600 dark:text-teal-400">Livré le</p>
                      </div>
                      <p className="text-base font-semibold text-teal-700 dark:text-teal-300">
                        {formatDate(detailsCommande.dateLivree)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Articles */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">Articles commandés</h3>
                  </div>
                  <div className="space-y-2">
                    {lignes.map((ligne: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="font-semibold text-foreground">{ligne.nom}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-xs">
                              {ligne.quantiteBase || ligne.quantite} unités
                            </span>
                            {ligne.modeVente && ligne.quantite !== ligne.quantiteBase && (
                              <span className="text-xs text-muted-foreground">
                                ({ligne.quantite} × {ligne.modeVente.nom})
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Prix: {formatPrix(ligne.prixUnitaire)}{ligne.modeVente ? ` / ${ligne.modeVente.nom}` : ' / unité'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-primary">{formatPrix(ligne.sousTotal)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination si nécessaire */}
                  {lignesMeta && lignesMeta.totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination meta={lignesMeta} onPageChange={setLignesPage} />
                    </div>
                  )}
                </div>

                {/* Récapitulatif financier */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-5 rounded-xl border-2 border-primary/20">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">Récapitulatif financier</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total commande</span>
                      <span className="font-bold text-xl">{formatPrix(detailsCommande.total)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Acompte versé</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{formatPrix(detailsCommande.acompte)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-primary/20">
                      <span className="font-medium text-foreground">Montant restant</span>
                      <span className="font-bold text-2xl text-primary">{formatPrix(detailsCommande.montantRestant)}</span>
                    </div>
                  </div>
                </div>

                {/* Note */}
                {detailsCommande.note && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Note</p>
                    </div>
                    <p className="text-sm text-amber-900 dark:text-amber-100">{detailsCommande.note}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog Livraison */}
      {isMobile ? (
        <Sheet open={!!livrerCommande} onOpenChange={() => setLivrerCommande(null)}>
          <SheetContent side="bottom" className="h-[95vh] p-0">
            <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
              {/* Header */}
              <div className="px-4 py-4 border-b bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold">Livrer la commande {livrerCommande?.numero}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Enregistrez le paiement final
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenu scrollable */}
              {livrerCommande && (
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  {/* Récapitulatif commande */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-2 border-primary/20 p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                          <DollarSign className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Récapitulatif</h3>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total commande</span>
                        <span className="font-bold">{formatPrix(livrerCommande.total)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Acompte versé</span>
                        <span className="font-semibold text-green-600">{formatPrix(livrerCommande.acompte)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-primary/20">
                        <span className="font-medium">Restant à payer</span>
                        <span className="font-bold text-lg text-primary">{formatPrix(livrerCommande.montantRestant)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Formulaire paiement */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/5 via-background to-background border-2 border-border p-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Paiement à la livraison</h3>
                      </div>

                      <FormField
                        label="Montant payé"
                        type="number"
                        value={livrerData.montantPaye}
                        onChange={(e) => setLivrerData({ ...livrerData, montantPaye: Number((e.target as HTMLInputElement).value) })}
                        min={0}
                      />

                      <FormField
                        label="Mode de paiement"
                        as="select"
                        value={livrerData.modePaiement}
                        onChange={(e) => setLivrerData({ ...livrerData, modePaiement: (e.target as HTMLSelectElement).value })}
                      >
                        <option value="especes">Espèces</option>
                        <option value="mobile_money">Mobile Money</option>
                        <option value="virement">Virement</option>
                        <option value="credit">Crédit</option>
                      </FormField>

                      <FormField
                        label="Note (optionnel)"
                        as="textarea"
                        value={livrerData.note}
                        onChange={(e) => setLivrerData({ ...livrerData, note: (e.target as HTMLTextAreaElement).value })}
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Résumé final */}
                  <div className={`rounded-xl p-4 border-2 ${
                    calculateRestant() > 0
                      ? 'bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20'
                      : 'bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20'
                  }`}>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total payé</span>
                        <span className="font-bold">{formatPrix(calculateTotalPaye())}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-current/10">
                        <span className="font-medium">Restant (dette)</span>
                        <span className={`font-bold text-lg ${calculateRestant() > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                          {formatPrix(calculateRestant())}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-4 py-4 border-t bg-muted/30 flex-shrink-0">
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setLivrerCommande(null)} className="flex-1 h-12">
                    Annuler
                  </Button>
                  <Button onClick={handleLivrer} className="flex-1 h-12 bg-green-600 hover:bg-green-700">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirmer
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={!!livrerCommande} onOpenChange={() => setLivrerCommande(null)}>
          <DialogContent className="max-w-lg h-[85vh] flex flex-col p-0 bg-gradient-to-br from-background via-background to-primary/5">
            {/* Header */}
            <DialogHeader className="px-6 py-5 border-b bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent flex-shrink-0">
              <div className="flex items-center gap-3 pr-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">
                    Livrer la commande {livrerCommande?.numero}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                    Enregistrez le paiement final et marquez comme livrée
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Contenu scrollable */}
            {livrerCommande && (
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Récapitulatif commande */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-2 border-primary/20 p-4">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10"></div>
                  <div className="relative space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">Récapitulatif</h3>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total commande</span>
                      <span className="font-bold text-lg">{formatPrix(livrerCommande.total)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Acompte déjà versé</span>
                      <span className="font-semibold text-green-600">{formatPrix(livrerCommande.acompte)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-primary/20">
                      <span className="font-medium text-foreground">Restant à payer</span>
                      <span className="font-bold text-xl text-primary">{formatPrix(livrerCommande.montantRestant)}</span>
                    </div>
                  </div>
                </div>

                {/* Formulaire paiement */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/5 via-background to-background border-2 border-border p-4">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
                  <div className="relative space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">Paiement à la livraison</h3>
                    </div>

                    <FormField
                      label="Montant payé"
                      type="number"
                      value={livrerData.montantPaye}
                      onChange={(e) => setLivrerData({ ...livrerData, montantPaye: Number((e.target as HTMLInputElement).value) })}
                      min={0}
                    />

                    <FormField
                      label="Mode de paiement"
                      as="select"
                      value={livrerData.modePaiement}
                      onChange={(e) => setLivrerData({ ...livrerData, modePaiement: (e.target as HTMLSelectElement).value })}
                    >
                      <option value="especes">Espèces</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="virement">Virement</option>
                      <option value="credit">Crédit</option>
                    </FormField>

                    <FormField
                      label="Note (optionnel)"
                      as="textarea"
                      value={livrerData.note}
                      onChange={(e) => setLivrerData({ ...livrerData, note: (e.target as HTMLTextAreaElement).value })}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Résumé final */}
                <div className={`rounded-xl p-4 border-2 ${
                  calculateRestant() > 0
                    ? 'bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20'
                    : 'bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20'
                }`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total payé (acompte + livraison)</span>
                      <span className="font-bold text-lg">{formatPrix(calculateTotalPaye())}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-current/10">
                      <span className="font-medium">Montant restant (dette)</span>
                      <span className={`font-bold text-xl ${calculateRestant() > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                        {formatPrix(calculateRestant())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-muted/30 flex-shrink-0">
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setLivrerCommande(null)} className="h-11">
                  Annuler
                </Button>
                <Button onClick={handleLivrer} className="h-11 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmer la livraison
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog Annulation */}
      <AlertDialog open={!!annulerId} onOpenChange={() => setAnnulerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cette commande ?</AlertDialogTitle>
            <AlertDialogDescription>
              La commande sera marquée comme annulée. Le stock ne sera pas modifié.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Non, conserver</AlertDialogCancel>
            <AlertDialogAction onClick={handleAnnuler}>Oui, annuler</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Suppression */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette commande ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La commande sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCommande.isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteCommande.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCommande.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reçu de commande imprimable */}
      {printCommande && (() => {
        const client = clients.find((c: any) => c.id === printCommande.clientId);
        return (
          <CommandeReceipt
            commande={printCommande}
            clientNom={client?.nom}
            clientTelephone={client?.telephone}
            clientAdresse={client?.adresse}
            onClose={() => setPrintCommande(null)}
          />
        );
      })()}
    </AppLayout>
  );
};

export default Commandes;

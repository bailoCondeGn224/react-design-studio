import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import FournisseurForm from "@/components/FournisseurForm";
import Pagination from "@/components/Pagination";
import CanAccess from "@/components/CanAccess";
import { Search, Plus, Star, Phone, Mail, MapPin, MoreVertical, Edit, Trash, AlertCircle, Eye, TrendingUp, Package, Wallet, Calendar } from "lucide-react";
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
import { useFournisseurs, useFournisseurDetails, useCreateFournisseur, useUpdateFournisseur, useDeleteFournisseur } from "@/hooks/useFournisseurs";

const Fournisseurs = () => {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailsItem, setDetailsItem] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  // Utiliser le filtre backend
  const { data: fournisseursResponse, isLoading } = useFournisseurs({
    page,
    limit,
    search: search || undefined,
  });
  const fournisseurs = fournisseursResponse?.data || [];
  const meta = fournisseursResponse?.meta;
  const createFournisseur = useCreateFournisseur();
  const updateFournisseur = useUpdateFournisseur();
  const deleteFournisseur = useDeleteFournisseur();

  // Charger les détails complets du fournisseur sélectionné (avec approvisionnements et versements)
  const { data: fournisseurDetails, isLoading: loadingDetails } = useFournisseurDetails(detailsItem?.id || null);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editingItem) {
      updateFournisseur.mutate({ id: editingItem.id, data });
    } else {
      createFournisseur.mutate(data);
    }
    setEditingItem(null);
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteFournisseur.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingItem(null);
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

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des fournisseurs...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Fournisseurs"
        description="Gestion et suivi de vos partenaires commerciaux"
        action={
          <CanAccess permissions={['fournisseurs.create']}>
            <button onClick={() => setFormOpen(true)} className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Nouveau Fournisseur
            </button>
          </CanAccess>
        }
      />

      <FournisseurForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleSubmit}
        initialData={editingItem}
        mode={editingItem ? 'edit' : 'create'}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce fournisseur ? Toutes ses informations seront définitivement perdues.
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

      {/* Modal de détails du fournisseur */}
      <Dialog open={detailsItem !== null} onOpenChange={() => setDetailsItem(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Détails du Fournisseur
            </DialogTitle>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Chargement des détails...</p>
              </div>
            </div>
          ) : fournisseurDetails && (
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Informations Générales
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Nom</p>
                    <p className="text-sm font-semibold text-foreground">{fournisseurDetails.nom}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Statut</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium inline-block ${
                      fournisseurDetails.statut === "actif" ? "bg-success/10 text-success" :
                      fournisseurDetails.statut === "en_attente" ? "bg-warning/10 text-warning" :
                      "bg-secondary text-secondary-foreground"
                    }`}>
                      {fournisseurDetails.statut === "actif" ? "Actif" : fournisseurDetails.statut === "en_attente" ? "En attente" : "Inactif"}
                    </span>
                  </div>
                  {fournisseurDetails.adresse && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Adresse</p>
                      <p className="text-sm text-foreground">{fournisseurDetails.adresse}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Téléphone</p>
                    <p className="text-sm text-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {fournisseurDetails.telephone}
                    </p>
                  </div>
                  {fournisseurDetails.email && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <p className="text-sm text-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {fournisseurDetails.email}
                      </p>
                    </div>
                  )}
                  {fournisseurDetails.rating && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Évaluation</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(fournisseurDetails.rating) ? "fill-amber-400 text-amber-400" : "text-muted"}`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">({fournisseurDetails.rating})</span>
                      </div>
                    </div>
                  )}
                  {fournisseurDetails.createdAt && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Date d'ajout</p>
                      <p className="text-sm text-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(fournisseurDetails.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Produits fournis */}
              {fournisseurDetails.produits && fournisseurDetails.produits.length > 0 && (
                <div className="bg-primary/5 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-3">Produits Fournis</h3>
                  <div className="flex flex-wrap gap-2">
                    {fournisseurDetails.produits.map((p: string, i: number) => (
                      <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Statistiques financières */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Total Achats</p>
                  </div>
                  <p className="text-lg font-bold text-foreground">{formatPrix(fournisseurDetails.totalAchats || 0)}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4 text-success" />
                    <p className="text-xs text-muted-foreground">Total Payé</p>
                  </div>
                  <p className="text-lg font-bold text-success">{formatPrix(fournisseurDetails.totalPaye || 0)}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <p className="text-xs text-muted-foreground">Dette</p>
                  </div>
                  <p className={`text-lg font-bold ${fournisseurDetails.dette > 0 ? 'text-destructive' : 'text-success'}`}>
                    {formatPrix(fournisseurDetails.dette || 0)}
                  </p>
                </div>
              </div>

              {/* Approvisionnements récents */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Approvisionnements Récents</h3>
                <div className="space-y-2">
                  {fournisseurDetails.approvisionnements && fournisseurDetails.approvisionnements.length > 0 ? (
                    fournisseurDetails.approvisionnements.map((appro: any) => (
                      <div key={appro.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{appro.numero}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(appro.dateLivraison || appro.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-primary ml-2">{formatPrix(appro.total)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun approvisionnement</p>
                  )}
                </div>
              </div>

              {/* Versements récents */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Versements Récents</h3>
                <div className="space-y-2">
                  {fournisseurDetails.versements && fournisseurDetails.versements.length > 0 ? (
                    fournisseurDetails.versements.map((vers: any) => (
                      <div key={vers.id} className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">Versement</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(vers.date || vers.createdAt).toLocaleDateString('fr-FR')} - {vers.modePaiement}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-success ml-2">{formatPrix(vers.montant)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun versement</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <CanAccess permissions={['fournisseurs.update']}>
                  <button
                    onClick={() => {
                      const itemToEdit = detailsItem;
                      setDetailsItem(null);
                      handleEdit(itemToEdit);
                    }}
                    className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    Modifier
                  </button>
                </CanAccess>
                <button
                  onClick={() => setDetailsItem(null)}
                  className="flex-1 py-2.5 rounded-lg gradient-gold text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un fournisseur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      {fournisseurs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun fournisseur trouvé</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {fournisseurs.map((f: any) => (
              <div key={f.id} className="bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-elevated transition-shadow animate-fade-in">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-foreground truncate">{f.nom}</h3>
                    {f.adresse && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{f.adresse}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                      f.statut === "actif" ? "bg-success/10 text-success" :
                      f.statut === "en_attente" ? "bg-warning/10 text-warning" :
                      "bg-secondary text-secondary-foreground"
                    }`}>
                      {f.statut === "actif" ? "Actif" : f.statut === "en_attente" ? "En attente" : "Inactif"}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDetailsItem(f)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <CanAccess permissions={['fournisseurs.update']}>
                          <DropdownMenuItem onClick={() => handleEdit(f)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                        </CanAccess>
                        <CanAccess permissions={['fournisseurs.delete']}>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteId(f.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </CanAccess>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {f.rating && (
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.floor(f.rating) ? "fill-amber-400 text-amber-400" : "text-muted"}`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">({f.rating})</span>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {f.telephone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{f.telephone}</span>
                    </div>
                  )}
                  {f.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{f.email}</span>
                    </div>
                  )}
                </div>

                {f.produits && f.produits.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Produits</p>
                    <div className="flex flex-wrap gap-1">
                      {f.produits.slice(0, 3).map((p: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {p}
                        </span>
                      ))}
                      {f.produits.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          +{f.produits.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-border">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-0.5">Total achats</p>
                      <p className="font-semibold text-foreground">{formatPrix(f.totalAchats || 0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-0.5">Dette</p>
                      <p className={`font-semibold ${f.dette > 0 ? 'text-destructive' : 'text-success'}`}>
                        {formatPrix(f.dette || 0)}
                      </p>
                    </div>
                  </div>
                  {f.dette > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      <span>Dette en cours</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta && (
            <div className="mt-6">
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
};

export default Fournisseurs;

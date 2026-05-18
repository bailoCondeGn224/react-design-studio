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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import FormField from "@/components/FormField";
import { Plus, MoreVertical, Eye, Edit, Trash2, CheckCircle, XCircle, Package, Printer } from "lucide-react";
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

      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
      <Dialog open={!!detailsCommande} onOpenChange={() => setDetailsCommande(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la commande {detailsCommande?.numero}</DialogTitle>
          </DialogHeader>
          {detailsCommande && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Client</div>
                  <div className="font-medium">
                    {clients.find((c: any) => c.id === detailsCommande.clientId)?.nom}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Statut</div>
                  <div>{getStatutBadge(detailsCommande.statut)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Date de livraison souhaitée</div>
                  <div>{detailsCommande.dateLivraison ? formatDate(detailsCommande.dateLivraison) : '-'}</div>
                </div>
                {detailsCommande.dateLivree && (
                  <div>
                    <div className="text-sm text-muted-foreground">Date de livraison réelle</div>
                    <div>{formatDate(detailsCommande.dateLivree)}</div>
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Articles</div>
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left">Article</th>
                      <th className="px-3 py-2 text-center">Quantité</th>
                      <th className="px-3 py-2 text-right">Prix unitaire</th>
                      <th className="px-3 py-2 text-right">Sous-total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {lignes.map((ligne: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">{ligne.nom}</td>
                        <td className="px-3 py-2 text-center">{ligne.quantite}</td>
                        <td className="px-3 py-2 text-right">{formatPrix(ligne.prixUnitaire)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatPrix(ligne.sousTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination si nécessaire */}
                {lignesMeta && lignesMeta.totalPages > 1 && (
                  <div className="mt-4 pt-4 border-t">
                    <Pagination
                      meta={lignesMeta}
                      onPageChange={setLignesPage}
                    />
                  </div>
                )}
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-bold">{formatPrix(detailsCommande.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Acompte versé</span>
                  <span>{formatPrix(detailsCommande.acompte)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Montant restant</span>
                  <span className="font-bold">{formatPrix(detailsCommande.montantRestant)}</span>
                </div>
              </div>

              {detailsCommande.note && (
                <div>
                  <div className="text-sm text-muted-foreground">Note</div>
                  <div className="mt-1">{detailsCommande.note}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Livraison */}
      <Dialog open={!!livrerCommande} onOpenChange={() => setLivrerCommande(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Livrer la commande {livrerCommande?.numero}</DialogTitle>
            <DialogDescription>
              Enregistrez le paiement final et marquez la commande comme livrée
            </DialogDescription>
          </DialogHeader>
          {livrerCommande && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total commande</span>
                  <span className="font-bold">{formatPrix(livrerCommande.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Acompte déjà versé</span>
                  <span>{formatPrix(livrerCommande.acompte)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Restant à payer</span>
                  <span className="font-bold text-lg">{formatPrix(livrerCommande.montantRestant)}</span>
                </div>
              </div>

              <FormField
                label="Montant payé à la livraison *"
                type="number"
                value={livrerData.montantPaye}
                onChange={(e) => setLivrerData({ ...livrerData, montantPaye: Number((e.target as HTMLInputElement).value) })}
                min={0}
              />

              <FormField
                label="Mode de paiement *"
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

              <div className="bg-primary/5 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total payé</span>
                  <span className="font-bold">{formatPrix(calculateTotalPaye())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Montant restant (dette)</span>
                  <span className={calculateRestant() > 0 ? "font-bold text-destructive" : "font-bold text-green-600"}>
                    {formatPrix(calculateRestant())}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setLivrerCommande(null)}>
                  Annuler
                </Button>
                <Button onClick={handleLivrer}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmer la livraison
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
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

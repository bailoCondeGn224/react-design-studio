import { useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import OnlineOrderMobileCard from "@/components/OnlineOrderMobileCard";
import { useOnlineOrders, useConfirmOrder, useMarkOrderReady, useMarkOrderDelivered, useCancelOrder, useOnlineOrderStats } from "@/hooks/useOnlineOrders";
import { OnlineOrder, OnlineOrderStatut } from "@/types";
import { Search, Package, Clock, CheckCircle, Truck, XCircle, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const statutConfig: Record<OnlineOrderStatut, { label: string; className: string }> = {
  [OnlineOrderStatut.EN_ATTENTE]: { label: 'En attente', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  [OnlineOrderStatut.CONFIRMEE]: { label: 'Confirmée', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  [OnlineOrderStatut.PRETE]: { label: 'Prête', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  [OnlineOrderStatut.LIVREE]: { label: 'Livrée', className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
  [OnlineOrderStatut.ANNULEE]: { label: 'Annulée', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const OnlineOrders = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelMotif, setCancelMotif] = useState("");
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  // Track which order is being acted upon
  const [pendingConfirmId, setPendingConfirmId] = useState<string | null>(null);
  const [pendingReadyId, setPendingReadyId] = useState<string | null>(null);
  const [pendingDeliveredId, setPendingDeliveredId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data: ordersData, isLoading } = useOnlineOrders({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    statut: statutFilter !== "all" ? (statutFilter as OnlineOrderStatut) : undefined,
  });

  const { data: stats } = useOnlineOrderStats();

  const confirmOrder = useConfirmOrder();
  const markReady = useMarkOrderReady();
  const markDelivered = useMarkOrderDelivered();
  const cancelOrder = useCancelOrder();

  const orders = ordersData?.data || [];
  const meta = ordersData?.meta;

  const handleConfirm = (id: string) => {
    setPendingConfirmId(id);
    confirmOrder.mutate(id, {
      onSettled: () => setPendingConfirmId(null),
    });
  };

  const handleMarkReady = (id: string) => {
    setPendingReadyId(id);
    markReady.mutate(id, {
      onSettled: () => setPendingReadyId(null),
    });
  };

  const handleMarkDelivered = (id: string) => {
    setPendingDeliveredId(id);
    markDelivered.mutate(id, {
      onSettled: () => setPendingDeliveredId(null),
    });
  };

  const handleCancelClick = (id: string) => {
    setOrderToCancel(id);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    if (orderToCancel && cancelMotif) {
      cancelOrder.mutate({ id: orderToCancel, motif: cancelMotif });
      setCancelDialogOpen(false);
      setCancelMotif("");
      setOrderToCancel(null);
    }
  };

  const handleViewDetails = (id: string) => {
    const order = orders.find(o => o.id === id);
    if (order) setSelectedOrder(order);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Commandes en ligne</h1>
            <p className="text-muted-foreground">Gestion des commandes de la boutique en ligne</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.enAttente}</p>
                    <p className="text-xs text-muted-foreground">En attente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.confirmees}</p>
                    <p className="text-xs text-muted-foreground">Confirmées</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.pretes}</p>
                    <p className="text-xs text-muted-foreground">Prêtes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.livreesToday}</p>
                    <p className="text-xs text-muted-foreground">Livrées aujourd'hui</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro, client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statutFilter} onValueChange={setStatutFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value={OnlineOrderStatut.EN_ATTENTE}>En attente</SelectItem>
              <SelectItem value={OnlineOrderStatut.CONFIRMEE}>Confirmée</SelectItem>
              <SelectItem value={OnlineOrderStatut.PRETE}>Prête</SelectItem>
              <SelectItem value={OnlineOrderStatut.LIVREE}>Livrée</SelectItem>
              <SelectItem value={OnlineOrderStatut.ANNULEE}>Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Liste */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Aucune commande trouvée</p>
            </CardContent>
          </Card>
        ) : isMobile ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <OnlineOrderMobileCard
                key={order.id}
                order={order}
                onConfirm={handleConfirm}
                onMarkReady={handleMarkReady}
                onMarkDelivered={handleMarkDelivered}
                onCancel={handleCancelClick}
                onViewDetails={handleViewDetails}
                formatPrix={formatPrix}
                formatDate={formatDate}
                isConfirming={pendingConfirmId === order.id}
                isMarkingReady={pendingReadyId === order.id}
                isMarkingDelivered={pendingDeliveredId === order.id}
                isCanceling={orderToCancel === order.id && cancelOrder.isPending}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Livraison</TableHead>
                    <TableHead>Articles</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.numero}</TableCell>
                      <TableCell>
                        <div>
                          <p>{order.customerNom || 'Anonyme'}</p>
                          <p className="text-xs text-muted-foreground">{order.customerTelephone || order.telephoneLivraison}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        {order.modeLivraison === 'LIVRAISON' ? 'Livraison' : 'Retrait'}
                      </TableCell>
                      <TableCell>{order.items.length}</TableCell>
                      <TableCell className="font-semibold">{formatPrix(order.total)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statutConfig[order.statut].className}`}>
                          {statutConfig[order.statut].label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {order.statut === OnlineOrderStatut.EN_ATTENTE && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirm(order.id)}
                              disabled={pendingConfirmId === order.id}
                            >
                              {pendingConfirmId === order.id ? 'En cours...' : 'Confirmer'}
                            </Button>
                          )}
                          {order.statut === OnlineOrderStatut.CONFIRMEE && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkReady(order.id)}
                              disabled={pendingReadyId === order.id}
                            >
                              {pendingReadyId === order.id ? 'En cours...' : 'Prête'}
                            </Button>
                          )}
                          {order.statut === OnlineOrderStatut.PRETE && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkDelivered(order.id)}
                              disabled={pendingDeliveredId === order.id}
                            >
                              {pendingDeliveredId === order.id ? 'En cours...' : 'Livrée'}
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleViewDetails(order.id)}>
                            Détails
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Précédent
            </Button>
            <span className="flex items-center px-4">
              Page {page} / {meta.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === meta.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la commande</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="motif">Motif d'annulation *</Label>
              <Textarea
                id="motif"
                placeholder="Raison de l'annulation..."
                value={cancelMotif}
                onChange={(e) => setCancelMotif(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={!cancelMotif || cancelOrder.isPending}
            >
              {cancelOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmer l\'annulation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la commande {selectedOrder?.numero}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">{selectedOrder.customerNom || 'Anonyme'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{selectedOrder.customerTelephone || selectedOrder.telephoneLivraison}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mode de livraison</p>
                  <p className="font-medium">
                    {selectedOrder.modeLivraison === 'LIVRAISON' ? 'Livraison à domicile' : 'Retrait en boutique'}
                  </p>
                </div>
                {selectedOrder.adresseLivraison && (
                  <div>
                    <p className="text-sm text-muted-foreground">Adresse</p>
                    <p className="font-medium">{selectedOrder.adresseLivraison}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Articles</p>
                <div className="border rounded-lg divide-y">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex justify-between">
                      <div>
                        <p className="font-medium">{item.articleNom}</p>
                        {item.modeVenteNom && (
                          <p className="text-xs text-muted-foreground">{item.modeVenteNom}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {formatPrix(item.prixUnitaire)} × {item.quantiteBase || item.quantite}
                          {item.modeVenteNom && item.quantite !== item.quantiteBase && (
                            <span className="text-xs ml-1">({item.quantite} {item.modeVenteNom})</span>
                          )}
                        </p>
                      </div>
                      <p className="font-semibold">{formatPrix(item.sousTotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{formatPrix(selectedOrder.sousTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de livraison</span>
                  <span>{formatPrix(selectedOrder.fraisLivraison)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">{formatPrix(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default OnlineOrders;

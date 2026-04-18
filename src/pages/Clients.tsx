import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import ClientForm from "@/components/ClientForm";
import ClientDetailsDialog from "@/components/ClientDetailsDialog";
import Pagination from "@/components/Pagination";
import CanAccess from "@/components/CanAccess";
import { UserCheck, CreditCard, Search, Plus, Edit, Trash, MoreVertical, Eye } from "lucide-react";
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
import { useClients, useStatsClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/hooks/useClients";
import { useDebounce } from "@/hooks/useDebounce";

type Filtre = "all" | "credits";

const Clients = () => {
  const [filtre, setFiltre] = useState<Filtre>("all");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{ id: string; nom: string } | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  // Utiliser les filtres backend avec la recherche débouncée
  const { data: clientsResponse, isLoading } = useClients({
    page,
    limit,
    search: debouncedSearch || undefined,
    hasCredits: filtre === "credits" ? true : undefined,
  });
  const clients = clientsResponse?.data || [];
  const meta = clientsResponse?.meta;

  // Charger les statistiques depuis le backend
  const { data: statsClients } = useStatsClients();

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editingItem) {
      updateClient.mutate({ id: editingItem.id, data });
    } else {
      createClient.mutate(data);
    }
    setEditingItem(null);
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteClient.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingItem(null);
    }
  };

  const handleViewDetails = (client: any) => {
    setSelectedClient({ id: client.id, nom: client.nom });
    setDetailsOpen(true);
  };

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filtre]);

  const formatPrix = (prix: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(prix).replace('GNF', 'GNF');
  };

  // Utiliser les statistiques depuis le backend
  const totalClients = statsClients?.total || 0;
  const clientsAvecCredits = statsClients?.avecCredits || 0;
  const totalCreditsEnCours = statsClients?.totalCreditsEnCours || 0;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des clients...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Gestion des Clients"
        description="Suivi des clients et crédits en cours"
        action={
          <CanAccess permissions={['clients.create']}>
            <button onClick={() => setFormOpen(true)} className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Nouveau Client
            </button>
          </CanAccess>
        }
      />

      <ClientForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleSubmit}
        initialData={editingItem}
        mode={editingItem ? 'edit' : 'create'}
      />

      {selectedClient && (
        <ClientDetailsDialog
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          clientId={selectedClient.id}
          clientNom={selectedClient.nom}
        />
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le client</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
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

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-card">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-muted-foreground">Total Clients</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">{totalClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-card">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-muted-foreground">Avec Crédits</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">{clientsAvecCredits}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-card">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs text-muted-foreground">Total Crédits</p>
              <p className="text-base sm:text-lg font-bold text-foreground truncate">{formatPrix(totalCreditsEnCours)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <button
            onClick={() => setFiltre("all")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
              filtre === "all" ? "gradient-gold text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFiltre("credits")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
              filtre === "credits" ? "gradient-gold text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            Avec Crédits
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-secondary border-b border-border">
                <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Client</th>
                <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Contact</th>
                <th className="text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Total Achats</th>
                <th className="text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Crédits</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Aucun client trouvé
                  </td>
                </tr>
              ) : (
                clients.map((item: any) => (
                  <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.nom}</p>
                        {item.adresse && (
                          <p className="text-xs text-muted-foreground">{item.adresse}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                      <div className="text-xs text-muted-foreground">
                        {item.telephone && <p>{item.telephone}</p>}
                        {item.email && <p>{item.email}</p>}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right text-sm font-bold text-foreground">
                      {formatPrix(item.totalAchats)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                      {item.totalCredits > 0 ? (
                        <span className="text-sm font-bold text-destructive">{formatPrix(item.totalCredits)}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
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
                          <DropdownMenuItem onClick={() => handleViewDetails(item)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <CanAccess permissions={['clients.update']}>
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                          </CanAccess>
                          <CanAccess permissions={['clients.delete']}>
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

export default Clients;

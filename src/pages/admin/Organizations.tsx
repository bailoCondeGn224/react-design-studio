import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import OrganizationForm from "@/components/admin/OrganizationForm";
import CreateOrgAdminForm from "@/components/admin/CreateOrgAdminForm";
import OrganizationMobileCard from "@/components/admin/OrganizationMobileCard";
import { Building2, Plus, Edit, Trash, Check, X, UserPlus, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { usersApi } from "@/api/users";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useOrganizations,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
  useToggleOrganizationStatus,
  usePendingOrganizations,
  useApproveOrganization,
  useRejectOrganization,
  useSuspendOrganization,
  useReactivateOrganization,
} from "@/hooks/useOrganizations";
import { OrganizationStatus } from "@/types";

const Organizations = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [adminFormOpen, setAdminFormOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectOrgId, setRejectOrgId] = useState<string | null>(null);
  const [rejectMotif, setRejectMotif] = useState("");
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendOrgId, setSuspendOrgId] = useState<string | null>(null);
  const [suspendMotif, setSuspendMotif] = useState("");

  const { data: organizations = [], isLoading } = useOrganizations();
  const { data: pendingOrganizations = [], isLoading: isPendingLoading } = usePendingOrganizations();
  const createOrganization = useCreateOrganization();
  const updateOrganization = useUpdateOrganization();
  const deleteOrganization = useDeleteOrganization();
  const toggleStatus = useToggleOrganizationStatus();
  const approveOrganization = useApproveOrganization();
  const rejectOrganization = useRejectOrganization();
  const suspendOrganization = useSuspendOrganization();
  const reactivateOrganization = useReactivateOrganization();

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editingItem) {
      updateOrganization.mutate({ id: editingItem.id, data });
    } else {
      createOrganization.mutate(data);
    }
    setEditingItem(null);
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteOrganization.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingItem(null);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleStatus.mutate({ id, actif: !currentStatus });
  };

  const handleOpenAdminForm = (org: any) => {
    setSelectedOrg(org);
    setAdminFormOpen(true);
  };

  const handleCreateAdmin = async (adminData: any) => {
    try {
      await usersApi.create(adminData);
      toast.success("Administrateur créé avec succès");
      setAdminFormOpen(false);
      setSelectedOrg(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la création de l'administrateur");
    }
  };

  const handleApprove = (id: string) => {
    approveOrganization.mutate(id);
  };

  const handleOpenRejectDialog = (id: string) => {
    setRejectOrgId(id);
    setRejectMotif("");
    setRejectDialogOpen(true);
  };

  const handleReject = () => {
    if (rejectOrgId && rejectMotif.trim()) {
      rejectOrganization.mutate({ id: rejectOrgId, motif: rejectMotif });
      setRejectDialogOpen(false);
      setRejectOrgId(null);
      setRejectMotif("");
    }
  };

  const handleOpenSuspendDialog = (id: string) => {
    setSuspendOrgId(id);
    setSuspendMotif("");
    setSuspendDialogOpen(true);
  };

  const handleSuspend = () => {
    if (suspendOrgId && suspendMotif.trim()) {
      suspendOrganization.mutate({ id: suspendOrgId, motif: suspendMotif });
      setSuspendDialogOpen(false);
      setSuspendOrgId(null);
      setSuspendMotif("");
    }
  };

  const handleReactivate = (id: string) => {
    reactivateOrganization.mutate(id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (statut: OrganizationStatus) => {
    switch (statut) {
      case OrganizationStatus.EN_ATTENTE:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        );
      case OrganizationStatus.APPROUVE:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
            <CheckCircle className="w-3 h-3" />
            Approuvée
          </span>
        );
      case OrganizationStatus.REJETE:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            <XCircle className="w-3 h-3" />
            Rejetée
          </span>
        );
      case OrganizationStatus.SUSPENDU:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500">
            <AlertTriangle className="w-3 h-3" />
            Suspendue
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des organizations...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Rendu mobile avec cartes
  const renderOrganizationMobile = (orgs: any[], showPendingActions = false) => (
    <div className="md:hidden space-y-3">
      {orgs.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-foreground font-medium">Aucune organisation</p>
        </div>
      ) : (
        orgs.map((org) => (
          <OrganizationMobileCard
            key={org.id}
            org={org}
            onEdit={handleEdit}
            onDelete={setDeleteId}
            onCreateAdmin={handleOpenAdminForm}
            onApprove={handleApprove}
            onReject={handleOpenRejectDialog}
            onSuspend={handleOpenSuspendDialog}
            onReactivate={handleReactivate}
            showPendingActions={showPendingActions}
            formatDate={formatDate}
          />
        ))
      )}
    </div>
  );

  // Rendu desktop avec table
  const renderOrganizationTable = (orgs: any[], showPendingActions = false) => (
    <div className="hidden md:block bg-card rounded-xl border shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-secondary border-b border-border">
              <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Organization</th>
              <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Plan</th>
              <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Statut</th>
              <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">Contact</th>
              <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">Date création</th>
              <th className="text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orgs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 sm:px-6 py-12 text-center text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Aucune organization trouvée</p>
                </td>
              </tr>
            ) : (
              orgs.map((org) => (
                <tr key={org.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 hidden sm:block">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-foreground">{org.nom}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{org.slug}</p>
                        <div className="sm:hidden mt-1 flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                            {org.plan?.nom || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-primary/10 text-primary">
                      {org.plan?.nom || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                    {org.statut ? getStatusBadge(org.statut) : (
                      org.actif ? (
                        <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-success">
                          <Check className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                          <X className="w-4 h-4" />
                          Inactive
                        </span>
                      )
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                    <div className="text-xs sm:text-sm">
                      {org.email && <p className="text-foreground">{org.email}</p>}
                      {org.telephone && <p className="text-[10px] sm:text-xs text-muted-foreground">{org.telephone}</p>}
                      {!org.email && !org.telephone && <span className="text-muted-foreground">N/A</span>}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {org.createdAt ? formatDate(org.createdAt) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                    {showPendingActions ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(org.id)}
                          disabled={approveOrganization.isPending}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-success/10 text-success hover:bg-success/20 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approuver
                        </button>
                        <button
                          onClick={() => handleOpenRejectDialog(org.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Rejeter
                        </button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 hover:bg-accent rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(org)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenAdminForm(org)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Créer admin
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {/* Actions de statut selon l'état actuel */}
                          {org.statut === OrganizationStatus.EN_ATTENTE && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleApprove(org.id)}
                                className="text-success focus:text-success"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approuver
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenRejectDialog(org.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Rejeter
                              </DropdownMenuItem>
                            </>
                          )}
                          {org.statut === OrganizationStatus.APPROUVE && (
                            <DropdownMenuItem
                              onClick={() => handleOpenSuspendDialog(org.id)}
                              className="text-orange-500 focus:text-orange-500"
                            >
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Suspendre
                            </DropdownMenuItem>
                          )}
                          {org.statut === OrganizationStatus.SUSPENDU && (
                            <DropdownMenuItem
                              onClick={() => handleReactivate(org.id)}
                              className="text-success focus:text-success"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Réactiver
                            </DropdownMenuItem>
                          )}
                          {org.statut === OrganizationStatus.REJETE && (
                            <DropdownMenuItem
                              onClick={() => handleApprove(org.id)}
                              className="text-success focus:text-success"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approuver quand même
                            </DropdownMenuItem>
                          )}
                          {/* Pour les anciennes organisations sans statut */}
                          {!org.statut && (
                            <DropdownMenuItem onClick={() => handleToggleStatus(org.id, org.actif)}>
                              {org.actif ? (
                                <>
                                  <X className="w-4 h-4 mr-2" />
                                  Désactiver
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  Activer
                                </>
                              )}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteId(org.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <PageHeader
        title="Gestion des Organizations"
        description="Gérer toutes les organizations de la plateforme"
        action={
          <button
            onClick={() => setFormOpen(true)}
            className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Nouvelle Organization
          </button>
        }
      />

      <OrganizationForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleSubmit}
        initialData={editingItem}
        mode={editingItem ? 'edit' : 'create'}
      />

      <CreateOrgAdminForm
        open={adminFormOpen}
        onOpenChange={setAdminFormOpen}
        onSubmit={handleCreateAdmin}
        organization={selectedOrg}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette organization ? Cette action est irréversible et supprimera tous les utilisateurs associés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de rejet */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter l'organisation</DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif du rejet. Ce message sera envoyé au demandeur.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              value={rejectMotif}
              onChange={(e) => setRejectMotif(e.target.value)}
              placeholder="Motif du rejet..."
              className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setRejectDialogOpen(false)}
              className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectMotif.trim() || rejectOrganization.isPending}
              className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              Rejeter
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suspension */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspendre l'organisation</DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif de la suspension.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              value={suspendMotif}
              onChange={(e) => setSuspendMotif(e.target.value)}
              placeholder="Motif de la suspension..."
              className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setSuspendDialogOpen(false)}
              className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSuspend}
              disabled={!suspendMotif.trim() || suspendOrganization.isPending}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              Suspendre
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Onglets */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">
            Toutes ({organizations.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            En attente
            {pendingOrganizations.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-warning rounded-full">
                {pendingOrganizations.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approuvées ({organizations.filter(o => o.statut === OrganizationStatus.APPROUVE).length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejetées ({organizations.filter(o => o.statut === OrganizationStatus.REJETE).length})
          </TabsTrigger>
          <TabsTrigger value="suspended">
            Suspendues ({organizations.filter(o => o.statut === OrganizationStatus.SUSPENDU).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderOrganizationMobile(organizations)}
          {renderOrganizationTable(organizations)}
        </TabsContent>

        <TabsContent value="pending">
          {isPendingLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {renderOrganizationMobile(pendingOrganizations, true)}
              {renderOrganizationTable(pendingOrganizations, true)}
            </>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {renderOrganizationMobile(organizations.filter(o => o.statut === OrganizationStatus.APPROUVE))}
          {renderOrganizationTable(organizations.filter(o => o.statut === OrganizationStatus.APPROUVE))}
        </TabsContent>

        <TabsContent value="rejected">
          {renderOrganizationMobile(organizations.filter(o => o.statut === OrganizationStatus.REJETE))}
          {renderOrganizationTable(organizations.filter(o => o.statut === OrganizationStatus.REJETE))}
        </TabsContent>

        <TabsContent value="suspended">
          {renderOrganizationMobile(organizations.filter(o => o.statut === OrganizationStatus.SUSPENDU))}
          {renderOrganizationTable(organizations.filter(o => o.statut === OrganizationStatus.SUSPENDU))}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Organizations;

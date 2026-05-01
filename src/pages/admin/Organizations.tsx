import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import OrganizationForm from "@/components/admin/OrganizationForm";
import CreateOrgAdminForm from "@/components/admin/CreateOrgAdminForm";
import { Building2, Plus, Edit, Trash, Check, X, UserPlus } from "lucide-react";
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
  useOrganizations,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
  useToggleOrganizationStatus,
} from "@/hooks/useOrganizations";

const Organizations = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [adminFormOpen, setAdminFormOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);

  const { data: organizations = [], isLoading } = useOrganizations();
  const createOrganization = useCreateOrganization();
  const updateOrganization = useUpdateOrganization();
  const deleteOrganization = useDeleteOrganization();
  const toggleStatus = useToggleOrganizationStatus();

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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

      {/* Table des organizations */}
      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
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
              {organizations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 sm:px-6 py-12 text-center text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">Aucune organization trouvée</p>
                    <p className="text-xs mt-1">Créez votre première organization</p>
                  </td>
                </tr>
              ) : (
                organizations.map((org) => (
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
                            {org.actif ? (
                              <Check className="w-3 h-3 text-success" />
                            ) : (
                              <X className="w-3 h-3 text-muted-foreground" />
                            )}
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
                      {org.actif ? (
                        <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-success">
                          <Check className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                          <X className="w-4 h-4" />
                          Inactive
                        </span>
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Organizations;

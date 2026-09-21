import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import LivreurForm, { LivreurFormSubmit } from "@/components/LivreurForm";
import LivreurMobileCard from "@/components/LivreurMobileCard";
import {
  useLivreurs,
  useCreateLivreur,
  useUpdateLivreur,
  useDeleteLivreur,
} from "@/hooks/useLivreurs";
import { Livreur } from "@/types/livreur";
import { Plus, Edit, Trash, CheckCircle, XCircle, Truck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Livreurs = () => {
  const { data: livreurs = [], isLoading } = useLivreurs();
  const createMutation = useCreateLivreur();
  const updateMutation = useUpdateLivreur();
  const deleteMutation = useDeleteLivreur();

  const [formOpen, setFormOpen] = useState(false);
  const [editingLivreur, setEditingLivreur] = useState<Livreur | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = () => {
    setFormMode('create');
    setEditingLivreur(null);
    setFormOpen(true);
  };

  const handleEdit = (livreur: Livreur) => {
    setFormMode('edit');
    setEditingLivreur(livreur);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  // Le formulaire ne se ferme qu'en cas de succès : en cas d'erreur (téléphone
  // déjà utilisé…), la saisie reste disponible pour être corrigée.
  const closeForm = () => {
    setFormOpen(false);
    setEditingLivreur(null);
  };

  const handleSubmit = (submit: LivreurFormSubmit) => {
    if (submit.mode === 'edit') {
      updateMutation.mutate({ id: submit.id, data: submit.data }, { onSuccess: closeForm });
    } else {
      createMutation.mutate(submit.data, { onSuccess: closeForm });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          title="Livreurs"
          description="Gestion des comptes livreurs"
          action={
            <button
              onClick={handleCreate}
              className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Nouveau Livreur
            </button>
          }
        />

      {/* Version mobile: Cartes */}
      <div className="md:hidden space-y-3 mb-6">
        {isLoading ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : livreurs.length > 0 ? (
          livreurs.map((livreur) => (
            <LivreurMobileCard
              key={livreur.id}
              livreur={livreur}
              onEdit={handleEdit}
              onDelete={setDeleteId}
              isDeleting={deleteMutation.isPending}
            />
          ))
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Truck className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-foreground font-medium">Aucun livreur</p>
            <p className="text-sm text-muted-foreground mt-1">Créez votre premier livreur</p>
          </div>
        )}
      </div>

      {/* Version desktop: Tableau */}
      <div className="hidden md:block bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground">Nom</th>
                <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground">Téléphone</th>
                <th className="text-center px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground">Statut</th>
                <th className="text-right px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-muted-foreground">
                    Chargement des livreurs...
                  </td>
                </tr>
              ) : livreurs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-muted-foreground">
                    Aucun livreur. Créez-en un pour commencer.
                  </td>
                </tr>
              ) : (
                livreurs.map((livreur) => (
                  <tr key={livreur.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="text-sm sm:text-base font-medium">{livreur.nom}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="text-xs sm:text-sm text-muted-foreground">{livreur.telephone}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                      {livreur.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] sm:text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] sm:text-xs font-medium">
                          <XCircle className="w-3 h-3" />
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(livreur)}
                          className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(livreur.id)}
                          className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                          title="Supprimer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Dialog */}
      <LivreurForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        initialData={editingLivreur}
        mode={formMode}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le livreur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce livreur ? Il ne pourra plus se connecter.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default Livreurs;

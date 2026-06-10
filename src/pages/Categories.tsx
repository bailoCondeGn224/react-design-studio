import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import CategorieForm from "@/components/CategorieForm";
import CategoryMobileCard from "@/components/CategoryMobileCard";
import Pagination from "@/components/Pagination";
import CanAccess from "@/components/CanAccess";
import { useCategories, useCreateCategorie, useUpdateCategorie, useDeleteCategorie } from "@/hooks/useCategories";
import { Categorie } from "@/types";
import { FolderTree, Plus, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
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

const Categories = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  const { data: categoriesResponse, isLoading } = useCategories({ page, limit });
  const categories = categoriesResponse?.data || [];
  const meta = categoriesResponse?.meta;
  const createMutation = useCreateCategorie();
  const updateMutation = useUpdateCategorie();
  const deleteMutation = useDeleteCategorie();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategorie, setEditingCategorie] = useState<Categorie | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = () => {
    setFormMode('create');
    setEditingCategorie(null);
    setFormOpen(true);
  };

  const handleEdit = (categorie: Categorie) => {
    setFormMode('edit');
    setEditingCategorie(categorie);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleSubmit = async (data: any) => {
    if (formMode === 'edit' && data.id) {
      updateMutation.mutate({ id: data.id, data: data.data });
    } else {
      createMutation.mutate(data);
    }
  };

  const stats = {
    total: categories.length,
    actives: categories.filter(c => c.actif).length,
    inactives: categories.filter(c => !c.actif).length,
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Catégories"
        description="Gestion des catégories de produits"
        action={
          <CanAccess permissions={['categories.create']}>
            <button
              onClick={handleCreate}
              className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Catégorie
            </button>
          </CanAccess>
        }
      />

      {/* Stats Cards - cachées sur mobile */}
      <div className="hidden md:grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FolderTree className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Catégories</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Actives</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.actives}</p>
              <p className="text-xs text-muted-foreground">Disponibles</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Inactives</p>
              <p className="text-xl font-bold text-muted-foreground">{stats.inactives}</p>
              <p className="text-xs text-muted-foreground">Désactivées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Version mobile: Cartes */}
      <div className="md:hidden space-y-3 mb-6">
        {categories.length > 0 ? (
          categories.map((categorie) => (
            <CategoryMobileCard
              key={categorie.id}
              categorie={categorie}
              onEdit={handleEdit}
              onDelete={setDeleteId}
            />
          ))
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 md:p-12 text-center">
            <FolderTree className="w-16 h-16 md:w-12 md:h-12 mx-auto mb-4 md:mb-3 text-muted-foreground opacity-30" />
            <p className="text-foreground font-semibold text-base md:text-sm">Aucune catégorie</p>
            <p className="text-sm md:text-xs text-muted-foreground mt-2 md:mt-1">Créez votre première catégorie</p>
          </div>
        )}
      </div>

      {/* Version desktop: Tableau */}
      <div className="hidden md:block bg-card border border-border rounded-lg shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Liste des Catégories</h3>
        </div>

        {categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((categorie) => (
                  <tr key={categorie.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-3">
                      <span className="font-mono font-semibold text-primary text-sm">{categorie.code}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-medium text-foreground text-sm">{categorie.nom}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-muted-foreground">
                        {categorie.description || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {categorie.actif ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <CanAccess permissions={['categories.update']}>
                          <button
                            onClick={() => handleEdit(categorie)}
                            className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-all active:scale-95"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </CanAccess>
                        <CanAccess permissions={['categories.delete']}>
                          <button
                            onClick={() => setDeleteId(categorie.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-all active:scale-95"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </CanAccess>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-foreground font-medium">Aucune catégorie</p>
            <p className="text-sm mt-1">Créez votre première catégorie pour commencer</p>
          </div>
        )}
      </div>

      {/* Pagination partagée */}
      {meta && (
        <div className="mt-6">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}

      {/* Form Dialog */}
      <CategorieForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        initialData={editingCategorie}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.
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
    </AppLayout>
  );
};

export default Categories;

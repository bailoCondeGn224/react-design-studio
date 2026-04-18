import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import CategorieForm from "@/components/CategorieForm";
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Catégories"
          description="Gestion des catégories de produits"
          action={
            <CanAccess permissions={['categories.create']}>
              <button
                onClick={handleCreate}
                className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Nouvelle Catégorie
              </button>
            </CanAccess>
          }
        />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FolderTree className="w-8 h-8 text-primary/40" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Actives</p>
              <p className="text-2xl font-bold text-green-600">{stats.actives}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600/40" />
          </div>
        </div>

        <div className="card p-4">
          <p className="text-sm text-muted-foreground">Inactives</p>
          <p className="text-2xl font-bold text-muted-foreground">{stats.inactives}</p>
        </div>
      </div>

      {/* Categories Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Code</th>
                <th className="text-left p-4 font-semibold">Nom</th>
                <th className="text-left p-4 font-semibold">Description</th>
                <th className="text-center p-4 font-semibold">Statut</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-muted-foreground">
                    Chargement des catégories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-muted-foreground">
                    Aucune catégorie. Créez-en une pour commencer.
                  </td>
                </tr>
              ) : (
                categories.map((categorie) => (
                  <tr key={categorie.id} className="border-b border-border hover:bg-secondary/50">
                    <td className="p-4">
                      <span className="font-mono font-semibold text-primary">{categorie.code}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{categorie.nom}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {categorie.description || '-'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {categorie.actif ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <CanAccess permissions={['categories.update']}>
                          <button
                            onClick={() => handleEdit(categorie)}
                            className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </CanAccess>
                        <CanAccess permissions={['categories.delete']}>
                          <button
                            onClick={() => setDeleteId(categorie.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </CanAccess>
                      </div>
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
      </div>
    </AppLayout>
  );
};

export default Categories;

import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import DepenseForm from "@/components/DepenseForm";
import DepenseMobileCard from "@/components/DepenseMobileCard";
import Pagination from "@/components/Pagination";
import CanAccess from "@/components/CanAccess";
import { useDepenses, useDepensesStats, useCreateDepense, useUpdateDepense, useDeleteDepense } from "@/hooks/useDepenses";
import { Depense, typeDepenseLabels, categorieDepenseLabels, StatutDepense, statutDepenseLabels } from "@/types";
import { Plus, Wallet, TrendingUp, TrendingDown, AlertCircle, Pencil, Trash2, Calendar, CheckCircle, Clock } from "lucide-react";
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

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(prix);
};

const Depenses = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const { data: depensesResponse, isLoading } = useDepenses({ page, limit, dateDebut, dateFin });
  const depenses = depensesResponse?.data || [];
  const meta = depensesResponse?.meta;

  const { data: stats } = useDepensesStats(dateDebut, dateFin);

  const createMutation = useCreateDepense();
  const updateMutation = useUpdateDepense();
  const deleteMutation = useDeleteDepense();

  const [formOpen, setFormOpen] = useState(false);
  const [editingDepense, setEditingDepense] = useState<Depense | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = () => {
    setFormMode('create');
    setEditingDepense(null);
    setFormOpen(true);
  };

  const handleEdit = (depense: Depense) => {
    setFormMode('edit');
    setEditingDepense(depense);
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
        title="Dépenses"
        description="Gestion des dépenses de l'entreprise"
        action={
          <CanAccess permissions={['depenses.create']}>
            <button
              onClick={handleCreate}
              className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Dépense
            </button>
          </CanAccess>
        }
      />

      {/* Filtres de date */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Date de début
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Date de fin
            </label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>
        {(dateDebut || dateFin) && (
          <button
            onClick={() => {
              setDateDebut('');
              setDateFin('');
            }}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Stats Cards - cachées sur mobile */}
      {stats && (
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Dépenses</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatPrix(stats.totalDepenses)}
                </p>
                <p className="text-xs text-muted-foreground">{stats.nombreDepenses} dépenses</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fixes</p>
                <p className="text-xl font-bold text-foreground">
                  {formatPrix(stats.depensesFixes)}
                </p>
                <p className="text-xs text-muted-foreground">Mensuelles</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Variables</p>
                <p className="text-xl font-bold text-foreground">
                  {formatPrix(stats.depensesVariables)}
                </p>
                <p className="text-xs text-muted-foreground">Occasionnelles</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Exceptionnelles</p>
                <p className="text-xl font-bold text-foreground">
                  {formatPrix(stats.depensesExceptionnelles)}
                </p>
                <p className="text-xs text-muted-foreground">Ponctuelles</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version mobile: Cartes */}
      <div className="md:hidden space-y-3 mb-6">
        {depenses.length > 0 ? (
          depenses.map((depense) => (
            <DepenseMobileCard
              key={depense.id}
              depense={depense}
              formatPrix={formatPrix}
              onEdit={handleEdit}
              onDelete={setDeleteId}
            />
          ))
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Wallet className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-foreground font-medium">Aucune dépense</p>
            <p className="text-sm text-muted-foreground mt-1">Enregistrez votre première dépense</p>
          </div>
        )}
      </div>

      {/* Version desktop: Tableau */}
      <div className="hidden md:block bg-card border border-border rounded-lg shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Liste des Dépenses</h3>
        </div>

        {depenses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-foreground font-medium">Aucune dépense enregistrée</p>
            <p className="text-sm mt-1">Commencez par enregistrer une dépense</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Catégorie</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Montant</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {depenses.map((depense) => (
                    <tr key={depense.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">
                            {new Date(depense.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-foreground">
                          {typeDepenseLabels[depense.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            depense.categorie === 'FIXE'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : depense.categorie === 'VARIABLE'
                              ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                              : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                          }`}
                        >
                          {categorieDepenseLabels[depense.categorie]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                            depense.statut === StatutDepense.INCLUSE
                              ? 'bg-success/10 text-success'
                              : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                          }`}
                        >
                          {depense.statut === StatutDepense.INCLUSE ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {statutDepenseLabels[depense.statut]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {depense.description || '-'}
                        </span>
                        {depense.reference && (
                          <span className="text-xs text-muted-foreground block mt-0.5">
                            Réf: {depense.reference}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">
                          {formatPrix(depense.montant)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <CanAccess permissions={['depenses.update']}>
                            <button
                              onClick={() => handleEdit(depense)}
                              className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                              title="Modifier"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </CanAccess>
                          <CanAccess permissions={['depenses.delete']}>
                            <button
                              onClick={() => setDeleteId(depense.id)}
                              className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
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
          </>
        )}
      </div>

      {/* Pagination partagée */}
      {meta && (
        <div className="mt-6">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}

      {/* Form Dialog */}
      <DepenseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        initialData={editingDepense}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la dépense</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible.
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
    </AppLayout>
  );
};

export default Depenses;

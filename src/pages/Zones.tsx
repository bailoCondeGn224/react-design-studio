import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import ZoneForm from "@/components/ZoneForm";
import Pagination from "@/components/Pagination";
import CanAccess from "@/components/CanAccess";
import { useZones, useCreateZone, useUpdateZone, useDeleteZone } from "@/hooks/useZones";
import { Zone } from "@/api/zones";
import { MapPin, Plus, Edit, Trash, CheckCircle, XCircle } from "lucide-react";
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

const Zones = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  const { data: zonesResponse, isLoading } = useZones({ page, limit });
  const zones = zonesResponse?.data || [];
  const meta = zonesResponse?.meta;
  const createMutation = useCreateZone();
  const updateMutation = useUpdateZone();
  const deleteMutation = useDeleteZone();

  const [formOpen, setFormOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = () => {
    setFormMode('create');
    setEditingZone(null);
    setFormOpen(true);
  };

  const handleEdit = (zone: Zone) => {
    setFormMode('edit');
    setEditingZone(zone);
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
    setFormOpen(false);
    setEditingZone(null);
  };

  const stats = {
    total: zones.length,
    actives: zones.filter(z => z.actif).length,
    inactives: zones.filter(z => !z.actif).length,
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          title="Zones"
          description="Gestion des zones d'entreposage"
          action={
            <CanAccess permissions={['zones.create']}>
              <button
                onClick={handleCreate}
                className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                Nouvelle Zone
              </button>
            </CanAccess>
          }
        />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-sm text-muted-foreground">Total</p>
              <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
            </div>
            <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary/40" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-sm text-muted-foreground">Actives</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.actives}</p>
            </div>
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600/40" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-sm text-muted-foreground">Inactives</p>
              <p className="text-xl sm:text-2xl font-bold text-muted-foreground">{stats.inactives}</p>
            </div>
            <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/40" />
          </div>
        </div>
      </div>

      {/* Zones Table */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground">Code</th>
                <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground">Nom</th>
                <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground hidden md:table-cell">Description</th>
                <th className="text-center px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground">Statut</th>
                <th className="text-right px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-muted-foreground">
                    Chargement des zones...
                  </td>
                </tr>
              ) : zones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-muted-foreground">
                    Aucune zone. Créez-en une pour commencer.
                  </td>
                </tr>
              ) : (
                zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="font-mono text-xs sm:text-sm font-semibold text-primary">{zone.code}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="text-sm sm:text-base font-medium">{zone.nom}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {zone.description || '-'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                      {zone.actif ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] sm:text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] sm:text-xs font-medium">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-end gap-2">
                        <CanAccess permissions={['zones.update']}>
                          <button
                            onClick={() => handleEdit(zone)}
                            className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </CanAccess>
                        <CanAccess permissions={['zones.delete']}>
                          <button
                            onClick={() => setDeleteId(zone.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                            title="Supprimer"
                          >
                            <Trash className="w-4 h-4" />
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
      <ZoneForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        initialData={editingZone}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la zone</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette zone ? Cette action est irréversible.
              Assurez-vous qu'aucune catégorie n'est associée à cette zone.
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

export default Zones;

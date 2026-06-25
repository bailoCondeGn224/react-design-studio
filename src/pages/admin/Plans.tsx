import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import PlanForm from "@/components/admin/PlanForm";
import PlanMobileCard from "@/components/admin/PlanMobileCard";
import { Sparkles, Plus, Edit, Trash, Check, X } from "lucide-react";
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
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from "@/hooks/usePlans";

const Plans = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: plans = [], isLoading } = usePlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editingItem) {
      updatePlan.mutate({ id: editingItem.id, data });
    } else {
      createPlan.mutate(data);
    }
    setEditingItem(null);
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deletePlan.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingItem(null);
    }
  };

  const formatPrix = (prix: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(prix).replace('GNF', 'GNF');
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des plans...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Gestion des Plans"
        description="Gérer les plans tarifaires de la plateforme"
        action={
          <button
            onClick={() => setFormOpen(true)}
            className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Nouveau Plan
          </button>
        }
      />

      <PlanForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleSubmit}
        initialData={editingItem}
        mode={editingItem ? 'edit' : 'create'}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce plan ? Les organizations utilisant ce plan devront être réassignées.
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

      {/* Version mobile: Cartes avec Sheet */}
      <div className="md:hidden space-y-3 mb-6">
        {plans.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-foreground font-medium">Aucun plan trouvé</p>
            <p className="text-sm text-muted-foreground mt-1">Créez votre premier plan tarifaire</p>
          </div>
        ) : (
          plans.map((plan) => (
            <PlanMobileCard
              key={plan.id}
              plan={plan}
              onEdit={handleEdit}
              onDelete={setDeleteId}
              formatPrix={formatPrix}
            />
          ))
        )}
      </div>

      {/* Version desktop: Grille des plans */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {plans.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Aucun plan trouvé</p>
            <p className="text-xs mt-1">Créez votre premier plan tarifaire</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-card rounded-xl border shadow-card overflow-hidden hover:shadow-elevated transition-all duration-300"
            >
              {/* Header */}
              <div className="p-5 lg:p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-b">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base lg:text-lg">{plan.nom}</h3>
                      <p className="text-xs text-muted-foreground">{plan.code}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-accent rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(plan)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteId(plan.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg lg:text-xl font-bold">{formatPrix(plan.prixMensuel)}</span>
                    <span className="text-xs text-muted-foreground">/mois</span>
                  </div>
                </div>

                <div className="mt-3">
                  {plan.actif ? (
                    <span className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full">
                      <Check className="w-3 h-3" />
                      Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      <X className="w-3 h-3" />
                      Inactif
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 lg:p-6">
                {plan.description ? (
                  <p className="text-xs lg:text-sm text-muted-foreground line-clamp-3">{plan.description}</p>
                ) : (
                  <p className="text-xs lg:text-sm text-muted-foreground italic">Aucune description</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
};

export default Plans;

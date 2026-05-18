import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import RetourClientForm from "@/components/RetourClientForm";
import RetourClientMobileCard from "@/components/RetourClientMobileCard";
import CanAccess from "@/components/CanAccess";
import { Plus, RotateCcw, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";
import { useCreateRetourClient, useRetoursClients, useRetoursClientsStats } from "@/hooks/useRetours";

const RetoursClients = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 50;

  const createRetourClient = useCreateRetourClient();
  const { data: retoursData, isLoading } = useRetoursClients({ page, limit });
  const { data: stats } = useRetoursClientsStats();

  const handleSubmit = (data: any) => {
    createRetourClient.mutate(data, {
      onSuccess: () => {
        setFormOpen(false);
      }
    });
  };

  const formatPrix = (montant: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(montant).replace('GNF', 'GNF');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
        title="Retours Clients"
        description="Gérer les retours de produits des clients"
        action={
          <CanAccess permissions={['retours.create']}>
            <button onClick={() => setFormOpen(true)} className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Nouveau Retour
            </button>
          </CanAccess>
        }
      />

      {/* Stats Cards */}
      <div className="hidden md:grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Retours</p>
              <p className="text-xl font-bold text-foreground">{stats?.totalRetours || 0}</p>
              <p className="text-xs text-muted-foreground">Enregistrés</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Montant Total</p>
              <p className="text-xl font-bold text-foreground">{stats ? formatPrix(stats.montantTotal) : formatPrix(0)}</p>
              <p className="text-xs text-muted-foreground">Remboursé</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ce Mois</p>
              <p className="text-xl font-bold text-foreground">{stats?.retoursCeMois || 0}</p>
              <p className="text-xs text-muted-foreground">Retours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Message - masqué sur mobile */}
      <div className="hidden md:block bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <RotateCcw className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1 text-foreground">À propos des retours clients</p>
            <p>
              Sélectionnez une vente existante, puis choisissez les articles à retourner.
              Le stock sera automatiquement mis à jour et le client sera remboursé selon le mode choisi.
            </p>
          </div>
        </div>
      </div>

      {/* Version mobile: Cartes */}
      <div className="md:hidden space-y-3 mb-6">
        {retoursData && retoursData.data && retoursData.data.length > 0 ? (
          retoursData.data.map((retour: any) => (
            <RetourClientMobileCard
              key={retour.id}
              retour={retour}
              formatPrix={formatPrix}
              formatDate={formatDate}
            />
          ))
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <RotateCcw className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-foreground font-medium">Aucun retour client</p>
            <p className="text-sm text-muted-foreground mt-1">Créez votre premier retour</p>
          </div>
        )}
      </div>

      {/* Version desktop: Tableau */}
      <div className="hidden md:block bg-card border border-border rounded-lg shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Historique des Retours</h3>
        </div>

        {retoursData && retoursData.data && retoursData.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Article</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantité</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Prix Unit.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Montant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Référence</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Utilisateur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {retoursData.data.map((retour: any) => (
                    <tr key={retour.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{formatDate(retour.date)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{retour.articleNom}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{retour.quantite}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{formatPrix(retour.prixUnitaire)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400">{formatPrix(retour.valeurTotal)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{retour.reference}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{retour.userNom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <RotateCcw className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-foreground font-medium">Aucun retour client enregistré</p>
            <p className="text-sm mt-1">Créez votre premier retour client pour commencer</p>
          </div>
        )}
      </div>

      {/* Pagination partagée */}
      {retoursData && retoursData.meta && (
        <div className="mt-6">
          <Pagination
            meta={retoursData.meta}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Formulaire de retour */}
      <RetourClientForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      />
    </AppLayout>
  );
};

export default RetoursClients;

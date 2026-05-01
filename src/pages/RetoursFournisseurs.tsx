import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import RetourFournisseurForm from "@/components/RetourFournisseurForm";
import CanAccess from "@/components/CanAccess";
import { Plus, PackageX, Calendar, TrendingDown, DollarSign } from "lucide-react";
import { useState } from "react";
import { useCreateRetourFournisseur, useRetoursFournisseurs, useRetoursFournisseursStats } from "@/hooks/useRetours";

const RetoursFournisseurs = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [page, setPage] = useState(1);

  const createRetourFournisseur = useCreateRetourFournisseur();
  const { data: retoursData } = useRetoursFournisseurs({ page, limit: 50 });
  const { data: stats } = useRetoursFournisseursStats();

  const handleSubmit = (data: any) => {
    createRetourFournisseur.mutate(data, {
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

  return (
    <AppLayout>
      <PageHeader
        title="Retours Fournisseurs"
        description="Gérer les retours de produits aux fournisseurs"
        action={
          <CanAccess permissions={['retours.create']}>
            <button onClick={() => setFormOpen(true)} className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Nouveau Retour
            </button>
          </CanAccess>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Retours</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalRetours || 0}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <PackageX className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Montant Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats ? formatPrix(stats.montantTotal) : formatPrix(0)}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Remboursements Reçus</p>
              <p className="text-2xl font-bold text-gray-900">{stats ? formatPrix(stats.montantRembourse) : formatPrix(0)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <PackageX className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-orange-700">
            <p className="font-medium mb-1">À propos des retours fournisseurs</p>
            <p>
              Sélectionnez un approvisionnement existant, puis choisissez les articles à retourner au fournisseur.
              Le stock sera automatiquement décrémenté et les finances du fournisseur ajustées.
            </p>
          </div>
        </div>
      </div>

      {/* Historique des retours */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4">Historique des Retours</h3>
        {retoursData && retoursData.data && retoursData.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Unit.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {retoursData.data.map((retour: any) => (
                  <tr key={retour.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{new Date(retour.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm font-medium">{retour.articleNom}</td>
                    <td className="px-4 py-3 text-sm">{retour.quantite}</td>
                    <td className="px-4 py-3 text-sm">{formatPrix(retour.prixUnitaire)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-orange-600">{formatPrix(retour.valeurTotal)}</td>
                    <td className="px-4 py-3 text-sm">{retour.reference}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{retour.userNom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <PackageX className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun retour fournisseur enregistré</p>
            <p className="text-sm mt-1">Créez votre premier retour fournisseur pour commencer</p>
          </div>
        )}
      </div>

      {/* Formulaire de retour */}
      <RetourFournisseurForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      />
    </AppLayout>
  );
};

export default RetoursFournisseurs;

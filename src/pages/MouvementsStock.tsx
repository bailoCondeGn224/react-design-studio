import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { Search, ArrowUpCircle, ArrowDownCircle, Filter, Calendar, Package, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useMouvements, useStatsMouvements } from "@/hooks/useMouvements";

const motifLabels: Record<string, string> = {
  vente: "Vente",
  approvisionnement: "Approvisionnement",
  ajustement: "Ajustement",
  retour_client: "Retour Client",
  retour_fournisseur: "Retour Fournisseur",
  perte: "Perte/Vol",
  casse: "Casse/Détérioration",
};

const motifColors: Record<string, string> = {
  vente: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  approvisionnement: "bg-green-500/10 text-green-600 border-green-500/30",
  ajustement: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  retour_client: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  retour_fournisseur: "bg-teal-500/10 text-teal-600 border-teal-500/30",
  perte: "bg-red-500/10 text-red-600 border-red-500/30",
  casse: "bg-gray-500/10 text-gray-600 border-gray-500/30",
};

const MouvementsStock = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [motifFilter, setMotifFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Utiliser les filtres backend au lieu du filtrage côté client
  const { data: mouvementsResponse, isLoading } = useMouvements({
    page,
    limit,
    search: search || undefined,
    type: typeFilter !== "all" ? typeFilter as 'entree' | 'sortie' : undefined,
    motif: motifFilter !== "all" ? motifFilter as any : undefined,
  });
  const mouvements = mouvementsResponse?.data || [];
  const meta = mouvementsResponse?.meta;
  const { data: stats, isLoading: isLoadingStats } = useStatsMouvements();

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, motifFilter]);

  const formatPrix = (prix: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(prix).replace('GNF', 'GNF');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement de l'historique...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Historique des Mouvements"
        description="Traçabilité complète des entrées et sorties de stock"
      />

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoadingStats ? (
          // Skeleton pendant le chargement
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 shadow-card animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary" />
                  <div className="flex-1">
                    <div className="h-3 bg-secondary rounded w-20 mb-2" />
                    <div className="h-6 bg-secondary rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : stats ? (
          <>
            <div className="bg-card border border-border rounded-lg p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <ArrowUpCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Entrées Totales</p>
                  <p className="text-xl font-bold text-success">{stats.totalEntrees}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <ArrowDownCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sorties Totales</p>
                  <p className="text-xl font-bold text-destructive">{stats.totalSorties}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valeur Entrées</p>
                  <p className="text-sm font-bold text-foreground">{formatPrix(stats.valeurEntrees)}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valeur Sorties</p>
                  <p className="text-sm font-bold text-foreground">{formatPrix(stats.valeurSorties)}</p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            <option value="all">Tous les types</option>
            <option value="entree">Entrées</option>
            <option value="sortie">Sorties</option>
          </select>

          <select
            value={motifFilter}
            onChange={(e) => setMotifFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            <option value="all">Tous les motifs</option>
            <option value="vente">Vente</option>
            <option value="approvisionnement">Approvisionnement</option>
            <option value="ajustement">Ajustement</option>
            <option value="retour_client">Retour Client</option>
            <option value="retour_fournisseur">Retour Fournisseur</option>
            <option value="perte">Perte/Vol</option>
            <option value="casse">Casse</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-secondary border-b border-border">
                <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Date</th>
                <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Article</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Type</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Motif</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4">Quantité</th>
                <th className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">Stock</th>
                <th className="text-right text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 hidden xl:table-cell">Valeur</th>
                <th className="text-left text-[10px] sm:text-xs font-bold uppercase tracking-wide text-foreground px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Référence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mouvements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                    Aucun mouvement trouvé
                  </td>
                </tr>
              ) : (
                mouvements.map((mouvement: any) => (
                  <tr key={mouvement.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <p className="text-xs text-muted-foreground">{formatDate(mouvement.date)}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-semibold text-foreground">{mouvement.articleNom}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                      {mouvement.type === 'entree' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-success/20 text-success border border-success/50">
                          <ArrowUpCircle className="w-3 h-3" />
                          Entrée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-destructive/20 text-destructive border border-destructive/50">
                          <ArrowDownCircle className="w-3 h-3" />
                          Sortie
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${motifColors[mouvement.motif] || 'bg-secondary'}`}>
                        {motifLabels[mouvement.motif] || mouvement.motif}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                      <span className={`text-lg font-bold ${mouvement.type === 'entree' ? 'text-success' : 'text-destructive'}`}>
                        {mouvement.type === 'entree' ? '+' : '-'}{mouvement.quantite}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center hidden lg:table-cell">
                      <div className="text-xs space-y-0.5">
                        <p className="text-muted-foreground">
                          <span className="font-mono">{mouvement.stockAvant}</span>
                          <span className="mx-1">→</span>
                          <span className="font-mono font-bold text-foreground">{mouvement.stockApres}</span>
                        </p>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right hidden xl:table-cell">
                      {mouvement.valeurTotal ? (
                        <span className="text-sm font-semibold text-foreground">
                          {formatPrix(mouvement.valeurTotal)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                      <p className="text-xs text-muted-foreground font-mono">
                        {mouvement.reference || '-'}
                      </p>
                      {mouvement.utilisateurNom && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Par: {mouvement.utilisateurNom}
                        </p>
                      )}
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
    </AppLayout>
  );
};

export default MouvementsStock;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInventaires } from '@/hooks/useInventaires';
import { Inventaire } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CreateInventaireDialog from '@/components/inventaires/CreateInventaireDialog';
import Pagination from '@/components/Pagination';

export default function Inventaires() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { data: response, isLoading } = useInventaires({ page, limit });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const inventaires = response?.data || [];
  const meta = response?.meta;

  const getStatutBadge = (statut: string) => {
    if (statut === 'TERMINE') {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Terminé
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Clock className="w-3 h-3 mr-1" />
        En cours
      </Badge>
    );
  };

  const getProgressColor = (inventaire: Inventaire) => {
    const progress =
      inventaire.totalArticles > 0
        ? (inventaire.articlesComptes / inventaire.totalArticles) * 100
        : 0;

    if (progress === 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Inventaires"
        description="Gérez vos inventaires physiques et ajustez les stocks"
        action={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Inventaire
          </Button>
        }
      />

      <div className="space-y-6">

      {/* Liste des inventaires */}
      {!inventaires || inventaires.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Aucun inventaire</p>
            <p className="text-sm text-muted-foreground mb-4">
              Commencez par créer votre premier inventaire
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un inventaire
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inventaires.map((inventaire) => (
              <Card
                key={inventaire.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/inventaires/${inventaire.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        {inventaire.note || 'Inventaire sans titre'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(inventaire.date), 'dd MMM yyyy', {
                          locale: fr,
                        })}
                      </CardDescription>
                    </div>
                    {getStatutBadge(inventaire.statut)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Progression */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium">
                        {inventaire.articlesComptes}/{inventaire.totalArticles}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(inventaire)} transition-all`}
                        style={{
                          width: `${inventaire.totalArticles > 0 ? (inventaire.articlesComptes / inventaire.totalArticles) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Écarts */}
                  {inventaire.articlesAvecEcarts > 0 && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                      <AlertTriangle className="w-4 h-4" />
                      <span>
                        {inventaire.articlesAvecEcarts} article(s) avec écarts
                      </span>
                    </div>
                  )}

                  {/* Responsable */}
                  {inventaire.responsableNom && (
                    <p className="text-xs text-muted-foreground">
                      Par {inventaire.responsableNom}
                    </p>
                  )}

                  {/* Date de fin */}
                  {inventaire.termineLe && (
                    <p className="text-xs text-muted-foreground">
                      Terminé le{' '}
                      {format(new Date(inventaire.termineLe), 'dd/MM/yyyy HH:mm', {
                        locale: fr,
                      })}
                    </p>
                  )}

                  {/* Action */}
                  {inventaire.statut === 'EN_COURS' && (
                    <Button className="w-full mt-2" variant="outline" size="sm">
                      Continuer le comptage
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <Card>
              <Pagination meta={meta} onPageChange={setPage} />
            </Card>
          )}
        </>
      )}

      {/* Dialog de création */}
      <CreateInventaireDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      </div>
    </AppLayout>
  );
}

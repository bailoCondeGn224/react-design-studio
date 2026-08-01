import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Livreur } from '@/types/livreur';
import {
  User,
  Phone,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface LivreurMobileCardProps {
  livreur: Livreur;
  onEdit: (livreur: Livreur) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const LivreurMobileCard = ({
  livreur,
  onEdit,
  onDelete,
  isDeleting = false,
}: LivreurMobileCardProps) => {
  const hasPosition = livreur.latitude && livreur.longitude;

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{livreur.nom}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {livreur.telephone}
                </p>
              </div>
            </div>
          </div>
          <div
            className={`px-2.5 py-1.5 rounded-full border ${livreur.isActive ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-800' : 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-800'}`}
          >
            <div className="flex items-center gap-1.5">
              {livreur.isActive ? (
                <CheckCircle className="w-3.5 h-3.5 text-green-700 dark:text-green-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-700 dark:text-red-400" />
              )}
              <p
                className={`text-xs font-bold ${livreur.isActive ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
              >
                {livreur.isActive ? 'Actif' : 'Inactif'}
              </p>
            </div>
          </div>
        </div>

        {hasPosition && (
          <div className="px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>Position mise à jour</span>
          </div>
        )}

        <div className="p-3 border-t border-border/50 bg-muted/20">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="default"
                size="lg"
                className="w-full h-11 text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <MoreVertical className="w-4 h-4 mr-2" />
                Actions
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[85vh]">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-left text-lg">
                  {livreur.nom}
                </SheetTitle>
                <p className="text-sm text-muted-foreground text-left">
                  {livreur.telephone}
                </p>
              </SheetHeader>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-14 justify-start text-left text-base"
                  onClick={() => onEdit(livreur)}
                >
                  <Pencil className="w-5 h-5 mr-3" />
                  Modifier
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-14 justify-start text-left text-base text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  onClick={() => onDelete(livreur.id)}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-5 h-5 mr-3" />
                  {isDeleting ? 'Suppression...' : 'Supprimer'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardContent>
    </Card>
  );
};

export default LivreurMobileCard;

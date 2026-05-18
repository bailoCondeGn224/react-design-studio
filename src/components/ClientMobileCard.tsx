import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import CanAccess from "@/components/CanAccess";
import { UserCheck, CreditCard, Eye, Edit, Trash2, Phone, Mail, MapPin } from "lucide-react";

interface ClientMobileCardProps {
  client: any;
  onViewDetails: (client: any) => void;
  onEdit: (client: any) => void;
  onDelete: (id: string) => void;
  formatPrix: (prix: number) => string;
}

const ClientMobileCard = ({
  client,
  onViewDetails,
  onEdit,
  onDelete,
  formatPrix
}: ClientMobileCardProps) => {
  const hasCredits = client.totalCredits > 0;

  return (
    <Card className={`transition-shadow hover:shadow-lg ${
      hasCredits ? 'border-destructive/30 bg-destructive/5' : 'border-border'
    }`}>
      <CardContent className="p-0">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              hasCredits ? 'bg-destructive/10' : 'bg-primary/10'
            }`}>
              <UserCheck className={`w-5 h-5 ${hasCredits ? 'text-destructive' : 'text-primary'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground truncate">{client.nom}</p>
              {client.adresse && (
                <p className="text-xs text-muted-foreground truncate">{client.adresse}</p>
              )}
            </div>
          </div>
        </div>

        {/* Montants */}
        <div className="p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Total achats</p>
            <p className="text-base font-bold text-foreground">{formatPrix(client.totalAchats)}</p>
          </div>
          {hasCredits && (
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-destructive" />
                <p className="text-xs font-medium text-destructive">Crédit en cours</p>
              </div>
              <p className="text-base font-bold text-destructive">{formatPrix(client.totalCredits)}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3 border-t border-border bg-card">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="lg" className="w-full text-sm font-semibold">
                Actions
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[85vh]">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-left text-lg">{client.nom}</SheetTitle>
              </SheetHeader>

              {/* Infos contact */}
              <div className="space-y-3 mb-6">
                {client.telephone && (
                  <div className="flex items-center gap-3 py-2 border-b border-border">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{client.telephone}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-3 py-2 border-b border-border">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                )}
                {client.adresse && (
                  <div className="flex items-start gap-3 py-2">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{client.adresse}</span>
                  </div>
                )}
              </div>

              {/* Actions buttons */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-start text-left text-base"
                  onClick={() => onViewDetails(client)}
                >
                  <Eye className="w-5 h-5 mr-3" />
                  Voir l'historique
                </Button>

                <CanAccess permissions={['clients.update']}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-start text-left text-base"
                    onClick={() => onEdit(client)}
                  >
                    <Edit className="w-5 h-5 mr-3" />
                    Modifier
                  </Button>
                </CanAccess>

                <CanAccess permissions={['clients.delete']}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-start text-left text-base text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                    onClick={() => onDelete(client.id)}
                  >
                    <Trash2 className="w-5 h-5 mr-3" />
                    Supprimer
                  </Button>
                </CanAccess>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientMobileCard;

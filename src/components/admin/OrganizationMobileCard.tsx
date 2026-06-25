import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, Edit, Trash2, UserPlus, Calendar } from "lucide-react";
import { OrganizationStatus } from "@/types";

interface OrganizationMobileCardProps {
  org: any;
  onEdit: (org: any) => void;
  onDelete: (id: string) => void;
  onCreateAdmin: (org: any) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSuspend: (id: string) => void;
  onReactivate: (id: string) => void;
  showPendingActions?: boolean;
  formatDate: (date: string) => string;
}

const OrganizationMobileCard = ({
  org,
  onEdit,
  onDelete,
  onCreateAdmin,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
  showPendingActions = false,
  formatDate,
}: OrganizationMobileCardProps) => {

  const getStatusBadge = (statut: OrganizationStatus) => {
    switch (statut) {
      case OrganizationStatus.EN_ATTENTE:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        );
      case OrganizationStatus.APPROUVE:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
            <CheckCircle className="w-3 h-3" />
            Approuvée
          </span>
        );
      case OrganizationStatus.REJETE:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            <XCircle className="w-3 h-3" />
            Rejetée
          </span>
        );
      case OrganizationStatus.SUSPENDU:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500">
            <AlertTriangle className="w-3 h-3" />
            Suspendue
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="transition-shadow hover:shadow-lg overflow-hidden">
      <CardContent className="p-0">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{org.nom}</p>
              <p className="text-xs text-muted-foreground">{org.slug}</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            {org.statut && getStatusBadge(org.statut)}
          </div>
        </div>

        {/* Plan */}
        <div className="px-4 py-2 border-b border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Plan</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {org.plan?.nom || 'N/A'}
            </span>
          </div>
        </div>

        {/* Détails */}
        <div className="p-4 space-y-3 bg-muted/30">
          {org.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-foreground truncate">{org.email}</p>
            </div>
          )}
          {org.telephone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-foreground">{org.telephone}</p>
            </div>
          )}
          {org.createdAt && (
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Créée le</span>
              </div>
              <span className="text-xs font-medium text-foreground">{formatDate(org.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3 border-t border-border bg-card">
          {showPendingActions ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => onApprove(org.id)}
                className="flex-1 text-success border-success/30 hover:bg-success/10"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approuver
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onReject(org.id)}
                className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rejeter
              </Button>
            </div>
          ) : (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="lg" className="w-full text-sm font-semibold">
                  Actions
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto max-h-[85vh]">
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-left text-lg">{org.nom}</SheetTitle>
                </SheetHeader>

                {/* Infos rapides */}
                <div className="space-y-3 mb-6">
                  {org.email && (
                    <div className="flex items-center gap-3 py-2 border-b border-border">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{org.email}</span>
                    </div>
                  )}
                  {org.telephone && (
                    <div className="flex items-center gap-3 py-2 border-b border-border">
                      <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{org.telephone}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Statut</span>
                    {org.statut && getStatusBadge(org.statut)}
                  </div>
                </div>

                {/* Actions buttons */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-start text-left text-base"
                    onClick={() => onEdit(org)}
                  >
                    <Edit className="w-5 h-5 mr-3" />
                    Modifier
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-start text-left text-base"
                    onClick={() => onCreateAdmin(org)}
                  >
                    <UserPlus className="w-5 h-5 mr-3" />
                    Créer un administrateur
                  </Button>

                  {/* Actions selon le statut */}
                  {org.statut === OrganizationStatus.EN_ATTENTE && (
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-start text-left text-base text-success hover:text-success hover:bg-success/10 border-success/30"
                        onClick={() => onApprove(org.id)}
                      >
                        <CheckCircle className="w-5 h-5 mr-3" />
                        Approuver
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-start text-left text-base text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                        onClick={() => onReject(org.id)}
                      >
                        <XCircle className="w-5 h-5 mr-3" />
                        Rejeter
                      </Button>
                    </>
                  )}

                  {org.statut === OrganizationStatus.APPROUVE && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full justify-start text-left text-base text-orange-500 hover:text-orange-500 hover:bg-orange-500/10 border-orange-500/30"
                      onClick={() => onSuspend(org.id)}
                    >
                      <AlertTriangle className="w-5 h-5 mr-3" />
                      Suspendre
                    </Button>
                  )}

                  {org.statut === OrganizationStatus.SUSPENDU && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full justify-start text-left text-base text-success hover:text-success hover:bg-success/10 border-success/30"
                      onClick={() => onReactivate(org.id)}
                    >
                      <RefreshCw className="w-5 h-5 mr-3" />
                      Réactiver
                    </Button>
                  )}

                  {org.statut === OrganizationStatus.REJETE && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full justify-start text-left text-base text-success hover:text-success hover:bg-success/10 border-success/30"
                      onClick={() => onApprove(org.id)}
                    >
                      <CheckCircle className="w-5 h-5 mr-3" />
                      Approuver quand même
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-start text-left text-base text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                    onClick={() => onDelete(org.id)}
                  >
                    <Trash2 className="w-5 h-5 mr-3" />
                    Supprimer
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganizationMobileCard;

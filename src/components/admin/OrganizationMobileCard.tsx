import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, Edit, Trash2, UserPlus, Calendar, MoreHorizontal, Sparkles } from "lucide-react";
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

  const getStatusConfig = (statut: OrganizationStatus) => {
    switch (statut) {
      case OrganizationStatus.EN_ATTENTE:
        return {
          icon: Clock,
          label: "En attente",
          bgColor: "bg-warning/10",
          textColor: "text-warning",
          borderColor: "border-warning/30"
        };
      case OrganizationStatus.APPROUVE:
        return {
          icon: CheckCircle,
          label: "Approuvée",
          bgColor: "bg-success/10",
          textColor: "text-success",
          borderColor: "border-success/30"
        };
      case OrganizationStatus.REJETE:
        return {
          icon: XCircle,
          label: "Rejetée",
          bgColor: "bg-destructive/10",
          textColor: "text-destructive",
          borderColor: "border-destructive/30"
        };
      case OrganizationStatus.SUSPENDU:
        return {
          icon: AlertTriangle,
          label: "Suspendue",
          bgColor: "bg-orange-500/10",
          textColor: "text-orange-500",
          borderColor: "border-orange-500/30"
        };
      default:
        return null;
    }
  };

  const statusConfig = org.statut ? getStatusConfig(org.statut) : null;
  const StatusIcon = statusConfig?.icon;

  return (
    <Card className={`overflow-hidden transition-all duration-200 ${
      statusConfig ? `border-l-4 ${statusConfig.borderColor}` : ''
    }`}>
      <CardContent className="p-0">
        {/* Header avec nom et statut */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                statusConfig ? statusConfig.bgColor : 'bg-primary/10'
              }`}>
                <Building2 className={`w-5 h-5 ${statusConfig ? statusConfig.textColor : 'text-primary'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-foreground truncate">{org.nom}</h3>
                <p className="text-xs text-muted-foreground truncate">{org.slug}</p>
              </div>
            </div>

            {/* Badge statut compact */}
            {statusConfig && StatusIcon && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{statusConfig.label}</span>
              </div>
            )}
          </div>
        </div>

        {/* Infos compactes */}
        <div className="px-4 pb-3 space-y-2">
          {/* Plan */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs">Plan</span>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {org.plan?.nom || 'N/A'}
            </span>
          </div>

          {/* Contact */}
          {(org.email || org.telephone) && (
            <div className="flex items-center gap-3 text-sm">
              {org.email && (
                <div className="flex items-center gap-1.5 text-muted-foreground flex-1 min-w-0">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate text-xs">{org.email}</span>
                </div>
              )}
              {org.telephone && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs">{org.telephone}</span>
                </div>
              )}
            </div>
          )}

          {/* Date création */}
          {org.createdAt && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>Créée le {formatDate(org.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3 pt-0">
          {showPendingActions ? (
            /* Actions rapides pour organisations en attente */
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="default"
                onClick={() => onApprove(org.id)}
                className="flex-1 h-11 text-success border-success/30 hover:bg-success/10 hover:text-success font-semibold"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approuver
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => onReject(org.id)}
                className="flex-1 h-11 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive font-semibold"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rejeter
              </Button>
            </div>
          ) : (
            /* Sheet avec toutes les actions */
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="default"
                  className="w-full h-11 text-sm font-semibold gap-2"
                >
                  <MoreHorizontal className="w-4 h-4" />
                  Actions
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-2xl">
                <SheetHeader className="pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      statusConfig ? statusConfig.bgColor : 'bg-primary/10'
                    }`}>
                      <Building2 className={`w-6 h-6 ${statusConfig ? statusConfig.textColor : 'text-primary'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <SheetTitle className="text-lg">{org.nom}</SheetTitle>
                      <p className="text-sm text-muted-foreground">{org.plan?.nom || 'Aucun plan'}</p>
                    </div>
                    {statusConfig && StatusIcon && (
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </div>
                    )}
                  </div>
                </SheetHeader>

                {/* Infos détaillées */}
                <div className="py-4 space-y-3 border-b border-border">
                  {org.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">{org.email}</p>
                      </div>
                    </div>
                  )}
                  {org.telephone && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Téléphone</p>
                        <p className="text-sm font-medium">{org.telephone}</p>
                      </div>
                    </div>
                  )}
                  {org.createdAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Date de création</p>
                        <p className="text-sm font-medium">{formatDate(org.createdAt)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Boutons d'actions */}
                <div className="pt-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Actions</p>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-start h-12 text-base"
                    onClick={() => onEdit(org)}
                  >
                    <Edit className="w-5 h-5 mr-3" />
                    Modifier
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-start h-12 text-base"
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
                        className="w-full justify-start h-12 text-base text-success hover:text-success hover:bg-success/10 border-success/30"
                        onClick={() => onApprove(org.id)}
                      >
                        <CheckCircle className="w-5 h-5 mr-3" />
                        Approuver
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-start h-12 text-base text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
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
                      className="w-full justify-start h-12 text-base text-orange-500 hover:text-orange-500 hover:bg-orange-500/10 border-orange-500/30"
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
                      className="w-full justify-start h-12 text-base text-success hover:text-success hover:bg-success/10 border-success/30"
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
                      className="w-full justify-start h-12 text-base text-success hover:text-success hover:bg-success/10 border-success/30"
                      onClick={() => onApprove(org.id)}
                    >
                      <CheckCircle className="w-5 h-5 mr-3" />
                      Approuver quand même
                    </Button>
                  )}

                  <div className="pt-2 mt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full justify-start h-12 text-base text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                      onClick={() => onDelete(org.id)}
                    >
                      <Trash2 className="w-5 h-5 mr-3" />
                      Supprimer
                    </Button>
                  </div>
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

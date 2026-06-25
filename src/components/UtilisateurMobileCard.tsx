import { Card, CardContent } from "@/components/ui/card";
import { UserCircle, Shield, Mail, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import CanAccess from "./CanAccess";

interface UtilisateurMobileCardProps {
  user: any;
  onEdit: (user: any) => void;
  onDelete: (id: string) => void;
  onToggleStatus?: (userId: string, newStatus: boolean) => void;
  getRoleBadgeColor: (roleName: string) => string;
}

const UtilisateurMobileCard = ({
  user,
  onEdit,
  onDelete,
  onToggleStatus,
  getRoleBadgeColor,
}: UtilisateurMobileCardProps) => {
  return (
    <Card className={`transition-shadow hover:shadow-lg overflow-hidden ${user.actif === false ? 'opacity-60' : ''}`}>
      <CardContent className="p-0">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${user.actif === false ? 'bg-muted' : 'bg-primary/10'}`}>
              <UserCircle className={`w-6 h-6 ${user.actif === false ? 'text-muted-foreground' : 'text-primary'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{user.nom}</p>
              <p className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Badge statut */}
            {user.isSuperAdmin ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                <Shield className="w-3 h-3" />
                Super Admin
              </span>
            ) : onToggleStatus ? (
              <CanAccess permissions={['users.update']}>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={user.actif === true}
                    onCheckedChange={(checked) => onToggleStatus(user.id, checked)}
                  />
                  <span className={`text-xs font-medium ${user.actif === true ? 'text-success' : 'text-muted-foreground'}`}>
                    {user.actif === true ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </CanAccess>
            ) : (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                user.actif === true
                  ? 'bg-success/15 text-success'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {user.actif === true ? 'Actif' : 'Inactif'}
              </span>
            )}
          </div>
        </div>

        {/* Rôle */}
        {user.role && (
          <div className="px-4 py-2 border-b border-border/50">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border ${getRoleBadgeColor(user.role.nom)}`}>
              <Shield className="w-3 h-3" />
              {user.role.nom}
            </span>
          </div>
        )}

        {/* Détails */}
        <div className="p-4 space-y-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-foreground truncate">{user.email}</p>
          </div>

          {user.role?.description && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Description du rôle</p>
              <p className="text-sm text-foreground">{user.role.description}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <p className="text-xs font-semibold text-muted-foreground">Permissions</p>
            <p className="text-sm font-bold text-primary">
              {user.role?.permissions?.length || 0}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-3 border-t border-border bg-card">
          <div className="flex gap-2">
            <CanAccess permissions={['users.update']}>
              <Button
                variant="outline"
                onClick={() => onEdit(user)}
                className="flex-1 h-11"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </CanAccess>
            <CanAccess permissions={['users.delete']}>
              <Button
                variant="destructive"
                onClick={() => onDelete(user.id)}
                className="flex-1 h-11"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </CanAccess>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UtilisateurMobileCard;

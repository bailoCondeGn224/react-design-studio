import { Card, CardContent } from "@/components/ui/card";
import { UserCircle, Shield, Mail, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CanAccess from "./CanAccess";

interface UtilisateurMobileCardProps {
  user: any;
  onEdit: (user: any) => void;
  onDelete: (id: string) => void;
  getRoleBadgeColor: (roleName: string) => string;
}

const UtilisateurMobileCard = ({
  user,
  onEdit,
  onDelete,
  getRoleBadgeColor,
}: UtilisateurMobileCardProps) => {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardContent className="p-0">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <UserCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{user.nom}</p>
              <p className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
            </div>
          </div>
          {user.role && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border flex-shrink-0 ${getRoleBadgeColor(user.role.nom)}`}>
              <Shield className="w-3 h-3" />
              {user.role.nom}
            </span>
          )}
        </div>

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

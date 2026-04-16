import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Shield, Users, CheckCircle, Lock } from "lucide-react";
import { useRoles } from "@/hooks/useRoles";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

const Roles = () => {
  const { data: roles = [], isLoading } = useRoles();
  const [selectedRole, setSelectedRole] = useState<any>(null);

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN':
        return 'from-red-500/20 to-red-600/20 border-red-500/50 text-red-700';
      case 'GESTIONNAIRE':
        return 'from-purple-500/20 to-purple-600/20 border-purple-500/50 text-purple-700';
      case 'VENDEUR':
        return 'from-blue-500/20 to-blue-600/20 border-blue-500/50 text-blue-700';
      case 'GESTIONNAIRE_STOCK':
        return 'from-green-500/20 to-green-600/20 border-green-500/50 text-green-700';
      case 'COMPTABLE':
        return 'from-orange-500/20 to-orange-600/20 border-orange-500/50 text-orange-700';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/50 text-gray-700';
    }
  };

  const groupPermissionsByModule = (permissions: any[]) => {
    const grouped: Record<string, any[]> = {};
    permissions.forEach(perm => {
      const module = perm.code.split('.')[0];
      if (!grouped[module]) {
        grouped[module] = [];
      }
      grouped[module].push(perm);
    });
    return grouped;
  };

  const getModuleName = (module: string) => {
    const names: Record<string, string> = {
      ventes: 'Ventes',
      stock: 'Stock',
      approvisionnements: 'Approvisionnements',
      clients: 'Clients',
      fournisseurs: 'Fournisseurs',
      finances: 'Finances',
      versements: 'Versements',
      analytics: 'Analytics',
      categories: 'Catégories',
      mouvements: 'Mouvements',
      users: 'Utilisateurs',
      roles: 'Rôles',
      permissions: 'Permissions',
    };
    return names[module] || module;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des rôles...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Rôles et Permissions"
        description="Vue d'ensemble des rôles système et leurs permissions"
      />

      <Dialog open={selectedRole !== null} onOpenChange={() => setSelectedRole(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Détails du rôle : {selectedRole?.nom}
            </DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div className="bg-secondary/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm font-medium">{selectedRole.description || 'Aucune description'}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-3">
                  Permissions ({selectedRole.permissions?.length || 0})
                </p>
                <div className="space-y-3">
                  {Object.entries(groupPermissionsByModule(selectedRole.permissions || [])).map(([module, perms]: [string, any]) => (
                    <div key={module} className="border border-border rounded-lg p-3">
                      <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">
                        {getModuleName(module)}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map((perm: any) => (
                          <div key={perm.id} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-foreground">{perm.nom}</p>
                              {perm.description && (
                                <p className="text-xs text-muted-foreground">{perm.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role: any) => (
          <div
            key={role.id}
            className={`bg-gradient-to-br ${getRoleBadgeColor(role.nom)} border rounded-xl p-6 shadow-card hover:shadow-elevated transition-all cursor-pointer`}
            onClick={() => setSelectedRole(role)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white/50 backdrop-blur-sm flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-heading">{role.nom}</h3>
                  {!role.actif && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-700">
                      Inactif
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm mb-4 opacity-80 min-h-[40px]">
              {role.description || 'Aucune description disponible'}
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 opacity-80">
                  <Lock className="w-4 h-4" />
                  Permissions
                </span>
                <span className="font-bold">{role.permissions?.length || 0}</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRole(role);
              }}
              className="mt-4 w-full py-2 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white transition-colors text-sm font-semibold"
            >
              Voir les détails
            </button>
          </div>
        ))}
      </div>

      {roles.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Aucun rôle trouvé</p>
        </div>
      )}
    </AppLayout>
  );
};

export default Roles;

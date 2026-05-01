import { Navigate, useLocation } from 'react-router-dom';
import { useIsAuthenticated, useHasPermission, useHasRole, useIsSuperAdmin, useCurrentUser } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permissions?: string[]; // Permissions requises pour accéder à la route
  roles?: string[]; // Rôles requis pour accéder à la route
  requireAll?: boolean; // Si true, toutes les permissions/rôles sont requis
  requireSuperAdmin?: boolean; // Si true, seuls les super admins peuvent accéder
}

/**
 * Composant pour protéger les routes basé sur l'authentification et les permissions
 *
 * @example
 * // Route protégée par authentification uniquement
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 *
 * @example
 * // Route protégée par permission
 * <ProtectedRoute permissions={['users.read']}>
 *   <UsersPage />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  requireSuperAdmin = false
}: ProtectedRouteProps) => {
  const isAuthenticated = useIsAuthenticated();
  const isSuperAdmin = useIsSuperAdmin();
  const hasPermission = useHasPermission(...permissions);
  const hasRole = useHasRole(...roles);
  const hasShownToast = useRef(false);
  const currentUser = useCurrentUser();
  const location = useLocation();

  // Calculer hasAccess avant tout return
  let hasAccess = false;

  // Si la route nécessite super admin
  if (requireSuperAdmin) {
    hasAccess = isSuperAdmin;
  } else if (permissions.length === 0 && roles.length === 0) {
    hasAccess = true; // Si aucune permission/rôle n'est spécifié, l'utilisateur authentifié a accès
  } else if (permissions.length > 0 && roles.length === 0) {
    hasAccess = hasPermission;
  } else if (roles.length > 0 && permissions.length === 0) {
    hasAccess = hasRole;
  } else if (permissions.length > 0 && roles.length > 0) {
    if (requireAll) {
      hasAccess = hasPermission && hasRole;
    } else {
      hasAccess = hasPermission || hasRole;
    }
  }

  // Afficher un message d'erreur si pas d'accès (useEffect toujours appelé)
  useEffect(() => {
    if (isAuthenticated && !hasAccess && !hasShownToast.current) {
      if (requireSuperAdmin) {
        toast.error('Accès réservé aux super administrateurs');
      } else if (permissions.length > 0 || roles.length > 0) {
        toast.error('Vous n\'avez pas les permissions nécessaires pour accéder à cette page');
      }
      hasShownToast.current = true;
    }
  }, [isAuthenticated, hasAccess, permissions.length, roles.length, requireSuperAdmin]);

  // Vérifications conditionnelles après tous les hooks
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier si l'utilisateur doit changer son mot de passe
  // Ne pas rediriger si on est déjà sur /change-password
  if (currentUser?.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

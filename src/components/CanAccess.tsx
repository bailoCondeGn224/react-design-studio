import { ReactNode } from 'react';
import { useHasPermission, useHasRole } from '@/hooks/useAuth';

interface CanAccessProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
  requireAll?: boolean; // Si true, toutes les permissions sont requises. Si false, une seule suffit.
  fallback?: ReactNode; // Élément à afficher si l'accès est refusé
}

/**
 * Composant pour afficher conditionnellement du contenu basé sur les permissions/rôles
 *
 * @example
 * // Afficher seulement si l'utilisateur a la permission 'ventes.create'
 * <CanAccess permissions={['ventes.create']}>
 *   <Button>Nouvelle Vente</Button>
 * </CanAccess>
 *
 * @example
 * // Afficher seulement si l'utilisateur est ADMIN ou GESTIONNAIRE
 * <CanAccess roles={['ADMIN', 'GESTIONNAIRE']}>
 *   <MenuItem>Paramètres</MenuItem>
 * </CanAccess>
 *
 * @example
 * // Avec fallback
 * <CanAccess
 *   permissions={['users.delete']}
 *   fallback={<p>Accès refusé</p>}
 * >
 *   <DeleteButton />
 * </CanAccess>
 */
const CanAccess = ({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = null
}: CanAccessProps) => {
  const hasPermission = useHasPermission(...permissions);
  const hasRole = useHasRole(...roles);

  // Si ni permissions ni rôles ne sont spécifiés, afficher le contenu
  if (permissions.length === 0 && roles.length === 0) {
    return <>{children}</>;
  }

  // Vérifier les permissions
  let hasAccess = false;

  if (permissions.length > 0 && roles.length === 0) {
    // Seulement permissions
    hasAccess = hasPermission;
  } else if (roles.length > 0 && permissions.length === 0) {
    // Seulement rôles
    hasAccess = hasRole;
  } else if (permissions.length > 0 && roles.length > 0) {
    // Permissions ET rôles
    if (requireAll) {
      hasAccess = hasPermission && hasRole;
    } else {
      hasAccess = hasPermission || hasRole;
    }
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default CanAccess;

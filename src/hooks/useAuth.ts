import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { LoginCredentials, Permission, User } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => {
      console.log('🔐 Tentative de connexion avec:', credentials);
      return authApi.login(credentials);
    },
    onSuccess: (data) => {
      console.log('✅ Connexion réussie:', data);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`Bienvenue ${data.user.nom}!`);
      navigate('/');
    },
    onError: (error: any) => {
      console.error('❌ Erreur de connexion:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      const message = error.response?.data?.message || 'Email ou mot de passe incorrect';
      toast.error(message);
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();

  return () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    toast.info('Déconnexion réussie');
    navigate('/login');
  };
};

export const useCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const useIsAuthenticated = (): boolean => {
  const token = localStorage.getItem('access_token');
  return !!token;
};

/**
 * Hook pour vérifier si l'utilisateur a une ou plusieurs permissions
 * @param requiredPermissions - Code(s) de permission à vérifier (ex: 'ventes.create')
 * @returns true si l'utilisateur a AU MOINS UNE des permissions requises
 */
export const useHasPermission = (...requiredPermissions: string[]): boolean => {
  const user = useCurrentUser();

  if (!user || !user.role || !user.role.permissions) {
    return false;
  }

  const userPermissions = user.role.permissions.map((p: Permission) => p.code);

  // L'utilisateur doit avoir au moins une des permissions requises
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

/**
 * Hook pour vérifier si l'utilisateur a un ou plusieurs rôles
 * @param requiredRoles - Nom(s) de rôle à vérifier (ex: 'ADMIN', 'GESTIONNAIRE')
 * @returns true si l'utilisateur a UN des rôles requis
 */
export const useHasRole = (...requiredRoles: string[]): boolean => {
  const user = useCurrentUser();

  if (!user || !user.role) {
    return false;
  }

  return requiredRoles.includes(user.role.nom);
};

/**
 * Hook pour obtenir toutes les permissions de l'utilisateur
 * @returns Liste des codes de permissions
 */
export const useUserPermissions = (): string[] => {
  const user = useCurrentUser();

  if (!user || !user.role || !user.role.permissions) {
    return [];
  }

  return user.role.permissions.map((p: Permission) => p.code);
};

/**
 * Hook pour obtenir le rôle de l'utilisateur
 * @returns Nom du rôle ou null
 */
export const useUserRole = (): string | null => {
  const user = useCurrentUser();
  return user?.role?.nom || null;
};

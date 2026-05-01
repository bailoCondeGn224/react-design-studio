import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Organization } from '@/types';
import { authApi } from '@/api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  organization: Organization | null;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  switchOrganization: (organization: Organization) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TOKEN: 'access_token', // Cohérent avec api-client
  USER: 'user', // Cohérent avec api-client
  ORGANIZATION: 'auth_organization',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  });

  const [organization, setOrganization] = useState<Organization | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ORGANIZATION);
    return stored ? JSON.parse(stored) : null;
  });

  // Calculer isSuperAdmin basé sur le user
  const isSuperAdmin = user?.isSuperAdmin ?? false;
  const isAuthenticated = !!user && !!token;

  // Persister les données dans localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  }, [token]);

  useEffect(() => {
    if (organization) {
      localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(organization));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ORGANIZATION);
    }
  }, [organization]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      setToken(response.access_token);
      setUser(response.user);

      // Si l'utilisateur n'est pas super admin, set son organization
      if (!response.user.isSuperAdmin && response.user.organization) {
        setOrganization(response.user.organization);
      } else {
        setOrganization(null);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setOrganization(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ORGANIZATION);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);

    // Mettre à jour l'organization si elle a changé
    if (!updatedUser.isSuperAdmin && updatedUser.organization) {
      setOrganization(updatedUser.organization);
    } else {
      setOrganization(null);
    }
  };

  const switchOrganization = (newOrganization: Organization) => {
    // Seulement pour SUPER_ADMIN
    if (!isSuperAdmin) {
      console.warn('Only SUPER_ADMIN can switch organizations');
      return;
    }
    setOrganization(newOrganization);
  };

  const checkAuth = async () => {
    if (!token) {
      logout();
      return;
    }

    try {
      const profile = await authApi.getProfile();
      setUser(profile);

      if (!profile.isSuperAdmin && profile.organization) {
        setOrganization(profile.organization);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    }
  };

  // Vérifier l'auth au montage
  useEffect(() => {
    if (token && !user) {
      checkAuth();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        organization,
        isSuperAdmin,
        isAuthenticated,
        login,
        logout,
        updateUser,
        switchOrganization,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook principal
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook pour accéder à l'organization
export const useOrganization = () => {
  const { organization } = useAuth();
  return organization;
};

// Hook pour vérifier si super admin
export const useIsSuperAdmin = () => {
  const { isSuperAdmin } = useAuth();
  return isSuperAdmin;
};

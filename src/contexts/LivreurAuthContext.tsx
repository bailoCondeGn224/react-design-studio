// src/contexts/LivreurAuthContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Livreur } from '@/types';

interface LivreurAuthContextType {
  livreur: Livreur | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (telephone: string, password: string, storeSlug: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const LivreurAuthContext = createContext<LivreurAuthContextType | undefined>(undefined);

const LIVREUR_TOKEN_KEY = 'livreur_token';
const LIVREUR_DATA_KEY = 'livreur_data';

export const LivreurAuthProvider = ({ children }: { children?: ReactNode }) => {
  const [livreur, setLivreur] = useState<Livreur | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger le livreur depuis le localStorage au démarrage
  useEffect(() => {
    const token = localStorage.getItem(LIVREUR_TOKEN_KEY);
    const savedLivreur = localStorage.getItem(LIVREUR_DATA_KEY);

    if (token && savedLivreur) {
      try {
        setLivreur(JSON.parse(savedLivreur));
      } catch {
        localStorage.removeItem(LIVREUR_TOKEN_KEY);
        localStorage.removeItem(LIVREUR_DATA_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (telephone: string, password: string, storeSlug: string) => {
    const { data } = await apiClient.post<{ token: string; livreur: Livreur }>(
      '/public/livreurs/login',
      { telephone, password, storeSlug }
    );

    localStorage.setItem(LIVREUR_TOKEN_KEY, data.token);
    localStorage.setItem(LIVREUR_DATA_KEY, JSON.stringify(data.livreur));
    setLivreur(data.livreur);
  };

  const logout = useCallback(() => {
    localStorage.removeItem(LIVREUR_TOKEN_KEY);
    localStorage.removeItem(LIVREUR_DATA_KEY);
    setLivreur(null);
  }, []);

  const refreshProfile = async () => {
    const token = localStorage.getItem(LIVREUR_TOKEN_KEY);
    if (!token) return;

    try {
      const { data } = await apiClient.get<Livreur>('/livreur/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem(LIVREUR_DATA_KEY, JSON.stringify(data));
      setLivreur(data);
    } catch {
      logout();
    }
  };

  return (
    <LivreurAuthContext.Provider
      value={{
        livreur,
        isAuthenticated: !!livreur,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children ?? <Outlet />}
    </LivreurAuthContext.Provider>
  );
};

export const useLivreurAuth = () => {
  const context = useContext(LivreurAuthContext);
  if (!context) {
    throw new Error('useLivreurAuth must be used within LivreurAuthProvider');
  }
  return context;
};

// Hook pour les appels API authentifiés livreur
export const useLivreurApi = () => {
  const getToken = () => localStorage.getItem(LIVREUR_TOKEN_KEY);

  const authFetch = async <T,>(url: string, options: RequestInit = {}): Promise<T> => {
    const token = getToken();
    const response = await apiClient.request<T>({
      url,
      ...options,
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    return response.data;
  };

  return { authFetch, getToken };
};

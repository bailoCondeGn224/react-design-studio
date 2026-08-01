import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { apiClient } from '@/lib/api-client';
import { LivreurLoginDto, LivreurAuthResponse } from '@/types/livreur';

interface LivreurAuthContextType {
  livreur: LivreurAuthResponse['livreur'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LivreurLoginDto) => Promise<void>;
  logout: () => void;
}

const LivreurAuthContext = createContext<LivreurAuthContextType | null>(null);

const STORAGE_KEY = 'livreur_token';
const LIVREUR_KEY = 'livreur_data';

export const LivreurAuthProvider = ({ children }: { children: ReactNode }) => {
  const [livreur, setLivreur] = useState<LivreurAuthResponse['livreur'] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    const savedLivreur = localStorage.getItem(LIVREUR_KEY);
    if (token && savedLivreur) {
      setLivreur(JSON.parse(savedLivreur));
    }
    setIsLoading(false);
  }, []);

  const login = async (dto: LivreurLoginDto) => {
    const res = await apiClient.post<LivreurAuthResponse>(
      '/public/livreur/login',
      dto,
    );
    localStorage.setItem(STORAGE_KEY, res.data.access_token);
    localStorage.setItem(LIVREUR_KEY, JSON.stringify(res.data.livreur));
    setLivreur(res.data.livreur);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LIVREUR_KEY);
    setLivreur(null);
  };

  return (
    <LivreurAuthContext.Provider
      value={{
        livreur,
        isAuthenticated: !!livreur,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </LivreurAuthContext.Provider>
  );
};

export const useLivreurAuth = () => {
  const ctx = useContext(LivreurAuthContext);
  if (!ctx)
    throw new Error('useLivreurAuth must be used within LivreurAuthProvider');
  return ctx;
};

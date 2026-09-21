import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Outlet } from 'react-router-dom';
import { livreurApi } from '@/api/livreur';
import {
  LIVREUR_AUTH_REQUIRED_EVENT,
  LIVREUR_STORAGE_KEYS,
} from '@/lib/livreur-api-client';
import { LivreurLoginDto, LivreurAuthResponse } from '@/types/livreur';

type LivreurSession = LivreurAuthResponse['livreur'];

interface LivreurAuthContextType {
  livreur: LivreurSession | null;
  isAuthenticated: boolean;
  login: (dto: LivreurLoginDto) => Promise<void>;
  logout: () => void;
}

const LivreurAuthContext = createContext<LivreurAuthContextType | null>(null);

// Lecture synchrone : la session doit être connue dès le premier rendu, sinon
// la route protégée redirige vers la connexion avant qu'elle soit restaurée.
const readStoredSession = (): LivreurSession | null => {
  if (!localStorage.getItem(LIVREUR_STORAGE_KEYS.TOKEN)) return null;
  try {
    const stored = localStorage.getItem(LIVREUR_STORAGE_KEYS.LIVREUR);
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem(LIVREUR_STORAGE_KEYS.LIVREUR);
    return null;
  }
};

export const LivreurAuthProvider = ({ children }: { children?: ReactNode }) => {
  const [livreur, setLivreur] = useState<LivreurSession | null>(readStoredSession);

  // Session expirée côté serveur (401 intercepté par livreurApiClient)
  useEffect(() => {
    const handleExpired = () => setLivreur(null);
    window.addEventListener(LIVREUR_AUTH_REQUIRED_EVENT, handleExpired);
    return () => window.removeEventListener(LIVREUR_AUTH_REQUIRED_EVENT, handleExpired);
  }, []);

  const login = async (dto: LivreurLoginDto) => {
    const data = await livreurApi.login(dto);
    localStorage.setItem(LIVREUR_STORAGE_KEYS.TOKEN, data.access_token);
    localStorage.setItem(LIVREUR_STORAGE_KEYS.LIVREUR, JSON.stringify(data.livreur));
    setLivreur(data.livreur);
  };

  const logout = () => {
    localStorage.removeItem(LIVREUR_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(LIVREUR_STORAGE_KEYS.LIVREUR);
    setLivreur(null);
  };

  return (
    <LivreurAuthContext.Provider
      value={{
        livreur,
        isAuthenticated: !!livreur,
        login,
        logout,
      }}
    >
      {children ?? <Outlet />}
    </LivreurAuthContext.Provider>
  );
};

export const useLivreurAuth = () => {
  const ctx = useContext(LivreurAuthContext);
  if (!ctx)
    throw new Error('useLivreurAuth must be used within LivreurAuthProvider');
  return ctx;
};

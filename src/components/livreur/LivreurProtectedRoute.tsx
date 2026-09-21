import { Navigate, useParams } from 'react-router-dom';
import { useLivreurAuth } from '@/contexts/LivreurAuthContext';

interface LivreurProtectedRouteProps {
  children: React.ReactNode;
}

export const LivreurProtectedRoute = ({ children }: LivreurProtectedRouteProps) => {
  const { isAuthenticated } = useLivreurAuth();
  const { slug } = useParams<{ slug: string }>();

  if (!isAuthenticated) {
    return <Navigate to={`/b/${slug}/livreur`} replace />;
  }

  return <>{children}</>;
};

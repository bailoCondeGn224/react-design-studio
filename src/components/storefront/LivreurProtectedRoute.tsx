// src/components/storefront/LivreurProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useLivreurAuth } from '@/contexts/LivreurAuthContext';
import { Loader2 } from 'lucide-react';

interface LivreurProtectedRouteProps {
  children: ReactNode;
}

export const LivreurProtectedRoute = ({ children }: LivreurProtectedRouteProps) => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, isLoading } = useLivreurAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/b/${slug}/livreur`} replace />;
  }

  return <>{children}</>;
};

// src/components/customer/CustomerProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { Loader2 } from 'lucide-react';

interface CustomerProtectedRouteProps {
  children: ReactNode;
}

export const CustomerProtectedRoute = ({ children }: CustomerProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useCustomerAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/customer/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

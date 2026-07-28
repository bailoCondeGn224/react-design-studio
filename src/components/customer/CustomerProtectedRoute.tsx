// src/components/customer/CustomerProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { CustomerAuthModal } from '@/components/storefront/CustomerAuthModal';

interface CustomerProtectedRouteProps {
  children: React.ReactNode;
}

export const CustomerProtectedRoute = ({ children }: CustomerProtectedRouteProps) => {
  const { isAuthenticated } = useCustomerAuth();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      // Rediriger vers home de la vitrine
      navigate(`/storefront/${slug}`);
      // Ouvrir modal d'authentification
      setAuthModalOpen(true);
    }
  }, [isAuthenticated, slug, navigate]);

  if (!isAuthenticated) {
    return (
      <CustomerAuthModal
        open={authModalOpen}
        onOpenChange={(open) => {
          setAuthModalOpen(open);
          if (!open) {
            // Si l'utilisateur ferme la modal sans se connecter, rester sur la home
            navigate(`/storefront/${slug}`);
          }
        }}
      />
    );
  }

  return <>{children}</>;
};

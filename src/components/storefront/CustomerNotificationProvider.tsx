// src/components/storefront/CustomerNotificationProvider.tsx
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useCustomerNotifications } from '@/hooks/useCustomerNotifications';

interface CustomerNotificationProviderProps {
  children: React.ReactNode;
}

export const CustomerNotificationProvider = ({ children }: CustomerNotificationProviderProps) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useCustomerAuth();

  // Initialiser le polling des notifications (désactivé automatiquement si non connecté)
  useCustomerNotifications();

  // Écouter les événements de navigation depuis les toasts
  useEffect(() => {
    const handleNavigateToOrder = (event: CustomEvent) => {
      const { orderId } = event.detail;
      if (slug && orderId) {
        navigate(`/b/${slug}/orders/${orderId}`);
      }
    };

    window.addEventListener('navigate-to-order', handleNavigateToOrder as EventListener);

    return () => {
      window.removeEventListener('navigate-to-order', handleNavigateToOrder as EventListener);
    };
  }, [slug, navigate]);

  return <>{children}</>;
};

// src/pages/customer/CustomerOrders.tsx
import { useNavigate } from 'react-router-dom';
import { useCustomerOrders } from '@/hooks/useOnlineOrders';
import { CustomerOrderMobileCard } from '@/components/customer/CustomerOrderMobileCard';
import { CustomerNavbar } from '@/components/customer/CustomerNavbar';
import { Button } from '@/components/ui/button';
import { Loader2, Package, LogOut } from 'lucide-react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const CustomerOrders = () => {
  const navigate = useNavigate();
  const { logout } = useCustomerAuth();
  const { data, isLoading } = useCustomerOrders();

  const orders = data?.data || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-bold">Mes commandes</h1>
          <Button variant="ghost" size="icon" onClick={() => { logout(); navigate('/'); }}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Aucune commande pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <CustomerOrderMobileCard
                key={order.id}
                order={order}
                onViewDetails={() => navigate(`/customer/orders/${order.id}`)}
                formatPrix={formatPrix}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>

      <CustomerNavbar />
    </div>
  );
};

export default CustomerOrders;

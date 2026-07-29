// src/components/storefront/StorefrontHeader.tsx
import { useState } from 'react';
import { User, ShoppingCart, MapPin, Clock, Phone, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoreFront } from '@/types';
import { getPhotoUrl } from '@/lib/api-client';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { CustomerAuthModal } from './CustomerAuthModal';
import { CustomerAccountMenu } from './CustomerAccountMenu';
import { NotificationBell } from './NotificationBell';

interface StorefrontHeaderProps {
  storefront: StoreFront;
  cartCount: number;
  onCartClick: () => void;
}

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

export const StorefrontHeader = ({ storefront, cartCount, onCartClick }: StorefrontHeaderProps) => {
  const logoUrl = storefront.logoUrl ? getPhotoUrl(storefront.logoUrl) : null;
  const { isAuthenticated } = useCustomerAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Header principal avec logo et panier */}
      <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-primary/5 to-primary/10">
        {/* Account Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => {
            if (isAuthenticated) {
              setAccountMenuOpen(true);
            } else {
              setAuthModalOpen(true);
            }
          }}
        >
          <User className="h-5 w-5" />
        </Button>

        {/* Nom de la boutique */}
        <div className="flex-1 flex items-center justify-center px-2">
          <h1 className="text-base font-bold text-gray-900 truncate max-w-[220px]">
            {storefront.organizationNom}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Notifications (seulement si connecté) */}
          {isAuthenticated && <NotificationBell />}

          {/* Panier */}
          <Button variant="ghost" size="icon" className="h-10 w-10 relative" onClick={onCartClick}>
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Barre d'informations rapides sous le header */}
      <div className="bg-white border-t border-gray-100">
        <div className="px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto">
          {/* Horaires */}
          {storefront.horaires && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md shrink-0">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-[10px] text-gray-600 font-medium whitespace-nowrap">{storefront.horaires}</span>
            </div>
          )}

          {/* Adresse */}
          {storefront.adresse && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md shrink-0">
              <MapPin className="w-3 h-3 text-gray-500" />
              <span className="text-[10px] text-gray-600 font-medium truncate max-w-[120px]">{storefront.adresse}</span>
            </div>
          )}

          {/* Livraison */}
          {storefront.fraisLivraison !== undefined && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-md shrink-0 ml-auto">
              <Truck className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-primary font-bold whitespace-nowrap">
                {storefront.fraisLivraison === 0 ? 'Livraison gratuite' : `Livraison: ${formatPrix(storefront.fraisLivraison)}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modals/Menus */}
      <CustomerAuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
      />

      <CustomerAccountMenu
        open={accountMenuOpen}
        onOpenChange={setAccountMenuOpen}
        storefront={storefront}
      />
    </header>
  );
};

// src/components/storefront/StorefrontHeader.tsx
import { Menu, ShoppingCart, Store, MapPin, Clock, Phone, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { StoreFront } from '@/types';
import { getPhotoUrl } from '@/lib/api-client';

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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Header principal avec logo et panier */}
      <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-primary/5 to-primary/10">
        {/* Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px]">
            <div className="space-y-4">
              {/* Nom de la boutique */}
              <div className="pb-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {storefront.organizationNom}
                </h2>
              </div>

              {storefront.description && (
                <div>
                  <p className="text-sm font-medium mb-1">À propos</p>
                  <p className="text-sm text-muted-foreground">{storefront.description}</p>
                </div>
              )}
              {storefront.horaires && (
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Horaires</p>
                    <p className="text-sm text-muted-foreground">{storefront.horaires}</p>
                  </div>
                </div>
              )}
              {storefront.adresse && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Adresse</p>
                    <p className="text-sm text-muted-foreground">{storefront.adresse}</p>
                  </div>
                </div>
              )}
              {storefront.fraisLivraison !== undefined && (
                <div className="flex items-start gap-2">
                  <Truck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Frais de livraison</p>
                    <p className="text-sm text-muted-foreground">
                      {storefront.fraisLivraison === 0 ? 'Gratuit' : formatPrix(storefront.fraisLivraison)}
                    </p>
                  </div>
                </div>
              )}
              {storefront.whatsappNumber && (
                <Button
                  variant="default"
                  className="w-full gap-2"
                  onClick={() => window.open(`https://wa.me/${storefront.whatsappNumber}`, '_blank')}
                >
                  <Phone className="w-4 h-4" />
                  Nous contacter
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Nom de la boutique */}
        <div className="flex-1 flex items-center justify-center px-2">
          <h1 className="text-base font-bold text-gray-900 truncate max-w-[220px]">
            {storefront.organizationNom}
          </h1>
        </div>

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
    </header>
  );
};

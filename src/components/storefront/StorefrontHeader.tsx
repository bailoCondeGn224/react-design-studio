// src/components/storefront/StorefrontHeader.tsx
import { Menu, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { StoreFront } from '@/types';

interface StorefrontHeaderProps {
  storefront: StoreFront;
  cartCount: number;
  onCartClick: () => void;
}

export const StorefrontHeader = ({ storefront, cartCount, onCartClick }: StorefrontHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px]">
            <SheetHeader>
              <SheetTitle>{storefront.organizationName}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {storefront.description && (
                <p className="text-sm text-muted-foreground">{storefront.description}</p>
              )}
              {storefront.horaires && (
                <div>
                  <p className="text-sm font-medium">Horaires</p>
                  <p className="text-sm text-muted-foreground">{storefront.horaires}</p>
                </div>
              )}
              {storefront.adresse && (
                <div>
                  <p className="text-sm font-medium">Adresse</p>
                  <p className="text-sm text-muted-foreground">{storefront.adresse}</p>
                </div>
              )}
              {storefront.whatsappNumber && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(`https://wa.me/${storefront.whatsappNumber}`, '_blank')}
                >
                  Nous contacter
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo/Nom */}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold truncate">{storefront.organizationName}</h1>
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
    </header>
  );
};

// src/components/storefront/CustomerAccountMenu.tsx
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useCartContext } from '@/contexts/CartContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Package,
  Clock,
  MapPin,
  Truck,
  Phone,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { StoreFront } from '@/types';

interface CustomerAccountMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storefront: StoreFront;
}

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

export const CustomerAccountMenu = ({
  open,
  onOpenChange,
  storefront
}: CustomerAccountMenuProps) => {
  const { customer, logout } = useCustomerAuth();
  const { clear } = useCartContext();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const handleLogout = () => {
    // Vider le panier pour éviter confusion entre comptes
    clear();
    // Déconnecter
    logout();
    // Toast
    toast.info('Déconnexion réussie');
    // Fermer le menu
    onOpenChange(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  if (!customer) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px]">
        <SheetHeader className="pb-4">
          <SheetTitle>Mon compte</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{customer.nom}</p>
              <p className="text-sm text-muted-foreground truncate">{customer.telephone}</p>
            </div>
          </div>

          <Separator />

          {/* Menu Options */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleNavigation(`/storefront/${slug}/orders`)}
            >
              <Package className="mr-2 h-4 w-4" />
              Mes commandes
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleNavigation(`/storefront/${slug}/profile`)}
            >
              <User className="mr-2 h-4 w-4" />
              Mon profil
            </Button>
          </div>

          <Separator />

          {/* Store Info */}
          <div>
            <p className="text-sm font-medium mb-2 text-muted-foreground">Infos boutique</p>
            <div className="space-y-2">
              {storefront.horaires && (
                <div className="flex items-start gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Horaires</p>
                    <p className="text-muted-foreground">{storefront.horaires}</p>
                  </div>
                </div>
              )}

              {storefront.adresse && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Adresse</p>
                    <p className="text-muted-foreground">{storefront.adresse}</p>
                  </div>
                </div>
              )}

              {storefront.fraisLivraison !== undefined && (
                <div className="flex items-start gap-2 text-sm">
                  <Truck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Frais de livraison</p>
                    <p className="text-muted-foreground">
                      {storefront.fraisLivraison === 0 ? 'Gratuit' : formatPrix(storefront.fraisLivraison)}
                    </p>
                  </div>
                </div>
              )}

              {storefront.whatsappNumber && (
                <Button
                  variant="default"
                  className="w-full gap-2 mt-2"
                  onClick={() => window.open(`https://wa.me/${storefront.whatsappNumber}`, '_blank')}
                >
                  <Phone className="w-4 h-4" />
                  Nous contacter
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Logout */}
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

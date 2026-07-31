// src/components/storefront/BottomNav.tsx
import { Home, ShoppingBag, Package, User, Truck } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useCartContext } from '@/contexts/CartContext';
import { useCartDrawer } from '@/contexts/CartDrawerContext';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useCustomerAuth();
  const { itemCount } = useCartContext();
  const { openCart, isOpen: isCartOpen } = useCartDrawer();

  const navItems = [
    {
      icon: Home,
      label: 'Accueil',
      path: `/b/${slug}`,
      active: location.pathname === `/b/${slug}`,
    },
    {
      icon: ShoppingBag,
      label: 'Panier',
      path: '#',
      active: isCartOpen,
      badge: itemCount > 0 ? itemCount : undefined,
      isCart: true,
    },
    {
      icon: Package,
      label: 'Commandes',
      path: `/b/${slug}/orders`,
      active: location.pathname.startsWith(`/b/${slug}/orders`),
      requiresAuth: true,
    },
    {
      icon: Truck,
      label: 'Livreur',
      path: `/b/${slug}/livreur`,
      active: location.pathname.startsWith(`/b/${slug}/livreur`),
    },
    {
      icon: User,
      label: 'Compte',
      path: isAuthenticated ? `/b/${slug}/profile` : '#',
      active: location.pathname === `/b/${slug}/profile`,
      requiresAuth: true,
    },
  ];

  const handleNavClick = (item: typeof navItems[0] & { isCart?: boolean }) => {
    // Si c'est le panier, ouvrir le CartDrawer
    if (item.isCart) {
      openCart();
      return;
    }

    if (item.requiresAuth && !isAuthenticated) {
      // Déclencher l'ouverture du modal d'authentification
      window.dispatchEvent(new CustomEvent('customer-auth-required'));
      return;
    }
    navigate(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-40 shadow-elevated md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 relative ${
                isActive
                  ? 'text-primary'
                  : 'text-gray-500 active:text-primary active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 bg-primary text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-all ${
                  isActive ? 'font-semibold' : ''
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

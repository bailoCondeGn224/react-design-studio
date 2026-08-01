// src/components/storefront/BottomNav.tsx
import { Home, ShoppingBag, Package, User } from 'lucide-react';
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

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path || location.pathname === `${path}/`;
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      icon: Home,
      label: 'Accueil',
      path: `/b/${slug}`,
      active: isActive(`/b/${slug}`, true),
    },
    {
      icon: ShoppingBag,
      label: 'Panier',
      path: '#cart',
      active: isCartOpen,
      badge: itemCount > 0 ? itemCount : undefined,
      isCart: true,
    },
    {
      icon: Package,
      label: 'Commandes',
      path: `/b/${slug}/orders`,
      active: isActive(`/b/${slug}/orders`),
      requiresAuth: true,
    },
    {
      icon: User,
      label: 'Compte',
      path: `/b/${slug}/profile`,
      active: isActive(`/b/${slug}/profile`),
      requiresAuth: true,
    },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.isCart) {
      openCart();
      return;
    }

    if (item.requiresAuth && !isAuthenticated) {
      window.dispatchEvent(new CustomEvent('customer-auth-required'));
      return;
    }

    navigate(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-inset-bottom">
      {/* Background */}
      <div className="absolute inset-0 bg-white border-t border-border shadow-elevated" />

      <div className="relative grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className="relative flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95"
            >
              {/* Indicateur actif en haut */}
              {item.active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary rounded-b-full" />
              )}

              {/* Conteneur icône */}
              <div className="relative">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 ${
                    item.active ? 'bg-primary/10' : ''
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors duration-200 ${
                      item.active ? 'text-primary' : 'text-muted-foreground'
                    }`}
                    strokeWidth={item.active ? 2.5 : 2}
                  />
                </div>

                {/* Badge panier */}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] transition-colors duration-200 ${
                  item.active
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

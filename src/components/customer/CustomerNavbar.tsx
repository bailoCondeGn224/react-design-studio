// src/components/customer/CustomerNavbar.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { Package, User } from 'lucide-react';

const navItems = [
  { path: '/customer/orders', icon: Package, label: 'Commandes' },
  { path: '/customer/profile', icon: User, label: 'Profil' },
];

export const CustomerNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t safe-area-pb z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

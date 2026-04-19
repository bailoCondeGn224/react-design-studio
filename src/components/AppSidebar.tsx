import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, UserCheck, Package, FolderTree, MapPin, Truck, ShoppingCart, Wallet,
  ChevronLeft, ChevronRight, Sparkles, ArrowDownRight, ArrowDownLeft, Menu, LogOut, History, BarChart3,
  Shield, UserCog, Settings
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useLogout, useCurrentUser } from "@/hooks/useAuth";
import { useParametres } from "@/hooks/useParametres";
import { parametresApi } from "@/api/parametres";
import CanAccess from "@/components/CanAccess";
import { useSidebar } from "@/contexts/SidebarContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Tableau de Bord", permissions: [] }, // Accessible à tous
  { to: "/analytics", icon: BarChart3, label: "Analytics", permissions: ["analytics.read"] },
  { to: "/fournisseurs", icon: Users, label: "Fournisseurs", permissions: ["fournisseurs.read"] },
  { to: "/clients", icon: UserCheck, label: "Clients", permissions: ["clients.read"] },
  { to: "/stock", icon: Package, label: "Stock", permissions: ["stock.read"] },
  { to: "/categories", icon: FolderTree, label: "Catégories", permissions: ["categories.read"] },
  { to: "/zones", icon: MapPin, label: "Zones", permissions: [] },
  { to: "/approvisionnements", icon: Truck, label: "Approvisionnements", permissions: ["approvisionnements.read"] },
  { to: "/ventes", icon: ShoppingCart, label: "Ventes", permissions: ["ventes.read"] },
  { to: "/versements", icon: ArrowDownRight, label: "Versements", permissions: ["versements.read"] },
  { to: "/versements-client", icon: ArrowDownLeft, label: "Paiements Clients", permissions: ["versements-client.read"] },
  { to: "/mouvements-stock", icon: History, label: "Historique Mouvements", permissions: ["mouvements.read"] },
  { to: "/finances", icon: Wallet, label: "Finances", permissions: ["finances.read"] },
  { to: "/utilisateurs", icon: UserCog, label: "Utilisateurs", permissions: ["users.read"] },
  { to: "/roles", icon: Shield, label: "Rôles & Permissions", permissions: ["roles.read"] },
  { to: "/parametres", icon: Settings, label: "Paramètres", permissions: ["parametres.read"] },
];

const SidebarContent = ({ collapsed, setCollapsed, onItemClick }: { collapsed: boolean; setCollapsed: (v: boolean) => void; onItemClick?: () => void }) => {
  const location = useLocation();
  const logout = useLogout();
  const user = useCurrentUser();
  const { data: parametres } = useParametres();

  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
        {parametres?.logo ? (
          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 bg-sidebar-accent/30">
            <img
              src={parametresApi.getLogoUrl()}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-lg gradient-gold flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
        )}
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="font-heading text-base font-semibold text-sidebar-accent-foreground">
              {parametres?.nomCourt || 'Walli'}
            </h1>
            <p className="text-[11px] text-sidebar-foreground/60 leading-tight">
              {parametres?.slogan || 'Mode & Tradition'}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 sidebar-scroll">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <CanAccess key={item.to} permissions={item.permissions}>
              <NavLink
                to={item.to}
                onClick={onItemClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
                  }`}
                />
                {!collapsed && <span className="animate-fade-in">{item.label}</span>}
              </NavLink>
            </CanAccess>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="mx-3 mb-3 space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2 rounded-lg bg-sidebar-accent/30">
            <p className="text-xs font-semibold text-sidebar-accent-foreground truncate">{user.nom}</p>
            <p className="text-[10px] text-sidebar-foreground/60 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>

      {/* Collapse Button - Desktop Only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-3 mb-4 p-2.5 rounded-lg border border-sidebar-border text-sidebar-foreground/50 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-colors hidden md:flex items-center justify-center"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );
};

const AppSidebar = () => {
  const { collapsed, setCollapsed } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-foreground hover:bg-secondary transition-colors shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar - Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[260px] p-0 bg-sidebar border-sidebar-border">
          <SidebarContent
            collapsed={false}
            setCollapsed={() => {}}
            onItemClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar - Fixed */}
      <aside
        className={`hidden md:flex fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 z-50 flex-col ${
          collapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>
    </>
  );
};

export default AppSidebar;

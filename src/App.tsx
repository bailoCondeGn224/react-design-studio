import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import DynamicFavicon from "./components/DynamicFavicon.tsx";
import LoadingFallback from "./components/LoadingFallback.tsx";
import { SidebarProvider } from "./contexts/SidebarContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CustomerAuthProvider } from "./contexts/CustomerAuthContext";
import { CustomerProtectedRoute } from "./components/customer/CustomerProtectedRoute";
import { LivreurAuthProvider } from "./contexts/LivreurAuthContext";
import { LivreurProtectedRoute } from "./components/storefront/LivreurProtectedRoute";
import { InstallPWA } from "./components/InstallPWA";
import { PWAUpdateNotification, OfflineIndicator } from "./components/PWAUpdateNotification";

// Lazy load all pages for code splitting and better performance
const Login = lazy(() => import("./pages/Login.tsx"));
const Register = lazy(() => import("./pages/Register.tsx"));
const ChangePassword = lazy(() => import("./pages/ChangePassword.tsx"));
const Index = lazy(() => import("./pages/Index.tsx"));
const Fournisseurs = lazy(() => import("./pages/Fournisseurs.tsx"));
const Clients = lazy(() => import("./pages/Clients.tsx"));
const Stock = lazy(() => import("./pages/Stock.tsx"));
const Categories = lazy(() => import("./pages/Categories.tsx"));
const Zones = lazy(() => import("./pages/Zones.tsx"));
const Approvisionnements = lazy(() => import("./pages/Approvisionnements.tsx"));
const Ventes = lazy(() => import("./pages/Ventes.tsx"));
const Commandes = lazy(() => import("./pages/Commandes.tsx"));
const Versements = lazy(() => import("./pages/Versements.tsx"));
const VersementsClient = lazy(() => import("./pages/VersementsClient.tsx"));
const RetoursClients = lazy(() => import("./pages/RetoursClients.tsx"));
const RetoursFournisseurs = lazy(() => import("./pages/RetoursFournisseurs.tsx"));
const MouvementsStock = lazy(() => import("./pages/MouvementsStock.tsx"));
const Inventaires = lazy(() => import("./pages/Inventaires.tsx"));
const InventaireDetail = lazy(() => import("./pages/InventaireDetail.tsx"));
const Depenses = lazy(() => import("./pages/Depenses.tsx"));
const Analytics = lazy(() => import("./pages/Analytics.tsx"));
const Utilisateurs = lazy(() => import("./pages/Utilisateurs.tsx"));
const Roles = lazy(() => import("./pages/Roles.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
// Pages Super Admin (SUPER_ADMIN only)
const SuperAdminDashboard = lazy(() => import("./pages/admin/SuperAdminDashboard.tsx"));
const Organizations = lazy(() => import("./pages/admin/Organizations.tsx"));
const Plans = lazy(() => import("./pages/admin/Plans.tsx"));
// Page Admin Dashboard (pour role ADMIN)
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
// Pages Zakat
const Zakat = lazy(() => import("./pages/Zakat.tsx"));
const ZakatSettings = lazy(() => import("./pages/ZakatSettings.tsx"));
// Page Online Orders (back-office)
const OnlineOrders = lazy(() => import("./pages/OnlineOrders.tsx"));
// Page Livreurs (back-office)
const Livreurs = lazy(() => import("./pages/Livreurs.tsx"));
// Page Storefront Settings (back-office)
const StorefrontSettings = lazy(() => import("./pages/StorefrontSettings.tsx"));
// Storefront pages (public)
const StorefrontHome = lazy(() => import("./pages/storefront/StorefrontHome.tsx"));
const StorefrontProduct = lazy(() => import("./pages/storefront/StorefrontProduct.tsx"));
const StorefrontCart = lazy(() => import("./pages/storefront/StorefrontCart.tsx"));
const StorefrontCheckout = lazy(() => import("./pages/storefront/StorefrontCheckout.tsx"));
const StorefrontOrders = lazy(() => import("./pages/storefront/StorefrontOrders.tsx"));
const StorefrontOrderDetail = lazy(() => import("./pages/storefront/StorefrontOrderDetail.tsx"));
const StorefrontProfile = lazy(() => import("./pages/storefront/StorefrontProfile.tsx"));
// Customer pages
const CustomerLogin = lazy(() => import("./pages/customer/CustomerLogin.tsx"));
const CustomerRegister = lazy(() => import("./pages/customer/CustomerRegister.tsx"));
const CustomerOrders = lazy(() => import("./pages/customer/CustomerOrders.tsx"));
const CustomerOrderDetail = lazy(() => import("./pages/customer/CustomerOrderDetail.tsx"));
const CustomerProfile = lazy(() => import("./pages/customer/CustomerProfile.tsx"));
// Livreur pages
const LivreurLogin = lazy(() => import("./pages/storefront/LivreurLogin.tsx"));
const LivreurDashboard = lazy(() => import("./pages/storefront/LivreurDashboard.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 secondes - données considérées fraîches
      gcTime: 5 * 60 * 1000, // 5 minutes - cache en mémoire
      refetchOnWindowFocus: false, // Ne pas refetch au focus de fenêtre
      refetchOnMount: true, // Refetch au montage pour données fraîches
      retry: 1, // Réessayer 1 fois en cas d'erreur
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SidebarProvider>
        <TooltipProvider>
          <DynamicFavicon />
          <Toaster />
          <Sonner />
          <InstallPWA />
          <PWAUpdateNotification />
          <OfflineIndicator />
          <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fournisseurs"
                element={
                  <ProtectedRoute permissions={['fournisseurs.read']}>
                    <Fournisseurs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients"
                element={
                  <ProtectedRoute permissions={['clients.read']}>
                    <Clients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stock"
                element={
                  <ProtectedRoute permissions={['stock.read']}>
                    <Stock />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute permissions={['categories.read']}>
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/zones"
                element={
                  <ProtectedRoute>
                    <Zones />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/approvisionnements"
                element={
                  <ProtectedRoute permissions={['approvisionnements.read']}>
                    <Approvisionnements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ventes"
                element={
                  <ProtectedRoute permissions={['ventes.read']}>
                    <Ventes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/commandes"
                element={
                  <ProtectedRoute permissions={['commandes.read']}>
                    <Commandes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/versements"
                element={
                  <ProtectedRoute permissions={['versements.read']}>
                    <Versements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/versements-client"
                element={
                  <ProtectedRoute permissions={['versements-client.read']}>
                    <VersementsClient />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/retours-clients"
                element={
                  <ProtectedRoute permissions={['retours.create']}>
                    <RetoursClients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/retours-fournisseurs"
                element={
                  <ProtectedRoute permissions={['retours.create']}>
                    <RetoursFournisseurs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mouvements-stock"
                element={
                  <ProtectedRoute permissions={['mouvements.read']}>
                    <MouvementsStock />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventaires"
                element={
                  <ProtectedRoute permissions={['stock.read']}>
                    <Inventaires />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventaires/:id"
                element={
                  <ProtectedRoute permissions={['stock.read']}>
                    <InventaireDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/depenses"
                element={
                  <ProtectedRoute permissions={['depenses.read']}>
                    <Depenses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute permissions={['analytics.read']}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/utilisateurs"
                element={
                  <ProtectedRoute permissions={['users.read']}>
                    <Utilisateurs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/roles"
                element={
                  <ProtectedRoute permissions={['roles.read']}>
                    <Roles />
                  </ProtectedRoute>
                }
              />
              {/* Routes Super Admin (SUPER_ADMIN only) */}
              <Route
                path="/super-admin/dashboard"
                element={
                  <ProtectedRoute requireSuperAdmin>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/organizations"
                element={
                  <ProtectedRoute requireSuperAdmin>
                    <Organizations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/plans"
                element={
                  <ProtectedRoute requireSuperAdmin>
                    <Plans />
                  </ProtectedRoute>
                }
              />
              {/* Route Admin Dashboard (pour role ADMIN) */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              {/* Routes Zakat */}
              <Route
                path="/zakat"
                element={
                  <ProtectedRoute>
                    <Zakat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/zakat/settings"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <ZakatSettings />
                  </ProtectedRoute>
                }
              />
              {/* Route Online Orders (back-office) */}
              <Route
                path="/online-orders"
                element={
                  <ProtectedRoute>
                    <OnlineOrders />
                  </ProtectedRoute>
                }
              />
              {/* Route Livreurs (back-office) */}
              <Route
                path="/livreurs"
                element={
                  <ProtectedRoute>
                    <Livreurs />
                  </ProtectedRoute>
                }
              />
              {/* Route Storefront Settings (back-office) */}
              <Route
                path="/storefront-settings"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <StorefrontSettings />
                  </ProtectedRoute>
                }
              />
              {/* Routes Storefront et Customer - single CustomerAuthProvider wrapper */}
              <Route element={<CustomerAuthProvider />}>
                {/* Storefront (public) */}
                <Route path="/b/:slug" element={<StorefrontHome />} />
                <Route path="/b/:slug/product/:id" element={<StorefrontProduct />} />
                <Route path="/b/:slug/cart" element={<StorefrontCart />} />
                <Route path="/b/:slug/checkout" element={<StorefrontCheckout />} />
                {/* Storefront Orders (protected) */}
                <Route
                  path="/b/:slug/orders"
                  element={
                    <CustomerProtectedRoute>
                      <StorefrontOrders />
                    </CustomerProtectedRoute>
                  }
                />
                <Route
                  path="/b/:slug/orders/:id"
                  element={
                    <CustomerProtectedRoute>
                      <StorefrontOrderDetail />
                    </CustomerProtectedRoute>
                  }
                />
                {/* Storefront Profile (protected) */}
                <Route
                  path="/b/:slug/profile"
                  element={
                    <CustomerProtectedRoute>
                      <StorefrontProfile />
                    </CustomerProtectedRoute>
                  }
                />
                {/* Customer auth (public) */}
                <Route path="/customer/login" element={<CustomerLogin />} />
                <Route path="/customer/register" element={<CustomerRegister />} />
                {/* Customer area (protégées) */}
                <Route
                  path="/customer/orders"
                  element={
                    <CustomerProtectedRoute>
                      <CustomerOrders />
                    </CustomerProtectedRoute>
                  }
                />
                <Route
                  path="/customer/orders/:id"
                  element={
                    <CustomerProtectedRoute>
                      <CustomerOrderDetail />
                    </CustomerProtectedRoute>
                  }
                />
                <Route
                  path="/customer/profile"
                  element={
                    <CustomerProtectedRoute>
                      <CustomerProfile />
                    </CustomerProtectedRoute>
                  }
                />
              </Route>
              {/* Routes Livreur - with LivreurAuthProvider */}
              <Route element={<LivreurAuthProvider />}>
                <Route path="/b/:slug/livreur" element={<LivreurLogin />} />
                <Route
                  path="/b/:slug/livreur/dashboard"
                  element={
                    <LivreurProtectedRoute>
                      <LivreurDashboard />
                    </LivreurProtectedRoute>
                  }
                />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
    </TooltipProvider>
      </SidebarProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

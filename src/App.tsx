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

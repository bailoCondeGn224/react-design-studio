import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import DynamicFavicon from "./components/DynamicFavicon.tsx";
import { SidebarProvider } from "./contexts/SidebarContext";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login.tsx";
import ChangePassword from "./pages/ChangePassword.tsx";
import Index from "./pages/Index.tsx";
import Fournisseurs from "./pages/Fournisseurs.tsx";
import Clients from "./pages/Clients.tsx";
import Stock from "./pages/Stock.tsx";
import Categories from "./pages/Categories.tsx";
import Zones from "./pages/Zones.tsx";
import Approvisionnements from "./pages/Approvisionnements.tsx";
import Ventes from "./pages/Ventes.tsx";
import Commandes from "./pages/Commandes.tsx";
import Versements from "./pages/Versements.tsx";
import VersementsClient from "./pages/VersementsClient.tsx";
import RetoursClients from "./pages/RetoursClients.tsx";
import RetoursFournisseurs from "./pages/RetoursFournisseurs.tsx";
import MouvementsStock from "./pages/MouvementsStock.tsx";
import Analytics from "./pages/Analytics.tsx";
import Utilisateurs from "./pages/Utilisateurs.tsx";
import Roles from "./pages/Roles.tsx";
import NotFound from "./pages/NotFound.tsx";
// Pages Super Admin (SUPER_ADMIN only)
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard.tsx";
import Organizations from "./pages/admin/Organizations.tsx";
import Plans from "./pages/admin/Plans.tsx";
// Page Admin Dashboard (pour role ADMIN)
import AdminDashboard from "./pages/AdminDashboard.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SidebarProvider>
        <TooltipProvider>
          <DynamicFavicon />
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
          <Route path="/login" element={<Login />} />
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
      </BrowserRouter>
    </TooltipProvider>
      </SidebarProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

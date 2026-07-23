 src/App.tsx                                        |  62 +++
 src/api/customer-auth.ts                           |  43 +++
 src/api/online-orders.ts                           |  75 ++++
 src/api/storefront.ts                              |  37 ++
 src/components/AppSidebar.tsx                      |  41 +-
 src/components/OnlineOrderMobileCard.tsx           | 239 ++++++++++++
 src/components/customer/CustomerNavbar.tsx         |  35 ++
 .../customer/CustomerOrderMobileCard.tsx           |  79 ++++
 src/components/customer/CustomerProtectedRoute.tsx |  28 ++
 src/components/storefront/CartDrawer.tsx           |  93 +++++
 src/components/storefront/CartMobileItem.tsx       |  68 ++++
 src/components/storefront/CategoryFilter.tsx       |  43 +++
 src/components/storefront/CheckoutMobileForm.tsx   | 168 ++++++++
 src/components/storefront/ProductGrid.tsx          |  34 ++
 src/components/storefront/ProductMobileCard.tsx    |  61 +++
 src/components/storefront/StorefrontHeader.tsx     |  74 ++++
 src/components/storefront/StorefrontLayout.tsx     |  71 ++++
 src/components/storefront/StorefrontSearch.tsx     |  23 ++
 src/contexts/CustomerAuthContext.tsx               |  88 +++++
 src/hooks/useCart.ts                               |  91 +++++
 src/hooks/useOnlineOrders.ts                       | 124 ++++++
 src/hooks/useStorefront.ts                         |  36 ++
 src/pages/OnlineOrders.tsx                         | 423 +++++++++++++++++++++
 src/pages/customer/CustomerLogin.tsx               |  89 +++++
 src/pages/customer/CustomerOrderDetail.tsx         | 146 +++++++
 src/pages/customer/CustomerOrders.tsx              |  72 ++++
 src/pages/customer/CustomerProfile.tsx             | 108 ++++++
 src/pages/customer/CustomerRegister.tsx            | 135 +++++++
 src/pages/storefront/StorefrontCart.tsx            |  88 +++++
 src/pages/storefront/StorefrontCheckout.tsx        | 159 ++++++++
 src/pages/storefront/StorefrontHome.tsx            |  72 ++++
 src/pages/storefront/StorefrontProduct.tsx         | 117 ++++++
 src/types/customer.ts                              | 132 +++++++
 src/types/index.ts                                 |   2 +
 34 files changed, 3151 insertions(+), 5 deletions(-)


## Commit Log

39ce23a feat(sidebar): add "Commandes en ligne" menu with pending badge
f69c47a feat(routing): add storefront, customer and online-orders routes
5dbc0c7 feat(backoffice): add online orders management page
8ed22dd feat(customer): add orders, order detail and profile pages
3d4e9c5 feat(customer): add login, register pages and protected route
c09602b feat(storefront): add checkout form, cart and checkout pages
966049f feat(storefront): add product detail page
afe0485 feat(storefront): add home page with product catalog
c92b959 feat(storefront): add product card, grid, search and category filter
df3fb95 feat(storefront): add cart drawer and item components
45a4734 feat(storefront): add layout and header components
2b66df3 feat(hooks): add storefront and online orders hooks
1e65c6c feat(hooks): add useCart hook with localStorage persistence
4d24d55 feat(auth): add CustomerAuthContext for client authentication
98dff63 feat(api): add customer auth, storefront and online orders APIs
f6703a2 feat(types): add customer and online order types


## Full Diff

```diff
diff --git a/src/App.tsx b/src/App.tsx
index d99dac3..31badff 100644
--- a/src/App.tsx
+++ b/src/App.tsx
@@ -2,20 +2,22 @@ import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
+import { CustomerAuthProvider } from "./contexts/CustomerAuthContext";
+import { CustomerProtectedRoute } from "./components/customer/CustomerProtectedRoute";
 import { InstallPWA } from "./components/InstallPWA";
 import { PWAUpdateNotification, OfflineIndicator } from "./components/PWAUpdateNotification";
 
 // Lazy load all pages for code splitting and better performance
 const Login = lazy(() => import("./pages/Login.tsx"));
 const Register = lazy(() => import("./pages/Register.tsx"));
 const ChangePassword = lazy(() => import("./pages/ChangePassword.tsx"));
 const Index = lazy(() => import("./pages/Index.tsx"));
 const Fournisseurs = lazy(() => import("./pages/Fournisseurs.tsx"));
 const Clients = lazy(() => import("./pages/Clients.tsx"));
@@ -39,20 +41,33 @@ const Roles = lazy(() => import("./pages/Roles.tsx"));
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
+// Page Online Orders (back-office)
+const OnlineOrders = lazy(() => import("./pages/OnlineOrders.tsx"));
+// Storefront pages (public)
+const StorefrontHome = lazy(() => import("./pages/storefront/StorefrontHome.tsx"));
+const StorefrontProduct = lazy(() => import("./pages/storefront/StorefrontProduct.tsx"));
+const StorefrontCart = lazy(() => import("./pages/storefront/StorefrontCart.tsx"));
+const StorefrontCheckout = lazy(() => import("./pages/storefront/StorefrontCheckout.tsx"));
+// Customer pages
+const CustomerLogin = lazy(() => import("./pages/customer/CustomerLogin.tsx"));
+const CustomerRegister = lazy(() => import("./pages/customer/CustomerRegister.tsx"));
+const CustomerOrders = lazy(() => import("./pages/customer/CustomerOrders.tsx"));
+const CustomerOrderDetail = lazy(() => import("./pages/customer/CustomerOrderDetail.tsx"));
+const CustomerProfile = lazy(() => import("./pages/customer/CustomerProfile.tsx"));
 
 const queryClient = new QueryClient({
   defaultOptions: {
     queries: {
       staleTime: 30 * 1000, // 30 secondes - données considérées fraîches
       gcTime: 5 * 60 * 1000, // 5 minutes - cache en mémoire
       refetchOnWindowFocus: false, // Ne pas refetch au focus de fenêtre
       refetchOnMount: true, // Refetch au montage pour données fraîches
       retry: 1, // Réessayer 1 fois en cas d'erreur
     },
@@ -280,20 +295,67 @@ const App = () => (
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
+              {/* Route Online Orders (back-office) */}
+              <Route
+                path="/online-orders"
+                element={
+                  <ProtectedRoute>
+                    <OnlineOrders />
+                  </ProtectedRoute>
+                }
+              />
+              {/* Routes Storefront (public) - wrapped with CustomerAuthProvider */}
+              <Route path="/b/:slug" element={<CustomerAuthProvider><StorefrontHome /></CustomerAuthProvider>} />
+              <Route path="/b/:slug/product/:id" element={<CustomerAuthProvider><StorefrontProduct /></CustomerAuthProvider>} />
+              <Route path="/b/:slug/cart" element={<CustomerAuthProvider><StorefrontCart /></CustomerAuthProvider>} />
+              <Route path="/b/:slug/checkout" element={<CustomerAuthProvider><StorefrontCheckout /></CustomerAuthProvider>} />
+              {/* Routes Customer (public + protégées) */}
+              <Route path="/customer/login" element={<CustomerAuthProvider><CustomerLogin /></CustomerAuthProvider>} />
+              <Route path="/customer/register" element={<CustomerAuthProvider><CustomerRegister /></CustomerAuthProvider>} />
+              <Route
+                path="/customer/orders"
+                element={
+                  <CustomerAuthProvider>
+                    <CustomerProtectedRoute>
+                      <CustomerOrders />
+                    </CustomerProtectedRoute>
+                  </CustomerAuthProvider>
+                }
+              />
+              <Route
+                path="/customer/orders/:id"
+                element={
+                  <CustomerAuthProvider>
+                    <CustomerProtectedRoute>
+                      <CustomerOrderDetail />
+                    </CustomerProtectedRoute>
+                  </CustomerAuthProvider>
+                }
+              />
+              <Route
+                path="/customer/profile"
+                element={
+                  <CustomerAuthProvider>
+                    <CustomerProtectedRoute>
+                      <CustomerProfile />
+                    </CustomerProtectedRoute>
+                  </CustomerAuthProvider>
+                }
+              />
               <Route path="*" element={<NotFound />} />
             </Routes>
           </Suspense>
         </BrowserRouter>
     </TooltipProvider>
       </SidebarProvider>
     </AuthProvider>
   </QueryClientProvider>
 );
 
diff --git a/src/api/customer-auth.ts b/src/api/customer-auth.ts
new file mode 100644
index 0000000..9a4ceef
--- /dev/null
+++ b/src/api/customer-auth.ts
@@ -0,0 +1,43 @@
+// src/api/customer-auth.ts
+import { apiClient } from '@/lib/api-client';
+import { CustomerAccount, RegisterCustomerDto, LoginCustomerDto, UpdateCustomerDto } from '@/types';
+
+// Client API avec token client séparé
+const getCustomerToken = () => localStorage.getItem('customer_token');
+
+const customerApiClient = {
+  get: async <T>(url: string) => {
+    const token = getCustomerToken();
+    return apiClient.get<T>(url, {
+      headers: token ? { Authorization: `Bearer ${token}` } : {},
+    });
+  },
+  patch: async <T>(url: string, data: unknown) => {
+    const token = getCustomerToken();
+    return apiClient.patch<T>(url, data, {
+      headers: token ? { Authorization: `Bearer ${token}` } : {},
+    });
+  },
+};
+
+export const customerAuthApi = {
+  register: async (data: RegisterCustomerDto): Promise<{ access_token: string; customer: CustomerAccount }> => {
+    const response = await apiClient.post('/public/customer/auth/register', data);
+    return response.data;
+  },
+
+  login: async (data: LoginCustomerDto): Promise<{ access_token: string; customer: CustomerAccount }> => {
+    const response = await apiClient.post('/public/customer/auth/login', data);
+    return response.data;
+  },
+
+  getProfile: async (): Promise<CustomerAccount> => {
+    const response = await customerApiClient.get<CustomerAccount>('/public/customer/auth/me');
+    return response.data;
+  },
+
+  updateProfile: async (data: UpdateCustomerDto): Promise<CustomerAccount> => {
+    const response = await customerApiClient.patch<CustomerAccount>('/public/customer/auth/me', data);
+    return response.data;
+  },
+};
diff --git a/src/api/online-orders.ts b/src/api/online-orders.ts
new file mode 100644
index 0000000..475ccf3
--- /dev/null
+++ b/src/api/online-orders.ts
@@ -0,0 +1,75 @@
+// src/api/online-orders.ts
+import { apiClient } from '@/lib/api-client';
+import { OnlineOrder, CreateOnlineOrderDto, OnlineOrderFilterParams, PaginatedResponse } from '@/types';
+
+const getCustomerToken = () => localStorage.getItem('customer_token');
+
+export const onlineOrdersApi = {
+  // Public - création commande
+  create: async (data: CreateOnlineOrderDto): Promise<OnlineOrder> => {
+    const token = getCustomerToken();
+    const response = await apiClient.post<OnlineOrder>('/public/orders', data, {
+      headers: token ? { Authorization: `Bearer ${token}` } : {},
+    });
+    return response.data;
+  },
+
+  // Client connecté - mes commandes
+  getMyOrders: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<OnlineOrder>> => {
+    const token = getCustomerToken();
+    const response = await apiClient.get<PaginatedResponse<OnlineOrder>>('/public/orders', {
+      params,
+      headers: token ? { Authorization: `Bearer ${token}` } : {},
+    });
+    return response.data;
+  },
+
+  getMyOrder: async (id: string): Promise<OnlineOrder> => {
+    const token = getCustomerToken();
+    const response = await apiClient.get<OnlineOrder>(`/public/orders/${id}`, {
+      headers: token ? { Authorization: `Bearer ${token}` } : {},
+    });
+    return response.data;
+  },
+
+  // Back-office
+  getAll: async (params?: OnlineOrderFilterParams): Promise<PaginatedResponse<OnlineOrder>> => {
+    const response = await apiClient.get<PaginatedResponse<OnlineOrder>>('/online-orders', { params });
+    return response.data;
+  },
+
+  getById: async (id: string): Promise<OnlineOrder> => {
+    const response = await apiClient.get<OnlineOrder>(`/online-orders/${id}`);
+    return response.data;
+  },
+
+  confirm: async (id: string): Promise<OnlineOrder> => {
+    const response = await apiClient.patch<OnlineOrder>(`/online-orders/${id}/confirm`);
+    return response.data;
+  },
+
+  markReady: async (id: string): Promise<OnlineOrder> => {
+    const response = await apiClient.patch<OnlineOrder>(`/online-orders/${id}/ready`);
+    return response.data;
+  },
+
+  markDelivered: async (id: string): Promise<OnlineOrder> => {
+    const response = await apiClient.patch<OnlineOrder>(`/online-orders/${id}/deliver`);
+    return response.data;
+  },
+
+  cancel: async (id: string, motif: string): Promise<OnlineOrder> => {
+    const response = await apiClient.patch<OnlineOrder>(`/online-orders/${id}/cancel`, { motifAnnulation: motif });
+    return response.data;
+  },
+
+  getStats: async (): Promise<{ enAttente: number; confirmees: number; pretes: number; livrees: number; total: number }> => {
+    const response = await apiClient.get('/online-orders/stats');
+    return response.data;
+  },
+
+  getPendingCount: async (): Promise<{ count: number }> => {
+    const response = await apiClient.get('/online-orders/pending-count');
+    return response.data;
+  },
+};
diff --git a/src/api/storefront.ts b/src/api/storefront.ts
new file mode 100644
index 0000000..1867908
--- /dev/null
+++ b/src/api/storefront.ts
@@ -0,0 +1,37 @@
+// src/api/storefront.ts
+import { apiClient } from '@/lib/api-client';
+import { StoreFront, StorefrontArticle, PaginatedResponse } from '@/types';
+
+export interface StorefrontProductParams {
+  page?: number;
+  limit?: number;
+  search?: string;
+  categorieId?: string;
+}
+
+export const storefrontApi = {
+  getBySlug: async (slug: string): Promise<StoreFront> => {
+    const response = await apiClient.get<StoreFront>(`/public/storefront/${slug}`);
+    return response.data;
+  },
+
+  getProducts: async (slug: string, params?: StorefrontProductParams): Promise<PaginatedResponse<StorefrontArticle>> => {
+    const response = await apiClient.get<PaginatedResponse<StorefrontArticle>>(
+      `/public/storefront/${slug}/articles`,
+      { params }
+    );
+    return response.data;
+  },
+
+  getProduct: async (slug: string, articleId: string): Promise<StorefrontArticle> => {
+    const response = await apiClient.get<StorefrontArticle>(
+      `/public/storefront/${slug}/articles/${articleId}`
+    );
+    return response.data;
+  },
+
+  getCategories: async (slug: string): Promise<{ id: string; nom: string; slug: string }[]> => {
+    const response = await apiClient.get(`/public/storefront/${slug}/categories`);
+    return response.data;
+  },
+};
diff --git a/src/components/AppSidebar.tsx b/src/components/AppSidebar.tsx
index 8eda0b6..46c6aab 100644
--- a/src/components/AppSidebar.tsx
+++ b/src/components/AppSidebar.tsx
@@ -1,35 +1,37 @@
 import { NavLink, useLocation } from "react-router-dom";
 import {
   LayoutDashboard, Users, UserCheck, Package, FolderTree, MapPin, Truck, ShoppingCart, Wallet,
   ChevronLeft, ChevronRight, Sparkles, ArrowDownRight, ArrowDownLeft, Menu, LogOut, History, BarChart3,
   Shield, UserCog, Settings, Building2, CreditCard, RotateCcw, PackageX, ClipboardList, ClipboardCheck,
-  Receipt, Calculator
+  Receipt, Calculator, Globe
 } from "lucide-react";
 import { useState, useRef, useEffect, memo, useMemo } from "react";
 import { Sheet, SheetContent } from "@/components/ui/sheet";
 import { useLogout, useCurrentUser, useIsSuperAdmin, useUserRole } from "@/hooks/useAuth";
 import CanAccess from "@/components/CanAccess";
 import { useSidebar } from "@/contexts/SidebarContext";
+import { usePendingOrderCount } from "@/hooks/useOnlineOrders";
 
 // Menu pour les utilisateurs normaux (tenant users)
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
   { to: "/commandes", icon: ClipboardList, label: "Commandes", permissions: ["commandes.read"] },
+  { to: "/online-orders", icon: Globe, label: "Commandes en ligne", permissions: [], hasBadge: true },
   { to: "/versements", icon: ArrowDownRight, label: "Versements", permissions: ["versements.read"] },
   { to: "/versements-client", icon: ArrowDownLeft, label: "Paiements Clients", permissions: ["versements-client.read"] },
   { to: "/retours-clients", icon: RotateCcw, label: "Retours Clients", permissions: ["retours.create"] },
   { to: "/retours-fournisseurs", icon: PackageX, label: "Retours Fournisseurs", permissions: ["retours.create"] },
   { to: "/mouvements-stock", icon: History, label: "Historique Mouvements", permissions: ["mouvements.read"] },
   { to: "/inventaires", icon: ClipboardCheck, label: "Inventaires", permissions: ["stock.read"] },
   { to: "/depenses", icon: Receipt, label: "Dépenses", permissions: ["depenses.read"] },
   { to: "/zakat", icon: Calculator, label: "Zakat", permissions: [] },
   { to: "/utilisateurs", icon: UserCog, label: "Utilisateurs", permissions: ["users.read"] },
   { to: "/roles", icon: Shield, label: "Rôles & Permissions", permissions: ["roles.read"] },
@@ -47,67 +49,94 @@ const adminNavItems = [
   { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard Admin" },
   { to: "/analytics", icon: BarChart3, label: "Analytics", permissions: ["analytics.read"] },
   { to: "/fournisseurs", icon: Users, label: "Fournisseurs", permissions: ["fournisseurs.read"] },
   { to: "/clients", icon: UserCheck, label: "Clients", permissions: ["clients.read"] },
   { to: "/stock", icon: Package, label: "Stock", permissions: ["stock.read"] },
   { to: "/categories", icon: FolderTree, label: "Catégories", permissions: ["categories.read"] },
   { to: "/zones", icon: MapPin, label: "Zones" },
   { to: "/approvisionnements", icon: Truck, label: "Approvisionnements", permissions: ["approvisionnements.read"] },
   { to: "/ventes", icon: ShoppingCart, label: "Ventes", permissions: ["ventes.read"] },
   { to: "/commandes", icon: ClipboardList, label: "Commandes", permissions: ["commandes.read"] },
+  { to: "/online-orders", icon: Globe, label: "Commandes en ligne", hasBadge: true },
   { to: "/versements", icon: ArrowDownRight, label: "Versements", permissions: ["versements.read"] },
   { to: "/versements-client", icon: ArrowDownLeft, label: "Paiements Clients", permissions: ["versements-client.read"] },
   { to: "/retours-clients", icon: RotateCcw, label: "Retours Clients", permissions: ["retours.create"] },
   { to: "/retours-fournisseurs", icon: PackageX, label: "Retours Fournisseurs", permissions: ["retours.create"] },
   { to: "/mouvements-stock", icon: History, label: "Historique Mouvements", permissions: ["mouvements.read"] },
   { to: "/inventaires", icon: ClipboardCheck, label: "Inventaires", permissions: ["stock.read"] },
   { to: "/depenses", icon: Receipt, label: "Dépenses", permissions: ["depenses.read"] },
   { to: "/zakat", icon: Calculator, label: "Zakat" },
   { to: "/utilisateurs", icon: UserCog, label: "Utilisateurs", permissions: ["users.read"] },
   { to: "/roles", icon: Shield, label: "Rôles & Permissions", permissions: ["roles.read"] },
 ];
 
+// Type for nav items with optional hasBadge property
+type NavItem = {
+  to: string;
+  icon: React.ComponentType<{ className?: string }>;
+  label: string;
+  permissions?: string[];
+  hasBadge?: boolean;
+};
+
 // Composant MenuItem mémorisé pour éviter les re-renders inutiles
-const MenuItem = memo(({ item, collapsed, isActive, onItemClick }: {
-  item: typeof navItems[0];
+const MenuItem = memo(({ item, collapsed, isActive, onItemClick, badgeCount }: {
+  item: NavItem;
   collapsed: boolean;
   isActive: boolean;
   onItemClick?: () => void;
+  badgeCount?: number;
 }) => {
   return (
     <NavLink
       to={item.to}
       onClick={onItemClick}
-      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
+      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
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
-      {!collapsed && <span className="animate-fade-in">{item.label}</span>}
+      {!collapsed && (
+        <span className="animate-fade-in flex-1 flex items-center justify-between">
+          <span>{item.label}</span>
+          {item.hasBadge && badgeCount !== undefined && badgeCount > 0 && (
+            <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-primary text-primary-foreground min-w-[20px] text-center">
+              {badgeCount > 99 ? '99+' : badgeCount}
+            </span>
+          )}
+        </span>
+      )}
+      {collapsed && item.hasBadge && badgeCount !== undefined && badgeCount > 0 && (
+        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
+      )}
     </NavLink>
   );
 });
 
 const SidebarContent = ({ collapsed, setCollapsed, onItemClick }: { collapsed: boolean; setCollapsed: (v: boolean) => void; onItemClick?: () => void }) => {
   const location = useLocation();
   const logout = useLogout();
   const user = useCurrentUser();
   const isSuperAdmin = useIsSuperAdmin();
   const userRole = useUserRole();
   const navRef = useRef<HTMLElement>(null);
 
+  // Get pending online orders count for badge
+  const { data: pendingData } = usePendingOrderCount();
+  const pendingCount = pendingData?.count ?? 0;
+
   // Les paramètres viennent maintenant de l'organization de l'utilisateur
   const organization = user?.organization;
 
   // Choisir le bon menu selon le type d'utilisateur - mémorisé pour éviter les re-renders
   const menuItems = useMemo(() => {
     if (isSuperAdmin) {
       return superAdminNavItems;
     } else if (userRole === 'ADMIN') {
       return adminNavItems;
     }
@@ -178,32 +207,34 @@ const SidebarContent = ({ collapsed, setCollapsed, onItemClick }: { collapsed: b
 
           // Pour les super admins, pas de vérification de permissions
           if (isSuperAdmin) {
             return (
               <MenuItem
                 key={item.to}
                 item={item}
                 collapsed={collapsed}
                 isActive={isActive}
                 onItemClick={onItemClick}
+                badgeCount={item.hasBadge ? pendingCount : undefined}
               />
             );
           }
 
           // Pour les utilisateurs normaux, vérifier les permissions
           return (
             <CanAccess key={item.to} permissions={item.permissions}>
               <MenuItem
                 item={item}
                 collapsed={collapsed}
                 isActive={isActive}
                 onItemClick={onItemClick}
+                badgeCount={item.hasBadge ? pendingCount : undefined}
               />
             </CanAccess>
           );
         })}
       </nav>
 
       {/* User Info & Logout */}
       <div className="mx-3 mb-3 space-y-2">
         {!collapsed && user && (
           <div className="px-3 py-2 rounded-lg bg-sidebar-accent/30">
diff --git a/src/components/OnlineOrderMobileCard.tsx b/src/components/OnlineOrderMobileCard.tsx
new file mode 100644
index 0000000..1ac281b
--- /dev/null
+++ b/src/components/OnlineOrderMobileCard.tsx
@@ -0,0 +1,239 @@
+import { Card, CardContent } from "@/components/ui/card";
+import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
+import { Button } from "@/components/ui/button";
+import { OnlineOrder, OnlineOrderStatut } from "@/types";
+import { Package, MapPin, Phone, CheckCircle, Truck, XCircle, Clock, User, Calendar } from "lucide-react";
+
+interface OnlineOrderMobileCardProps {
+  order: OnlineOrder;
+  onConfirm: (id: string) => void;
+  onMarkReady: (id: string) => void;
+  onMarkDelivered: (id: string) => void;
+  onCancel: (id: string) => void;
+  onViewDetails: (id: string) => void;
+  formatPrix: (prix: number) => string;
+  formatDate: (date: string) => string;
+}
+
+const statutConfig: Record<OnlineOrderStatut, { label: string; icon: typeof Clock; className: string; bgClassName: string }> = {
+  [OnlineOrderStatut.EN_ATTENTE]: {
+    label: 'En attente',
+    icon: Clock,
+    className: 'text-orange-700 dark:text-orange-400',
+    bgClassName: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-800'
+  },
+  [OnlineOrderStatut.CONFIRMEE]: {
+    label: 'Confirmée',
+    icon: CheckCircle,
+    className: 'text-blue-700 dark:text-blue-400',
+    bgClassName: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-800'
+  },
+  [OnlineOrderStatut.PRETE]: {
+    label: 'Prête',
+    icon: Package,
+    className: 'text-green-700 dark:text-green-400',
+    bgClassName: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800'
+  },
+  [OnlineOrderStatut.LIVREE]: {
+    label: 'Livrée',
+    icon: Truck,
+    className: 'text-gray-700 dark:text-gray-400',
+    bgClassName: 'bg-gray-100 dark:bg-gray-900/30 border-gray-300 dark:border-gray-800'
+  },
+  [OnlineOrderStatut.ANNULEE]: {
+    label: 'Annulée',
+    icon: XCircle,
+    className: 'text-red-700 dark:text-red-400',
+    bgClassName: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-800'
+  },
+};
+
+const OnlineOrderMobileCard = ({
+  order,
+  onConfirm,
+  onMarkReady,
+  onMarkDelivered,
+  onCancel,
+  onViewDetails,
+  formatPrix,
+  formatDate,
+}: OnlineOrderMobileCardProps) => {
+  const statut = statutConfig[order.statut];
+  const StatutIcon = statut.icon;
+
+  return (
+    <Card className="transition-shadow hover:shadow-lg hover:border-primary/30">
+      <CardContent className="p-0">
+        {/* En-tête avec numéro et statut */}
+        <div className="flex items-center justify-between p-4 border-b border-border/50">
+          <div className="flex items-center gap-2">
+            <Package className="w-5 h-5 text-primary flex-shrink-0" />
+            <div>
+              <p className="text-sm font-bold text-foreground">{order.numero}</p>
+              <div className="flex items-center gap-1 mt-0.5">
+                <Calendar className="w-3 h-3 text-muted-foreground" />
+                <p className="text-[10px] text-muted-foreground">{formatDate(order.createdAt)}</p>
+              </div>
+            </div>
+          </div>
+          <div className={`px-2 py-1 rounded-full border ${statut.bgClassName}`}>
+            <div className="flex items-center gap-1">
+              <StatutIcon className={`w-3 h-3 ${statut.className}`} />
+              <p className={`text-xs font-bold ${statut.className}`}>{statut.label}</p>
+            </div>
+          </div>
+        </div>
+
+        {/* Client et infos */}
+        <div className="p-4 space-y-3">
+          {/* Client */}
+          <div className="flex items-start gap-3">
+            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
+              <User className="w-5 h-5 text-primary" />
+            </div>
+            <div className="flex-1 min-w-0">
+              <p className="text-sm font-semibold text-foreground">
+                {order.clientNom || 'Client anonyme'}
+              </p>
+              {order.telephoneLivraison && (
+                <div className="flex items-center gap-1 mt-0.5">
+                  <Phone className="w-3 h-3 text-muted-foreground" />
+                  <p className="text-xs text-muted-foreground">{order.telephoneLivraison}</p>
+                </div>
+              )}
+            </div>
+          </div>
+
+          {/* Livraison */}
+          <div className="flex items-center gap-2">
+            <MapPin className="w-4 h-4 text-muted-foreground" />
+            <span className="text-xs text-muted-foreground">
+              {order.modeLivraison === 'LIVRAISON'
+                ? order.adresseLivraison || 'Livraison'
+                : 'Retrait en boutique'}
+            </span>
+          </div>
+
+          {/* Articles preview */}
+          <div className="space-y-1.5">
+            {order.items.slice(0, 2).map((item) => (
+              <div key={item.id} className="flex items-center justify-between text-xs">
+                <div className="flex items-center gap-2 flex-1 min-w-0">
+                  <Package className="w-3 h-3 text-muted-foreground flex-shrink-0" />
+                  <span className="text-foreground truncate">{item.articleNom}</span>
+                </div>
+                <span className="text-muted-foreground whitespace-nowrap ml-2">×{item.quantite}</span>
+              </div>
+            ))}
+            {order.items.length > 2 && (
+              <button
+                onClick={() => onViewDetails(order.id)}
+                className="text-xs text-primary font-medium hover:underline transition-transform active:scale-95"
+              >
+                + {order.items.length - 2} autre{order.items.length - 2 > 1 ? 's' : ''}
+              </button>
+            )}
+          </div>
+        </div>
+
+        {/* Montants */}
+        <div className="px-4 py-3 bg-primary/5 border-t border-border/50">
+          <div className="flex items-center justify-between mb-2">
+            <span className="text-xs text-muted-foreground">Total</span>
+            <span className="text-2xl font-black text-primary">{formatPrix(order.total)}</span>
+          </div>
+
+          <div className="flex items-center justify-between gap-2 text-xs">
+            <span className="text-muted-foreground">
+              Sous-total: {formatPrix(order.sousTotal)} • Livraison: {formatPrix(order.fraisLivraison)}
+            </span>
+            <div className="px-2 py-1 rounded-md bg-primary/10">
+              <span className="font-bold text-primary">{order.items.length} article{order.items.length > 1 ? 's' : ''}</span>
+            </div>
+          </div>
+        </div>
+
+        {/* Actions */}
+        <div className="p-3 border-t border-border bg-card">
+          <Sheet>
+            <SheetTrigger asChild>
+              <Button variant="outline" size="lg" className="w-full h-12 text-sm font-semibold">
+                Actions
+              </Button>
+            </SheetTrigger>
+            <SheetContent side="bottom" className="h-auto max-h-[85vh]">
+              <SheetHeader className="mb-4">
+                <SheetTitle className="text-left text-lg">{order.numero}</SheetTitle>
+                <p className="text-sm text-muted-foreground text-left">
+                  {order.clientNom || 'Client anonyme'} • {order.telephoneLivraison}
+                </p>
+              </SheetHeader>
+
+              <div className="space-y-3">
+                {order.statut === OnlineOrderStatut.EN_ATTENTE && (
+                  <Button
+                    variant="default"
+                    size="lg"
+                    className="w-full h-14 justify-start text-left text-base"
+                    onClick={() => onConfirm(order.id)}
+                  >
+                    <CheckCircle className="w-5 h-5 mr-3" />
+                    Confirmer la commande
+                  </Button>
+                )}
+
+                {order.statut === OnlineOrderStatut.CONFIRMEE && (
+                  <Button
+                    variant="default"
+                    size="lg"
+                    className="w-full h-14 justify-start text-left text-base"
+                    onClick={() => onMarkReady(order.id)}
+                  >
+                    <Package className="w-5 h-5 mr-3" />
+                    Marquer prête
+                  </Button>
+                )}
+
+                {order.statut === OnlineOrderStatut.PRETE && (
+                  <Button
+                    variant="default"
+                    size="lg"
+                    className="w-full h-14 justify-start text-left text-base"
+                    onClick={() => onMarkDelivered(order.id)}
+                  >
+                    <Truck className="w-5 h-5 mr-3" />
+                    Marquer livrée
+                  </Button>
+                )}
+
+                <Button
+                  variant="outline"
+                  size="lg"
+                  className="w-full h-14 justify-start text-left text-base"
+                  onClick={() => onViewDetails(order.id)}
+                >
+                  <Package className="w-5 h-5 mr-3" />
+                  Voir les détails
+                </Button>
+
+                {(order.statut === OnlineOrderStatut.EN_ATTENTE || order.statut === OnlineOrderStatut.CONFIRMEE) && (
+                  <Button
+                    variant="outline"
+                    size="lg"
+                    className="w-full h-14 justify-start text-left text-base text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
+                    onClick={() => onCancel(order.id)}
+                  >
+                    <XCircle className="w-5 h-5 mr-3" />
+                    Annuler la commande
+                  </Button>
+                )}
+              </div>
+            </SheetContent>
+          </Sheet>
+        </div>
+      </CardContent>
+    </Card>
+  );
+};
+
+export default OnlineOrderMobileCard;
diff --git a/src/components/customer/CustomerNavbar.tsx b/src/components/customer/CustomerNavbar.tsx
new file mode 100644
index 0000000..0d55563
--- /dev/null
+++ b/src/components/customer/CustomerNavbar.tsx
@@ -0,0 +1,35 @@
+// src/components/customer/CustomerNavbar.tsx
+import { useLocation, useNavigate } from 'react-router-dom';
+import { Package, User } from 'lucide-react';
+
+const navItems = [
+  { path: '/customer/orders', icon: Package, label: 'Commandes' },
+  { path: '/customer/profile', icon: User, label: 'Profil' },
+];
+
+export const CustomerNavbar = () => {
+  const location = useLocation();
+  const navigate = useNavigate();
+
+  return (
+    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t safe-area-pb z-50">
+      <div className="flex justify-around items-center h-16">
+        {navItems.map(({ path, icon: Icon, label }) => {
+          const isActive = location.pathname === path;
+          return (
+            <button
+              key={path}
+              onClick={() => navigate(path)}
+              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
+                isActive ? 'text-primary' : 'text-muted-foreground'
+              }`}
+            >
+              <Icon className="h-5 w-5" />
+              <span className="text-xs mt-1">{label}</span>
+            </button>
+          );
+        })}
+      </div>
+    </nav>
+  );
+};
diff --git a/src/components/customer/CustomerOrderMobileCard.tsx b/src/components/customer/CustomerOrderMobileCard.tsx
new file mode 100644
index 0000000..591fa67
--- /dev/null
+++ b/src/components/customer/CustomerOrderMobileCard.tsx
@@ -0,0 +1,79 @@
+// src/components/customer/CustomerOrderMobileCard.tsx
+import { Card, CardContent } from '@/components/ui/card';
+import { Button } from '@/components/ui/button';
+import { OnlineOrder, OnlineOrderStatut } from '@/types';
+import { Package, Calendar, MapPin, ShoppingCart } from 'lucide-react';
+
+interface CustomerOrderMobileCardProps {
+  order: OnlineOrder;
+  onViewDetails: () => void;
+  formatPrix: (prix: number) => string;
+  formatDate: (date: string) => string;
+}
+
+const statutConfig: Record<OnlineOrderStatut, { label: string; className: string }> = {
+  [OnlineOrderStatut.EN_ATTENTE]: { label: 'En attente', className: 'bg-orange-100 text-orange-700 border-orange-200' },
+  [OnlineOrderStatut.CONFIRMEE]: { label: 'Confirmée', className: 'bg-blue-100 text-blue-700 border-blue-200' },
+  [OnlineOrderStatut.PRETE]: { label: 'Prête', className: 'bg-green-100 text-green-700 border-green-200' },
+  [OnlineOrderStatut.LIVREE]: { label: 'Livrée', className: 'bg-gray-100 text-gray-700 border-gray-200' },
+  [OnlineOrderStatut.ANNULEE]: { label: 'Annulée', className: 'bg-red-100 text-red-700 border-red-200' },
+};
+
+export const CustomerOrderMobileCard = ({
+  order,
+  onViewDetails,
+  formatPrix,
+  formatDate,
+}: CustomerOrderMobileCardProps) => {
+  const statut = statutConfig[order.statut];
+
+  return (
+    <Card>
+      <CardContent className="p-0">
+        {/* Header */}
+        <div className="flex items-center justify-between p-4 border-b">
+          <div className="flex items-center gap-2">
+            <Package className="h-5 w-5 text-primary" />
+            <span className="font-bold">{order.numero}</span>
+          </div>
+          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statut.className}`}>
+            {statut.label}
+          </span>
+        </div>
+
+        {/* Content */}
+        <div className="p-4 space-y-2">
+          <div className="flex items-center gap-2 text-sm text-muted-foreground">
+            <Calendar className="h-4 w-4" />
+            <span>{formatDate(order.createdAt)}</span>
+          </div>
+          <div className="flex items-center gap-2 text-sm text-muted-foreground">
+            <MapPin className="h-4 w-4" />
+            <span>
+              {order.modeLivraison === 'LIVRAISON' ? `Livraison - ${order.adresseLivraison}` : 'Retrait en boutique'}
+            </span>
+          </div>
+          <div className="flex items-center gap-2 text-sm text-muted-foreground">
+            <ShoppingCart className="h-4 w-4" />
+            <span>{order.items.length} article{order.items.length > 1 ? 's' : ''}</span>
+          </div>
+        </div>
+
+        {/* Total */}
+        <div className="px-4 py-3 bg-muted/50">
+          <div className="flex justify-between items-center">
+            <span className="text-sm text-muted-foreground">Total</span>
+            <span className="text-xl font-bold text-primary">{formatPrix(order.total)}</span>
+          </div>
+        </div>
+
+        {/* Action */}
+        <div className="p-3 border-t">
+          <Button variant="outline" className="w-full h-12" onClick={onViewDetails}>
+            Voir les détails
+          </Button>
+        </div>
+      </CardContent>
+    </Card>
+  );
+};
diff --git a/src/components/customer/CustomerProtectedRoute.tsx b/src/components/customer/CustomerProtectedRoute.tsx
new file mode 100644
index 0000000..24e3906
--- /dev/null
+++ b/src/components/customer/CustomerProtectedRoute.tsx
@@ -0,0 +1,28 @@
+// src/components/customer/CustomerProtectedRoute.tsx
+import { ReactNode } from 'react';
+import { Navigate, useLocation } from 'react-router-dom';
+import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
+import { Loader2 } from 'lucide-react';
+
+interface CustomerProtectedRouteProps {
+  children: ReactNode;
+}
+
+export const CustomerProtectedRoute = ({ children }: CustomerProtectedRouteProps) => {
+  const { isAuthenticated, isLoading } = useCustomerAuth();
+  const location = useLocation();
+
+  if (isLoading) {
+    return (
+      <div className="min-h-screen flex items-center justify-center">
+        <Loader2 className="h-8 w-8 animate-spin text-primary" />
+      </div>
+    );
+  }
+
+  if (!isAuthenticated) {
+    return <Navigate to={`/customer/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
+  }
+
+  return <>{children}</>;
+};
diff --git a/src/components/storefront/CartDrawer.tsx b/src/components/storefront/CartDrawer.tsx
new file mode 100644
index 0000000..6617b72
--- /dev/null
+++ b/src/components/storefront/CartDrawer.tsx
@@ -0,0 +1,93 @@
+// src/components/storefront/CartDrawer.tsx
+import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
+import { Button } from '@/components/ui/button';
+import { CartMobileItem } from './CartMobileItem';
+import { CartItem } from '@/types';
+import { ShoppingBag } from 'lucide-react';
+
+interface CartDrawerProps {
+  open: boolean;
+  onOpenChange: (open: boolean) => void;
+  items: CartItem[];
+  subtotal: number;
+  fraisLivraison: number;
+  onRemove: (articleId: string, modeVenteId?: string) => void;
+  onUpdateQuantity: (articleId: string, quantity: number, modeVenteId?: string) => void;
+  onCheckout: () => void;
+}
+
+const formatPrix = (prix: number) => {
+  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
+};
+
+export const CartDrawer = ({
+  open,
+  onOpenChange,
+  items,
+  subtotal,
+  fraisLivraison,
+  onRemove,
+  onUpdateQuantity,
+  onCheckout,
+}: CartDrawerProps) => {
+  const total = subtotal + fraisLivraison;
+
+  return (
+    <Sheet open={open} onOpenChange={onOpenChange}>
+      <SheetContent side="bottom" className="h-[85vh] flex flex-col">
+        <SheetHeader>
+          <SheetTitle className="flex items-center gap-2">
+            <ShoppingBag className="h-5 w-5" />
+            Votre panier ({items.length})
+          </SheetTitle>
+        </SheetHeader>
+
+        {items.length === 0 ? (
+          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
+            <ShoppingBag className="h-16 w-16 mb-4 opacity-50" />
+            <p>Votre panier est vide</p>
+          </div>
+        ) : (
+          <>
+            {/* Liste des items */}
+            <div className="flex-1 overflow-y-auto py-4">
+              {items.map((item) => (
+                <CartMobileItem
+                  key={`${item.articleId}_${item.modeVenteId || ''}`}
+                  item={item}
+                  onRemove={() => onRemove(item.articleId, item.modeVenteId)}
+                  onUpdateQuantity={(qty) => onUpdateQuantity(item.articleId, qty, item.modeVenteId)}
+                  formatPrix={formatPrix}
+                />
+              ))}
+            </div>
+
+            {/* Totaux */}
+            <div className="border-t pt-4 space-y-2">
+              <div className="flex justify-between text-sm">
+                <span className="text-muted-foreground">Sous-total</span>
+                <span>{formatPrix(subtotal)}</span>
+              </div>
+              <div className="flex justify-between text-sm">
+                <span className="text-muted-foreground">Livraison</span>
+                <span>{formatPrix(fraisLivraison)}</span>
+              </div>
+              <div className="flex justify-between text-lg font-bold pt-2 border-t">
+                <span>Total</span>
+                <span className="text-primary">{formatPrix(total)}</span>
+              </div>
+
+              <Button
+                className="w-full h-12 text-base font-semibold mt-4"
+                onClick={onCheckout}
+                disabled={items.length === 0}
+              >
+                Valider la commande
+              </Button>
+            </div>
+          </>
+        )}
+      </SheetContent>
+    </Sheet>
+  );
+};
diff --git a/src/components/storefront/CartMobileItem.tsx b/src/components/storefront/CartMobileItem.tsx
new file mode 100644
index 0000000..977dd28
--- /dev/null
+++ b/src/components/storefront/CartMobileItem.tsx
@@ -0,0 +1,68 @@
+// src/components/storefront/CartMobileItem.tsx
+import { Minus, Plus, Trash2 } from 'lucide-react';
+import { Button } from '@/components/ui/button';
+import { CartItem } from '@/types';
+
+interface CartMobileItemProps {
+  item: CartItem;
+  onRemove: () => void;
+  onUpdateQuantity: (quantity: number) => void;
+  formatPrix: (prix: number) => string;
+}
+
+export const CartMobileItem = ({ item, onRemove, onUpdateQuantity, formatPrix }: CartMobileItemProps) => {
+  return (
+    <div className="flex gap-3 py-3 border-b last:border-0">
+      {/* Image */}
+      <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
+        {item.articlePhoto ? (
+          <img src={item.articlePhoto} alt={item.articleNom} className="w-full h-full object-cover" />
+        ) : (
+          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
+            Photo
+          </div>
+        )}
+      </div>
+
+      {/* Détails */}
+      <div className="flex-1 min-w-0">
+        <p className="font-medium text-sm truncate">{item.articleNom}</p>
+        {item.modeVenteNom && (
+          <p className="text-xs text-muted-foreground">{item.modeVenteNom}</p>
+        )}
+        <p className="text-sm text-primary font-semibold mt-1">
+          {formatPrix(item.prixUnitaire)}
+        </p>
+
+        {/* Quantité */}
+        <div className="flex items-center gap-2 mt-2">
+          <Button
+            variant="outline"
+            size="icon"
+            className="h-8 w-8"
+            onClick={() => onUpdateQuantity(item.quantity - 1)}
+          >
+            <Minus className="h-3 w-3" />
+          </Button>
+          <span className="w-8 text-center font-medium">{item.quantity}</span>
+          <Button
+            variant="outline"
+            size="icon"
+            className="h-8 w-8"
+            onClick={() => onUpdateQuantity(item.quantity + 1)}
+          >
+            <Plus className="h-3 w-3" />
+          </Button>
+          <Button
+            variant="ghost"
+            size="icon"
+            className="h-8 w-8 ml-auto text-destructive"
+            onClick={onRemove}
+          >
+            <Trash2 className="h-4 w-4" />
+          </Button>
+        </div>
+      </div>
+    </div>
+  );
+};
diff --git a/src/components/storefront/CategoryFilter.tsx b/src/components/storefront/CategoryFilter.tsx
new file mode 100644
index 0000000..a5f690d
--- /dev/null
+++ b/src/components/storefront/CategoryFilter.tsx
@@ -0,0 +1,43 @@
+// src/components/storefront/CategoryFilter.tsx
+import { Button } from '@/components/ui/button';
+import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
+
+interface Category {
+  id: string;
+  nom: string;
+}
+
+interface CategoryFilterProps {
+  categories: Category[];
+  selected: string | null;
+  onSelect: (categoryId: string | null) => void;
+}
+
+export const CategoryFilter = ({ categories, selected, onSelect }: CategoryFilterProps) => {
+  return (
+    <ScrollArea className="w-full whitespace-nowrap">
+      <div className="flex gap-2 pb-2">
+        <Button
+          variant={selected === null ? 'default' : 'outline'}
+          size="sm"
+          className="rounded-full"
+          onClick={() => onSelect(null)}
+        >
+          Tous
+        </Button>
+        {categories.map((cat) => (
+          <Button
+            key={cat.id}
+            variant={selected === cat.id ? 'default' : 'outline'}
+            size="sm"
+            className="rounded-full"
+            onClick={() => onSelect(cat.id)}
+          >
+            {cat.nom}
+          </Button>
+        ))}
+      </div>
+      <ScrollBar orientation="horizontal" />
+    </ScrollArea>
+  );
+};
diff --git a/src/components/storefront/CheckoutMobileForm.tsx b/src/components/storefront/CheckoutMobileForm.tsx
new file mode 100644
index 0000000..610147d
--- /dev/null
+++ b/src/components/storefront/CheckoutMobileForm.tsx
@@ -0,0 +1,168 @@
+// src/components/storefront/CheckoutMobileForm.tsx
+import { useForm } from 'react-hook-form';
+import { zodResolver } from '@hookform/resolvers/zod';
+import { z } from 'zod';
+import { Button } from '@/components/ui/button';
+import { Input } from '@/components/ui/input';
+import { Label } from '@/components/ui/label';
+import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
+import { CartItem, ModeLivraison, StoreFront } from '@/types';
+import { Loader2, MessageCircle } from 'lucide-react';
+
+const schema = z.object({
+  modeLivraison: z.nativeEnum(ModeLivraison),
+  telephoneLivraison: z.string().min(8, 'Téléphone requis'),
+  adresseLivraison: z.string().optional(),
+  nomClient: z.string().optional(),
+}).refine((data) => {
+  if (data.modeLivraison === ModeLivraison.LIVRAISON) {
+    return !!data.adresseLivraison && data.adresseLivraison.length > 0;
+  }
+  return true;
+}, { message: 'Adresse requise pour la livraison', path: ['adresseLivraison'] });
+
+type FormData = z.infer<typeof schema>;
+
+interface CheckoutMobileFormProps {
+  storefront: StoreFront;
+  items: CartItem[];
+  subtotal: number;
+  onSubmit: (data: FormData) => void;
+  isLoading: boolean;
+  defaultValues?: Partial<FormData>;
+}
+
+const formatPrix = (prix: number) => {
+  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
+};
+
+export const CheckoutMobileForm = ({
+  storefront,
+  items,
+  subtotal,
+  onSubmit,
+  isLoading,
+  defaultValues,
+}: CheckoutMobileFormProps) => {
+  const form = useForm<FormData>({
+    resolver: zodResolver(schema),
+    defaultValues: {
+      modeLivraison: ModeLivraison.LIVRAISON,
+      telephoneLivraison: '',
+      adresseLivraison: '',
+      nomClient: '',
+      ...defaultValues,
+    },
+  });
+
+  const modeLivraison = form.watch('modeLivraison');
+  const fraisLivraison = modeLivraison === ModeLivraison.LIVRAISON ? storefront.fraisLivraison : 0;
+  const total = subtotal + fraisLivraison;
+
+  return (
+    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
+      {/* Mode de livraison */}
+      <div className="space-y-3">
+        <Label className="text-base font-semibold">Mode de livraison</Label>
+        <RadioGroup
+          value={modeLivraison}
+          onValueChange={(v) => form.setValue('modeLivraison', v as ModeLivraison)}
+          className="space-y-2"
+        >
+          <div className="flex items-center space-x-3 p-3 border rounded-lg">
+            <RadioGroupItem value={ModeLivraison.LIVRAISON} id="livraison" />
+            <Label htmlFor="livraison" className="flex-1 cursor-pointer">
+              <span className="font-medium">Livraison à domicile</span>
+              <span className="block text-sm text-muted-foreground">
+                {formatPrix(storefront.fraisLivraison)}
+              </span>
+            </Label>
+          </div>
+          <div className="flex items-center space-x-3 p-3 border rounded-lg">
+            <RadioGroupItem value={ModeLivraison.RETRAIT_BOUTIQUE} id="retrait" />
+            <Label htmlFor="retrait" className="flex-1 cursor-pointer">
+              <span className="font-medium">Retrait en boutique</span>
+              <span className="block text-sm text-muted-foreground">Gratuit</span>
+            </Label>
+          </div>
+        </RadioGroup>
+      </div>
+
+      {/* Coordonnées */}
+      <div className="space-y-4">
+        <Label className="text-base font-semibold">Vos coordonnées</Label>
+
+        <div>
+          <Label htmlFor="nomClient">Votre nom</Label>
+          <Input
+            id="nomClient"
+            placeholder="Nom complet"
+            className="h-12 mt-1"
+            {...form.register('nomClient')}
+          />
+        </div>
+
+        <div>
+          <Label htmlFor="telephoneLivraison">Téléphone *</Label>
+          <Input
+            id="telephoneLivraison"
+            type="tel"
+            placeholder="+224 6XX XXX XXX"
+            className="h-12 mt-1"
+            {...form.register('telephoneLivraison')}
+          />
+          {form.formState.errors.telephoneLivraison && (
+            <p className="text-sm text-destructive mt-1">
+              {form.formState.errors.telephoneLivraison.message}
+            </p>
+          )}
+        </div>
+
+        {modeLivraison === ModeLivraison.LIVRAISON && (
+          <div>
+            <Label htmlFor="adresseLivraison">Adresse de livraison *</Label>
+            <Input
+              id="adresseLivraison"
+              placeholder="Quartier, rue, repère..."
+              className="h-12 mt-1"
+              {...form.register('adresseLivraison')}
+            />
+            {form.formState.errors.adresseLivraison && (
+              <p className="text-sm text-destructive mt-1">
+                {form.formState.errors.adresseLivraison.message}
+              </p>
+            )}
+          </div>
+        )}
+      </div>
+
+      {/* Récapitulatif */}
+      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
+        <h3 className="font-semibold">Récapitulatif</h3>
+        <div className="flex justify-between text-sm">
+          <span>{items.length} article{items.length > 1 ? 's' : ''}</span>
+          <span>{formatPrix(subtotal)}</span>
+        </div>
+        <div className="flex justify-between text-sm">
+          <span>Livraison</span>
+          <span>{formatPrix(fraisLivraison)}</span>
+        </div>
+        <div className="flex justify-between text-lg font-bold pt-2 border-t">
+          <span>Total</span>
+          <span className="text-primary">{formatPrix(total)}</span>
+        </div>
+      </div>
+
+      <Button type="submit" className="w-full h-14 text-base" disabled={isLoading}>
+        {isLoading ? (
+          <Loader2 className="h-5 w-5 animate-spin" />
+        ) : (
+          <>
+            <MessageCircle className="h-5 w-5 mr-2" />
+            Valider et envoyer
+          </>
+        )}
+      </Button>
+    </form>
+  );
+};
diff --git a/src/components/storefront/ProductGrid.tsx b/src/components/storefront/ProductGrid.tsx
new file mode 100644
index 0000000..1688f1e
--- /dev/null
+++ b/src/components/storefront/ProductGrid.tsx
@@ -0,0 +1,34 @@
+// src/components/storefront/ProductGrid.tsx
+import { StorefrontArticle } from '@/types';
+import { ProductMobileCard } from './ProductMobileCard';
+
+interface ProductGridProps {
+  articles: StorefrontArticle[];
+  onAddToCart: (article: StorefrontArticle) => void;
+  onProductClick: (articleId: string) => void;
+  formatPrix: (prix: number) => string;
+}
+
+export const ProductGrid = ({ articles, onAddToCart, onProductClick, formatPrix }: ProductGridProps) => {
+  if (articles.length === 0) {
+    return (
+      <div className="text-center py-12 text-muted-foreground">
+        Aucun produit trouvé
+      </div>
+    );
+  }
+
+  return (
+    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
+      {articles.map((article) => (
+        <ProductMobileCard
+          key={article.id}
+          article={article}
+          onAddToCart={onAddToCart}
+          onClick={() => onProductClick(article.id)}
+          formatPrix={formatPrix}
+        />
+      ))}
+    </div>
+  );
+};
diff --git a/src/components/storefront/ProductMobileCard.tsx b/src/components/storefront/ProductMobileCard.tsx
new file mode 100644
index 0000000..4839b6c
--- /dev/null
+++ b/src/components/storefront/ProductMobileCard.tsx
@@ -0,0 +1,61 @@
+// src/components/storefront/ProductMobileCard.tsx
+import { Card, CardContent } from '@/components/ui/card';
+import { Button } from '@/components/ui/button';
+import { StorefrontArticle } from '@/types';
+import { ShoppingCart, ImageOff } from 'lucide-react';
+import { getPhotoUrl } from '@/lib/api-client';
+
+interface ProductMobileCardProps {
+  article: StorefrontArticle;
+  onAddToCart: (article: StorefrontArticle) => void;
+  onClick: () => void;
+  formatPrix: (prix: number) => string;
+}
+
+export const ProductMobileCard = ({ article, onAddToCart, onClick, formatPrix }: ProductMobileCardProps) => {
+  const photoUrl = getPhotoUrl(article.photo);
+  const isOutOfStock = article.stock <= 0;
+
+  return (
+    <Card className="overflow-hidden" onClick={onClick}>
+      <CardContent className="p-0">
+        {/* Image */}
+        <div className="aspect-[4/3] bg-muted relative">
+          {photoUrl ? (
+            <img src={photoUrl} alt={article.nom} className="w-full h-full object-cover" />
+          ) : (
+            <div className="w-full h-full flex items-center justify-center">
+              <ImageOff className="h-12 w-12 text-muted-foreground/50" />
+            </div>
+          )}
+          {isOutOfStock && (
+            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
+              <span className="text-sm font-medium text-muted-foreground">Rupture de stock</span>
+            </div>
+          )}
+        </div>
+
+        {/* Infos */}
+        <div className="p-4">
+          <h3 className="font-medium text-sm line-clamp-2 mb-1">{article.nom}</h3>
+          <p className="text-lg font-bold text-primary mb-1">{formatPrix(article.prixEnLigne)}</p>
+          {!isOutOfStock && (
+            <p className="text-xs text-muted-foreground mb-3">Stock: {article.stock} disponibles</p>
+          )}
+
+          <Button
+            className="w-full h-12"
+            disabled={isOutOfStock}
+            onClick={(e) => {
+              e.stopPropagation();
+              onAddToCart(article);
+            }}
+          >
+            <ShoppingCart className="h-4 w-4 mr-2" />
+            Ajouter au panier
+          </Button>
+        </div>
+      </CardContent>
+    </Card>
+  );
+};
diff --git a/src/components/storefront/StorefrontHeader.tsx b/src/components/storefront/StorefrontHeader.tsx
new file mode 100644
index 0000000..8187095
--- /dev/null
+++ b/src/components/storefront/StorefrontHeader.tsx
@@ -0,0 +1,74 @@
+// src/components/storefront/StorefrontHeader.tsx
+import { Menu, ShoppingCart } from 'lucide-react';
+import { Button } from '@/components/ui/button';
+import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
+import { StoreFront } from '@/types';
+
+interface StorefrontHeaderProps {
+  storefront: StoreFront;
+  cartCount: number;
+  onCartClick: () => void;
+}
+
+export const StorefrontHeader = ({ storefront, cartCount, onCartClick }: StorefrontHeaderProps) => {
+  return (
+    <header className="sticky top-0 z-50 bg-background border-b">
+      <div className="flex items-center justify-between h-14 px-4">
+        {/* Menu */}
+        <Sheet>
+          <SheetTrigger asChild>
+            <Button variant="ghost" size="icon" className="h-10 w-10">
+              <Menu className="h-5 w-5" />
+            </Button>
+          </SheetTrigger>
+          <SheetContent side="left" className="w-[280px]">
+            <SheetHeader>
+              <SheetTitle>{storefront.organizationName}</SheetTitle>
+            </SheetHeader>
+            <div className="mt-6 space-y-4">
+              {storefront.description && (
+                <p className="text-sm text-muted-foreground">{storefront.description}</p>
+              )}
+              {storefront.horaires && (
+                <div>
+                  <p className="text-sm font-medium">Horaires</p>
+                  <p className="text-sm text-muted-foreground">{storefront.horaires}</p>
+                </div>
+              )}
+              {storefront.adresse && (
+                <div>
+                  <p className="text-sm font-medium">Adresse</p>
+                  <p className="text-sm text-muted-foreground">{storefront.adresse}</p>
+                </div>
+              )}
+              {storefront.whatsappNumber && (
+                <Button
+                  variant="outline"
+                  className="w-full"
+                  onClick={() => window.open(`https://wa.me/${storefront.whatsappNumber}`, '_blank')}
+                >
+                  Nous contacter
+                </Button>
+              )}
+            </div>
+          </SheetContent>
+        </Sheet>
+
+        {/* Logo/Nom */}
+        <div className="flex-1 text-center">
+          <h1 className="text-lg font-bold truncate">{storefront.organizationName}</h1>
+        </div>
+
+        {/* Panier */}
+        <Button variant="ghost" size="icon" className="h-10 w-10 relative" onClick={onCartClick}>
+          <ShoppingCart className="h-5 w-5" />
+          {cartCount > 0 && (
+            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
+              {cartCount > 99 ? '99+' : cartCount}
+            </span>
+          )}
+        </Button>
+      </div>
+    </header>
+  );
+};
diff --git a/src/components/storefront/StorefrontLayout.tsx b/src/components/storefront/StorefrontLayout.tsx
new file mode 100644
index 0000000..c5fbfdc
--- /dev/null
+++ b/src/components/storefront/StorefrontLayout.tsx
@@ -0,0 +1,71 @@
+// src/components/storefront/StorefrontLayout.tsx
+import { ReactNode, useState } from 'react';
+import { useParams, useNavigate } from 'react-router-dom';
+import { StorefrontHeader } from './StorefrontHeader';
+import { CartDrawer } from './CartDrawer';
+import { useStorefront } from '@/hooks/useStorefront';
+import { useCart } from '@/hooks/useCart';
+import { Loader2 } from 'lucide-react';
+
+interface StorefrontLayoutProps {
+  children: ReactNode;
+}
+
+export const StorefrontLayout = ({ children }: StorefrontLayoutProps) => {
+  const { slug } = useParams<{ slug: string }>();
+  const navigate = useNavigate();
+  const [cartOpen, setCartOpen] = useState(false);
+
+  const { data: storefront, isLoading, error } = useStorefront(slug || '');
+  const { items, itemCount, subtotal, removeItem, updateQuantity } = useCart(slug || '');
+
+  if (isLoading) {
+    return (
+      <div className="min-h-screen flex items-center justify-center">
+        <Loader2 className="h-8 w-8 animate-spin text-primary" />
+      </div>
+    );
+  }
+
+  if (error || !storefront) {
+    return (
+      <div className="min-h-screen flex flex-col items-center justify-center p-4">
+        <h1 className="text-2xl font-bold mb-2">Boutique introuvable</h1>
+        <p className="text-muted-foreground">Cette boutique n'existe pas ou n'est plus disponible.</p>
+      </div>
+    );
+  }
+
+  if (!storefront.isActive) {
+    return (
+      <div className="min-h-screen flex flex-col items-center justify-center p-4">
+        <h1 className="text-2xl font-bold mb-2">Boutique fermée</h1>
+        <p className="text-muted-foreground">Cette boutique est temporairement indisponible.</p>
+      </div>
+    );
+  }
+
+  return (
+    <div className="min-h-screen bg-background">
+      <StorefrontHeader
+        storefront={storefront}
+        cartCount={itemCount}
+        onCartClick={() => setCartOpen(true)}
+      />
+      <main className="pb-20">{children}</main>
+      <CartDrawer
+        open={cartOpen}
+        onOpenChange={setCartOpen}
+        items={items}
+        subtotal={subtotal}
+        fraisLivraison={storefront.fraisLivraison}
+        onRemove={removeItem}
+        onUpdateQuantity={updateQuantity}
+        onCheckout={() => {
+          setCartOpen(false);
+          navigate(`/b/${slug}/checkout`);
+        }}
+      />
+    </div>
+  );
+};
diff --git a/src/components/storefront/StorefrontSearch.tsx b/src/components/storefront/StorefrontSearch.tsx
new file mode 100644
index 0000000..0e6681a
--- /dev/null
+++ b/src/components/storefront/StorefrontSearch.tsx
@@ -0,0 +1,23 @@
+// src/components/storefront/StorefrontSearch.tsx
+import { Search } from 'lucide-react';
+import { Input } from '@/components/ui/input';
+
+interface StorefrontSearchProps {
+  value: string;
+  onChange: (value: string) => void;
+}
+
+export const StorefrontSearch = ({ value, onChange }: StorefrontSearchProps) => {
+  return (
+    <div className="relative">
+      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
+      <Input
+        type="search"
+        placeholder="Rechercher un produit..."
+        value={value}
+        onChange={(e) => onChange(e.target.value)}
+        className="pl-10 h-12"
+      />
+    </div>
+  );
+};
diff --git a/src/contexts/CustomerAuthContext.tsx b/src/contexts/CustomerAuthContext.tsx
new file mode 100644
index 0000000..464c9f9
--- /dev/null
+++ b/src/contexts/CustomerAuthContext.tsx
@@ -0,0 +1,88 @@
+// src/contexts/CustomerAuthContext.tsx
+import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
+import { CustomerAccount, RegisterCustomerDto, LoginCustomerDto, UpdateCustomerDto } from '@/types';
+import { customerAuthApi } from '@/api/customer-auth';
+
+interface CustomerAuthContextType {
+  customer: CustomerAccount | null;
+  isAuthenticated: boolean;
+  isLoading: boolean;
+  login: (data: LoginCustomerDto) => Promise<void>;
+  register: (data: RegisterCustomerDto) => Promise<void>;
+  logout: () => void;
+  updateProfile: (data: UpdateCustomerDto) => Promise<void>;
+}
+
+const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);
+
+const STORAGE_KEYS = {
+  TOKEN: 'customer_token',
+  CUSTOMER: 'customer_data',
+};
+
+export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
+  const [customer, setCustomer] = useState<CustomerAccount | null>(() => {
+    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMER);
+    return stored ? JSON.parse(stored) : null;
+  });
+  const [isLoading, setIsLoading] = useState(false);
+
+  const isAuthenticated = !!customer && !!localStorage.getItem(STORAGE_KEYS.TOKEN);
+
+  useEffect(() => {
+    if (customer) {
+      localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(customer));
+    } else {
+      localStorage.removeItem(STORAGE_KEYS.CUSTOMER);
+    }
+  }, [customer]);
+
+  const login = async (data: LoginCustomerDto) => {
+    setIsLoading(true);
+    try {
+      const response = await customerAuthApi.login(data);
+      localStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token);
+      setCustomer(response.customer);
+    } finally {
+      setIsLoading(false);
+    }
+  };
+
+  const register = async (data: RegisterCustomerDto) => {
+    setIsLoading(true);
+    try {
+      const response = await customerAuthApi.register(data);
+      localStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token);
+      setCustomer(response.customer);
+    } finally {
+      setIsLoading(false);
+    }
+  };
+
+  const logout = () => {
+    localStorage.removeItem(STORAGE_KEYS.TOKEN);
+    localStorage.removeItem(STORAGE_KEYS.CUSTOMER);
+    setCustomer(null);
+  };
+
+  const updateProfile = async (data: UpdateCustomerDto) => {
+    const updated = await customerAuthApi.updateProfile(data);
+    setCustomer(updated);
+  };
+
+  return (
+    <CustomerAuthContext.Provider
+      value={{ customer, isAuthenticated, isLoading, login, register, logout, updateProfile }}
+    >
+      {children}
+    </CustomerAuthContext.Provider>
+  );
+};
+
+export const useCustomerAuth = () => {
+  const context = useContext(CustomerAuthContext);
+  if (context === undefined) {
+    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
+  }
+  return context;
+};
diff --git a/src/hooks/useCart.ts b/src/hooks/useCart.ts
new file mode 100644
index 0000000..475be54
--- /dev/null
+++ b/src/hooks/useCart.ts
@@ -0,0 +1,91 @@
+// src/hooks/useCart.ts
+import { useState, useEffect, useCallback } from 'react';
+import { CartItem, StorefrontArticle } from '@/types';
+
+const getStorageKey = (slug: string) => `cart_${slug}`;
+
+export const useCart = (slug: string) => {
+  const [items, setItems] = useState<CartItem[]>(() => {
+    if (!slug) return [];
+    const stored = localStorage.getItem(getStorageKey(slug));
+    return stored ? JSON.parse(stored) : [];
+  });
+
+  useEffect(() => {
+    if (!slug) return;
+    if (items.length > 0) {
+      localStorage.setItem(getStorageKey(slug), JSON.stringify(items));
+    } else {
+      localStorage.removeItem(getStorageKey(slug));
+    }
+  }, [items, slug]);
+
+  const addItem = useCallback((article: StorefrontArticle, quantity = 1, modeVente?: { id: string; nom: string; prix: number }) => {
+    setItems((prev) => {
+      const existing = prev.find((item) =>
+        modeVente ? item.articleId === article.id && item.modeVenteId === modeVente.id
+                 : item.articleId === article.id && !item.modeVenteId
+      );
+
+      if (existing) {
+        return prev.map((item) =>
+          (modeVente ? item.articleId === article.id && item.modeVenteId === modeVente.id
+                     : item.articleId === article.id && !item.modeVenteId)
+            ? { ...item, quantity: item.quantity + quantity }
+            : item
+        );
+      }
+
+      return [
+        ...prev,
+        {
+          articleId: article.id,
+          articleNom: article.nom,
+          articlePhoto: article.photo,
+          modeVenteId: modeVente?.id,
+          modeVenteNom: modeVente?.nom,
+          prixUnitaire: modeVente?.prix ?? article.prixEnLigne,
+          quantity,
+        },
+      ];
+    });
+  }, []);
+
+  const removeItem = useCallback((articleId: string, modeVenteId?: string) => {
+    setItems((prev) =>
+      prev.filter((item) =>
+        modeVenteId
+          ? !(item.articleId === articleId && item.modeVenteId === modeVenteId)
+          : !(item.articleId === articleId && !item.modeVenteId)
+      )
+    );
+  }, []);
+
+  const updateQuantity = useCallback((articleId: string, quantity: number, modeVenteId?: string) => {
+    if (quantity <= 0) {
+      removeItem(articleId, modeVenteId);
+      return;
+    }
+    setItems((prev) =>
+      prev.map((item) =>
+        (modeVenteId
+          ? item.articleId === articleId && item.modeVenteId === modeVenteId
+          : item.articleId === articleId && !item.modeVenteId)
+          ? { ...item, quantity }
+          : item
+      )
+    );
+  }, [removeItem]);
+
+  const clear = useCallback(() => {
+    setItems([]);
+    if (slug) {
+      localStorage.removeItem(getStorageKey(slug));
+    }
+  }, [slug]);
+
+  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
+  const subtotal = items.reduce((sum, item) => sum + item.prixUnitaire * item.quantity, 0);
+
+  return { items, itemCount, subtotal, addItem, removeItem, updateQuantity, clear };
+};
diff --git a/src/hooks/useOnlineOrders.ts b/src/hooks/useOnlineOrders.ts
new file mode 100644
index 0000000..d4bc779
--- /dev/null
+++ b/src/hooks/useOnlineOrders.ts
@@ -0,0 +1,124 @@
+// src/hooks/useOnlineOrders.ts
+import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
+import { onlineOrdersApi } from '@/api/online-orders';
+import { CreateOnlineOrderDto, OnlineOrderFilterParams } from '@/types';
+import { toast } from 'sonner';
+
+// Client hooks
+export const useCreateOrder = () => {
+  const queryClient = useQueryClient();
+  return useMutation({
+    mutationFn: (data: CreateOnlineOrderDto) => onlineOrdersApi.create(data),
+    onSuccess: () => {
+      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
+      toast.success('Commande envoyée avec succès');
+    },
+    onError: (error: any) => {
+      toast.error(error.response?.data?.message || 'Erreur lors de la commande');
+    },
+  });
+};
+
+export const useCustomerOrders = (params?: { page?: number; limit?: number }) => {
+  return useQuery({
+    queryKey: ['customer-orders', params],
+    queryFn: () => onlineOrdersApi.getMyOrders(params),
+    placeholderData: (prev) => prev,
+  });
+};
+
+export const useCustomerOrder = (id: string) => {
+  return useQuery({
+    queryKey: ['customer-order', id],
+    queryFn: () => onlineOrdersApi.getMyOrder(id),
+    enabled: !!id,
+  });
+};
+
+// Back-office hooks
+export const useOnlineOrders = (params?: OnlineOrderFilterParams) => {
+  return useQuery({
+    queryKey: ['online-orders', params],
+    queryFn: () => onlineOrdersApi.getAll(params),
+    placeholderData: (prev) => prev,
+  });
+};
+
+export const useOnlineOrder = (id: string) => {
+  return useQuery({
+    queryKey: ['online-order', id],
+    queryFn: () => onlineOrdersApi.getById(id),
+    enabled: !!id,
+  });
+};
+
+export const useConfirmOrder = () => {
+  const queryClient = useQueryClient();
+  return useMutation({
+    mutationFn: (id: string) => onlineOrdersApi.confirm(id),
+    onSuccess: () => {
+      queryClient.invalidateQueries({ queryKey: ['online-orders'] });
+      toast.success('Commande confirmée');
+    },
+    onError: (error: any) => {
+      toast.error(error.response?.data?.message || 'Erreur');
+    },
+  });
+};
+
+export const useMarkOrderReady = () => {
+  const queryClient = useQueryClient();
+  return useMutation({
+    mutationFn: (id: string) => onlineOrdersApi.markReady(id),
+    onSuccess: () => {
+      queryClient.invalidateQueries({ queryKey: ['online-orders'] });
+      toast.success('Commande marquée prête');
+    },
+    onError: (error: any) => {
+      toast.error(error.response?.data?.message || 'Erreur');
+    },
+  });
+};
+
+export const useMarkOrderDelivered = () => {
+  const queryClient = useQueryClient();
+  return useMutation({
+    mutationFn: (id: string) => onlineOrdersApi.markDelivered(id),
+    onSuccess: () => {
+      queryClient.invalidateQueries({ queryKey: ['online-orders'] });
+      toast.success('Commande livrée');
+    },
+    onError: (error: any) => {
+      toast.error(error.response?.data?.message || 'Erreur');
+    },
+  });
+};
+
+export const useCancelOrder = () => {
+  const queryClient = useQueryClient();
+  return useMutation({
+    mutationFn: ({ id, motif }: { id: string; motif: string }) => onlineOrdersApi.cancel(id, motif),
+    onSuccess: () => {
+      queryClient.invalidateQueries({ queryKey: ['online-orders'] });
+      toast.success('Commande annulée');
+    },
+    onError: (error: any) => {
+      toast.error(error.response?.data?.message || 'Erreur');
+    },
+  });
+};
+
+export const useOnlineOrderStats = () => {
+  return useQuery({
+    queryKey: ['online-orders-stats'],
+    queryFn: () => onlineOrdersApi.getStats(),
+  });
+};
+
+export const usePendingOrderCount = () => {
+  return useQuery({
+    queryKey: ['online-orders-pending-count'],
+    queryFn: () => onlineOrdersApi.getPendingCount(),
+    refetchInterval: 30000, // Refresh every 30s
+  });
+};
diff --git a/src/hooks/useStorefront.ts b/src/hooks/useStorefront.ts
new file mode 100644
index 0000000..1defcf0
--- /dev/null
+++ b/src/hooks/useStorefront.ts
@@ -0,0 +1,36 @@
+// src/hooks/useStorefront.ts
+import { useQuery } from '@tanstack/react-query';
+import { storefrontApi, StorefrontProductParams } from '@/api/storefront';
+
+export const useStorefront = (slug: string) => {
+  return useQuery({
+    queryKey: ['storefront', slug],
+    queryFn: () => storefrontApi.getBySlug(slug),
+    enabled: !!slug,
+  });
+};
+
+export const useStorefrontProducts = (slug: string, params?: StorefrontProductParams) => {
+  return useQuery({
+    queryKey: ['storefront-products', slug, params],
+    queryFn: () => storefrontApi.getProducts(slug, params),
+    enabled: !!slug,
+    placeholderData: (prev) => prev,
+  });
+};
+
+export const useStorefrontProduct = (slug: string, articleId: string) => {
+  return useQuery({
+    queryKey: ['storefront-product', slug, articleId],
+    queryFn: () => storefrontApi.getProduct(slug, articleId),
+    enabled: !!slug && !!articleId,
+  });
+};
+
+export const useStorefrontCategories = (slug: string) => {
+  return useQuery({
+    queryKey: ['storefront-categories', slug],
+    queryFn: () => storefrontApi.getCategories(slug),
+    enabled: !!slug,
+  });
+};
diff --git a/src/pages/OnlineOrders.tsx b/src/pages/OnlineOrders.tsx
new file mode 100644
index 0000000..4636526
--- /dev/null
+++ b/src/pages/OnlineOrders.tsx
@@ -0,0 +1,423 @@
+import { useState } from "react";
+import { useMediaQuery } from "@/hooks/useMediaQuery";
+import AppLayout from "@/components/AppLayout";
+import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
+import { Input } from "@/components/ui/input";
+import { Button } from "@/components/ui/button";
+import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
+import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
+import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
+import { Textarea } from "@/components/ui/textarea";
+import { Label } from "@/components/ui/label";
+import OnlineOrderMobileCard from "@/components/OnlineOrderMobileCard";
+import { useOnlineOrders, useConfirmOrder, useMarkOrderReady, useMarkOrderDelivered, useCancelOrder, useOnlineOrderStats } from "@/hooks/useOnlineOrders";
+import { OnlineOrder, OnlineOrderStatut } from "@/types";
+import { Search, Package, Clock, CheckCircle, Truck, XCircle, Loader2 } from "lucide-react";
+import { useDebounce } from "@/hooks/useDebounce";
+
+const formatPrix = (prix: number) => {
+  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
+};
+
+const formatDate = (date: string) => {
+  return new Date(date).toLocaleDateString('fr-FR', {
+    day: 'numeric',
+    month: 'short',
+    year: 'numeric',
+    hour: '2-digit',
+    minute: '2-digit',
+  });
+};
+
+const statutConfig: Record<OnlineOrderStatut, { label: string; className: string }> = {
+  [OnlineOrderStatut.EN_ATTENTE]: { label: 'En attente', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
+  [OnlineOrderStatut.CONFIRMEE]: { label: 'Confirmée', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
+  [OnlineOrderStatut.PRETE]: { label: 'Prête', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
+  [OnlineOrderStatut.LIVREE]: { label: 'Livrée', className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
+  [OnlineOrderStatut.ANNULEE]: { label: 'Annulée', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
+};
+
+const OnlineOrders = () => {
+  const isMobile = useMediaQuery("(max-width: 768px)");
+  const [search, setSearch] = useState("");
+  const [statutFilter, setStatutFilter] = useState<string>("all");
+  const [page, setPage] = useState(1);
+  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
+  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
+  const [cancelMotif, setCancelMotif] = useState("");
+  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
+
+  const debouncedSearch = useDebounce(search, 300);
+
+  const { data: ordersData, isLoading } = useOnlineOrders({
+    page,
+    limit: 20,
+    search: debouncedSearch || undefined,
+    statut: statutFilter !== "all" ? (statutFilter as OnlineOrderStatut) : undefined,
+  });
+
+  const { data: stats } = useOnlineOrderStats();
+
+  const confirmOrder = useConfirmOrder();
+  const markReady = useMarkOrderReady();
+  const markDelivered = useMarkOrderDelivered();
+  const cancelOrder = useCancelOrder();
+
+  const orders = ordersData?.data || [];
+  const meta = ordersData?.meta;
+
+  const handleConfirm = (id: string) => {
+    confirmOrder.mutate(id);
+  };
+
+  const handleMarkReady = (id: string) => {
+    markReady.mutate(id);
+  };
+
+  const handleMarkDelivered = (id: string) => {
+    markDelivered.mutate(id);
+  };
+
+  const handleCancelClick = (id: string) => {
+    setOrderToCancel(id);
+    setCancelDialogOpen(true);
+  };
+
+  const handleCancelConfirm = () => {
+    if (orderToCancel && cancelMotif) {
+      cancelOrder.mutate({ id: orderToCancel, motif: cancelMotif });
+      setCancelDialogOpen(false);
+      setCancelMotif("");
+      setOrderToCancel(null);
+    }
+  };
+
+  const handleViewDetails = (id: string) => {
+    const order = orders.find(o => o.id === id);
+    if (order) setSelectedOrder(order);
+  };
+
+  return (
+    <AppLayout>
+      <div className="space-y-6">
+        {/* Header */}
+        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
+          <div>
+            <h1 className="text-2xl font-bold">Commandes en ligne</h1>
+            <p className="text-muted-foreground">Gestion des commandes de la boutique en ligne</p>
+          </div>
+        </div>
+
+        {/* Stats */}
+        {stats && (
+          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
+            <Card>
+              <CardContent className="p-4">
+                <div className="flex items-center gap-2">
+                  <Clock className="h-5 w-5 text-orange-500" />
+                  <div>
+                    <p className="text-2xl font-bold">{stats.enAttente}</p>
+                    <p className="text-xs text-muted-foreground">En attente</p>
+                  </div>
+                </div>
+              </CardContent>
+            </Card>
+            <Card>
+              <CardContent className="p-4">
+                <div className="flex items-center gap-2">
+                  <CheckCircle className="h-5 w-5 text-blue-500" />
+                  <div>
+                    <p className="text-2xl font-bold">{stats.confirmees}</p>
+                    <p className="text-xs text-muted-foreground">Confirmées</p>
+                  </div>
+                </div>
+              </CardContent>
+            </Card>
+            <Card>
+              <CardContent className="p-4">
+                <div className="flex items-center gap-2">
+                  <Package className="h-5 w-5 text-green-500" />
+                  <div>
+                    <p className="text-2xl font-bold">{stats.pretes}</p>
+                    <p className="text-xs text-muted-foreground">Prêtes</p>
+                  </div>
+                </div>
+              </CardContent>
+            </Card>
+            <Card>
+              <CardContent className="p-4">
+                <div className="flex items-center gap-2">
+                  <Truck className="h-5 w-5 text-gray-500" />
+                  <div>
+                    <p className="text-2xl font-bold">{stats.livrees}</p>
+                    <p className="text-xs text-muted-foreground">Livrées</p>
+                  </div>
+                </div>
+              </CardContent>
+            </Card>
+            <Card>
+              <CardContent className="p-4">
+                <div className="flex items-center gap-2">
+                  <Package className="h-5 w-5 text-primary" />
+                  <div>
+                    <p className="text-2xl font-bold">{stats.total}</p>
+                    <p className="text-xs text-muted-foreground">Total</p>
+                  </div>
+                </div>
+              </CardContent>
+            </Card>
+          </div>
+        )}
+
+        {/* Filtres */}
+        <div className="flex flex-col sm:flex-row gap-4">
+          <div className="relative flex-1">
+            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
+            <Input
+              placeholder="Rechercher par numéro, client..."
+              value={search}
+              onChange={(e) => setSearch(e.target.value)}
+              className="pl-10"
+            />
+          </div>
+          <Select value={statutFilter} onValueChange={setStatutFilter}>
+            <SelectTrigger className="w-full sm:w-48">
+              <SelectValue placeholder="Tous les statuts" />
+            </SelectTrigger>
+            <SelectContent>
+              <SelectItem value="all">Tous les statuts</SelectItem>
+              <SelectItem value={OnlineOrderStatut.EN_ATTENTE}>En attente</SelectItem>
+              <SelectItem value={OnlineOrderStatut.CONFIRMEE}>Confirmée</SelectItem>
+              <SelectItem value={OnlineOrderStatut.PRETE}>Prête</SelectItem>
+              <SelectItem value={OnlineOrderStatut.LIVREE}>Livrée</SelectItem>
+              <SelectItem value={OnlineOrderStatut.ANNULEE}>Annulée</SelectItem>
+            </SelectContent>
+          </Select>
+        </div>
+
+        {/* Liste */}
+        {isLoading ? (
+          <div className="flex justify-center py-12">
+            <Loader2 className="h-8 w-8 animate-spin text-primary" />
+          </div>
+        ) : orders.length === 0 ? (
+          <Card>
+            <CardContent className="py-12 text-center">
+              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
+              <p className="text-muted-foreground">Aucune commande trouvée</p>
+            </CardContent>
+          </Card>
+        ) : isMobile ? (
+          <div className="space-y-4">
+            {orders.map((order) => (
+              <OnlineOrderMobileCard
+                key={order.id}
+                order={order}
+                onConfirm={handleConfirm}
+                onMarkReady={handleMarkReady}
+                onMarkDelivered={handleMarkDelivered}
+                onCancel={handleCancelClick}
+                onViewDetails={handleViewDetails}
+                formatPrix={formatPrix}
+                formatDate={formatDate}
+              />
+            ))}
+          </div>
+        ) : (
+          <Card>
+            <CardContent className="p-0">
+              <Table>
+                <TableHeader>
+                  <TableRow>
+                    <TableHead>Numéro</TableHead>
+                    <TableHead>Client</TableHead>
+                    <TableHead>Date</TableHead>
+                    <TableHead>Livraison</TableHead>
+                    <TableHead>Articles</TableHead>
+                    <TableHead>Total</TableHead>
+                    <TableHead>Statut</TableHead>
+                    <TableHead className="text-right">Actions</TableHead>
+                  </TableRow>
+                </TableHeader>
+                <TableBody>
+                  {orders.map((order) => (
+                    <TableRow key={order.id}>
+                      <TableCell className="font-medium">{order.numero}</TableCell>
+                      <TableCell>
+                        <div>
+                          <p>{order.clientNom || 'Anonyme'}</p>
+                          <p className="text-xs text-muted-foreground">{order.telephoneLivraison}</p>
+                        </div>
+                      </TableCell>
+                      <TableCell>{formatDate(order.createdAt)}</TableCell>
+                      <TableCell>
+                        {order.modeLivraison === 'LIVRAISON' ? 'Livraison' : 'Retrait'}
+                      </TableCell>
+                      <TableCell>{order.items.length}</TableCell>
+                      <TableCell className="font-semibold">{formatPrix(order.total)}</TableCell>
+                      <TableCell>
+                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statutConfig[order.statut].className}`}>
+                          {statutConfig[order.statut].label}
+                        </span>
+                      </TableCell>
+                      <TableCell className="text-right">
+                        <div className="flex justify-end gap-2">
+                          {order.statut === OnlineOrderStatut.EN_ATTENTE && (
+                            <Button size="sm" onClick={() => handleConfirm(order.id)}>
+                              Confirmer
+                            </Button>
+                          )}
+                          {order.statut === OnlineOrderStatut.CONFIRMEE && (
+                            <Button size="sm" onClick={() => handleMarkReady(order.id)}>
+                              Prête
+                            </Button>
+                          )}
+                          {order.statut === OnlineOrderStatut.PRETE && (
+                            <Button size="sm" onClick={() => handleMarkDelivered(order.id)}>
+                              Livrée
+                            </Button>
+                          )}
+                          <Button size="sm" variant="outline" onClick={() => handleViewDetails(order.id)}>
+                            Détails
+                          </Button>
+                        </div>
+                      </TableCell>
+                    </TableRow>
+                  ))}
+                </TableBody>
+              </Table>
+            </CardContent>
+          </Card>
+        )}
+
+        {/* Pagination */}
+        {meta && meta.totalPages > 1 && (
+          <div className="flex justify-center gap-2">
+            <Button
+              variant="outline"
+              disabled={page === 1}
+              onClick={() => setPage(page - 1)}
+            >
+              Précédent
+            </Button>
+            <span className="flex items-center px-4">
+              Page {page} / {meta.totalPages}
+            </span>
+            <Button
+              variant="outline"
+              disabled={page === meta.totalPages}
+              onClick={() => setPage(page + 1)}
+            >
+              Suivant
+            </Button>
+          </div>
+        )}
+      </div>
+
+      {/* Cancel Dialog */}
+      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
+        <DialogContent>
+          <DialogHeader>
+            <DialogTitle>Annuler la commande</DialogTitle>
+          </DialogHeader>
+          <div className="space-y-4">
+            <div>
+              <Label htmlFor="motif">Motif d'annulation *</Label>
+              <Textarea
+                id="motif"
+                placeholder="Raison de l'annulation..."
+                value={cancelMotif}
+                onChange={(e) => setCancelMotif(e.target.value)}
+                className="mt-1"
+              />
+            </div>
+          </div>
+          <DialogFooter>
+            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
+              Annuler
+            </Button>
+            <Button
+              variant="destructive"
+              onClick={handleCancelConfirm}
+              disabled={!cancelMotif || cancelOrder.isPending}
+            >
+              {cancelOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmer l\'annulation'}
+            </Button>
+          </DialogFooter>
+        </DialogContent>
+      </Dialog>
+
+      {/* Order Details Dialog */}
+      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
+        <DialogContent className="max-w-2xl">
+          <DialogHeader>
+            <DialogTitle>Détails de la commande {selectedOrder?.numero}</DialogTitle>
+          </DialogHeader>
+          {selectedOrder && (
+            <div className="space-y-4">
+              <div className="grid grid-cols-2 gap-4">
+                <div>
+                  <p className="text-sm text-muted-foreground">Client</p>
+                  <p className="font-medium">{selectedOrder.clientNom || 'Anonyme'}</p>
+                </div>
+                <div>
+                  <p className="text-sm text-muted-foreground">Téléphone</p>
+                  <p className="font-medium">{selectedOrder.telephoneLivraison}</p>
+                </div>
+                <div>
+                  <p className="text-sm text-muted-foreground">Mode de livraison</p>
+                  <p className="font-medium">
+                    {selectedOrder.modeLivraison === 'LIVRAISON' ? 'Livraison à domicile' : 'Retrait en boutique'}
+                  </p>
+                </div>
+                {selectedOrder.adresseLivraison && (
+                  <div>
+                    <p className="text-sm text-muted-foreground">Adresse</p>
+                    <p className="font-medium">{selectedOrder.adresseLivraison}</p>
+                  </div>
+                )}
+              </div>
+
+              <div>
+                <p className="text-sm text-muted-foreground mb-2">Articles</p>
+                <div className="border rounded-lg divide-y">
+                  {selectedOrder.items.map((item) => (
+                    <div key={item.id} className="p-3 flex justify-between">
+                      <div>
+                        <p className="font-medium">{item.articleNom}</p>
+                        {item.modeVenteNom && (
+                          <p className="text-xs text-muted-foreground">{item.modeVenteNom}</p>
+                        )}
+                        <p className="text-sm text-muted-foreground">
+                          {formatPrix(item.prixUnitaire)} × {item.quantite}
+                        </p>
+                      </div>
+                      <p className="font-semibold">{formatPrix(item.sousTotal)}</p>
+                    </div>
+                  ))}
+                </div>
+              </div>
+
+              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
+                <div className="flex justify-between">
+                  <span>Sous-total</span>
+                  <span>{formatPrix(selectedOrder.sousTotal)}</span>
+                </div>
+                <div className="flex justify-between">
+                  <span>Frais de livraison</span>
+                  <span>{formatPrix(selectedOrder.fraisLivraison)}</span>
+                </div>
+                <div className="flex justify-between text-lg font-bold pt-2 border-t">
+                  <span>Total</span>
+                  <span className="text-primary">{formatPrix(selectedOrder.total)}</span>
+                </div>
+              </div>
+            </div>
+          )}
+        </DialogContent>
+      </Dialog>
+    </AppLayout>
+  );
+};
+
+export default OnlineOrders;
diff --git a/src/pages/customer/CustomerLogin.tsx b/src/pages/customer/CustomerLogin.tsx
new file mode 100644
index 0000000..5dded64
--- /dev/null
+++ b/src/pages/customer/CustomerLogin.tsx
@@ -0,0 +1,89 @@
+// src/pages/customer/CustomerLogin.tsx
+import { useState } from 'react';
+import { useNavigate, useSearchParams, Link } from 'react-router-dom';
+import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
+import { Button } from '@/components/ui/button';
+import { Input } from '@/components/ui/input';
+import { Label } from '@/components/ui/label';
+import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
+import { Loader2, ArrowLeft } from 'lucide-react';
+import { toast } from 'sonner';
+
+const CustomerLogin = () => {
+  const navigate = useNavigate();
+  const [searchParams] = useSearchParams();
+  const redirect = searchParams.get('redirect') || '/customer/orders';
+  const { login, isLoading } = useCustomerAuth();
+
+  const [telephone, setTelephone] = useState('');
+  const [password, setPassword] = useState('');
+
+  const handleSubmit = async (e: React.FormEvent) => {
+    e.preventDefault();
+    try {
+      await login({ telephone, password });
+      toast.success('Connexion réussie');
+      navigate(redirect);
+    } catch (error: any) {
+      toast.error(error.response?.data?.message || 'Identifiants incorrects');
+    }
+  };
+
+  return (
+    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
+      <Card className="w-full max-w-md">
+        <CardHeader>
+          <Button
+            variant="ghost"
+            size="sm"
+            className="w-fit mb-2"
+            onClick={() => navigate(-1)}
+          >
+            <ArrowLeft className="h-4 w-4 mr-2" />
+            Retour
+          </Button>
+          <CardTitle className="text-2xl">Connexion client</CardTitle>
+        </CardHeader>
+        <CardContent>
+          <form onSubmit={handleSubmit} className="space-y-4">
+            <div>
+              <Label htmlFor="telephone">Téléphone</Label>
+              <Input
+                id="telephone"
+                type="tel"
+                placeholder="+224 6XX XXX XXX"
+                value={telephone}
+                onChange={(e) => setTelephone(e.target.value)}
+                className="h-12 mt-1"
+                required
+              />
+            </div>
+            <div>
+              <Label htmlFor="password">Mot de passe</Label>
+              <Input
+                id="password"
+                type="password"
+                value={password}
+                onChange={(e) => setPassword(e.target.value)}
+                className="h-12 mt-1"
+                required
+              />
+            </div>
+            <Button type="submit" className="w-full h-12" disabled={isLoading}>
+              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Se connecter'}
+            </Button>
+          </form>
+
+          <p className="text-center text-sm text-muted-foreground mt-6">
+            Pas encore de compte ?{' '}
+            <Link to="/customer/register" className="text-primary font-medium">
+              S'inscrire
+            </Link>
+          </p>
+        </CardContent>
+      </Card>
+    </div>
+  );
+};
+
+export default CustomerLogin;
diff --git a/src/pages/customer/CustomerOrderDetail.tsx b/src/pages/customer/CustomerOrderDetail.tsx
new file mode 100644
index 0000000..4bc0cd0
--- /dev/null
+++ b/src/pages/customer/CustomerOrderDetail.tsx
@@ -0,0 +1,146 @@
+// src/pages/customer/CustomerOrderDetail.tsx
+import { useParams, useNavigate } from 'react-router-dom';
+import { useCustomerOrder } from '@/hooks/useOnlineOrders';
+import { CustomerNavbar } from '@/components/customer/CustomerNavbar';
+import { Button } from '@/components/ui/button';
+import { Card, CardContent } from '@/components/ui/card';
+import { ArrowLeft, Loader2, Package, Calendar, MapPin, Phone } from 'lucide-react';
+import { OnlineOrderStatut } from '@/types';
+
+const formatPrix = (prix: number) => {
+  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
+};
+
+const formatDate = (date: string) => {
+  return new Date(date).toLocaleDateString('fr-FR', {
+    day: 'numeric',
+    month: 'long',
+    year: 'numeric',
+    hour: '2-digit',
+    minute: '2-digit',
+  });
+};
+
+const statutConfig: Record<OnlineOrderStatut, { label: string; className: string }> = {
+  [OnlineOrderStatut.EN_ATTENTE]: { label: 'En attente', className: 'bg-orange-100 text-orange-700' },
+  [OnlineOrderStatut.CONFIRMEE]: { label: 'Confirmée', className: 'bg-blue-100 text-blue-700' },
+  [OnlineOrderStatut.PRETE]: { label: 'Prête', className: 'bg-green-100 text-green-700' },
+  [OnlineOrderStatut.LIVREE]: { label: 'Livrée', className: 'bg-gray-100 text-gray-700' },
+  [OnlineOrderStatut.ANNULEE]: { label: 'Annulée', className: 'bg-red-100 text-red-700' },
+};
+
+const CustomerOrderDetail = () => {
+  const { id } = useParams<{ id: string }>();
+  const navigate = useNavigate();
+  const { data: order, isLoading } = useCustomerOrder(id || '');
+
+  if (isLoading) {
+    return (
+      <div className="min-h-screen flex items-center justify-center">
+        <Loader2 className="h-8 w-8 animate-spin text-primary" />
+      </div>
+    );
+  }
+
+  if (!order) {
+    return (
+      <div className="min-h-screen flex flex-col items-center justify-center p-4">
+        <p className="text-muted-foreground mb-4">Commande introuvable</p>
+        <Button onClick={() => navigate('/customer/orders')}>Retour</Button>
+      </div>
+    );
+  }
+
+  const statut = statutConfig[order.statut];
+
+  return (
+    <div className="min-h-screen bg-background pb-20">
+      <header className="sticky top-0 z-40 bg-background border-b">
+        <div className="flex items-center h-14 px-4 gap-3">
+          <Button variant="ghost" size="icon" onClick={() => navigate('/customer/orders')}>
+            <ArrowLeft className="h-5 w-5" />
+          </Button>
+          <h1 className="text-lg font-bold">{order.numero}</h1>
+        </div>
+      </header>
+
+      <div className="p-4 space-y-4">
+        {/* Statut */}
+        <div className="flex items-center justify-between">
+          <span className="text-sm text-muted-foreground">Statut</span>
+          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statut.className}`}>
+            {statut.label}
+          </span>
+        </div>
+
+        {/* Infos */}
+        <Card>
+          <CardContent className="p-4 space-y-3">
+            <div className="flex items-center gap-2">
+              <Calendar className="h-4 w-4 text-muted-foreground" />
+              <span className="text-sm">{formatDate(order.createdAt)}</span>
+            </div>
+            <div className="flex items-center gap-2">
+              <MapPin className="h-4 w-4 text-muted-foreground" />
+              <span className="text-sm">
+                {order.modeLivraison === 'LIVRAISON' ? order.adresseLivraison : 'Retrait en boutique'}
+              </span>
+            </div>
+            <div className="flex items-center gap-2">
+              <Phone className="h-4 w-4 text-muted-foreground" />
+              <span className="text-sm">{order.telephoneLivraison}</span>
+            </div>
+          </CardContent>
+        </Card>
+
+        {/* Articles */}
+        <Card>
+          <CardContent className="p-4">
+            <h3 className="font-semibold mb-3 flex items-center gap-2">
+              <Package className="h-4 w-4" />
+              Articles ({order.items.length})
+            </h3>
+            <div className="space-y-3">
+              {order.items.map((item) => (
+                <div key={item.id} className="flex justify-between text-sm">
+                  <div>
+                    <p className="font-medium">{item.articleNom}</p>
+                    {item.modeVenteNom && (
+                      <p className="text-xs text-muted-foreground">{item.modeVenteNom}</p>
+                    )}
+                    <p className="text-muted-foreground">
+                      {formatPrix(item.prixUnitaire)} × {item.quantite}
+                    </p>
+                  </div>
+                  <span className="font-medium">{formatPrix(item.sousTotal)}</span>
+                </div>
+              ))}
+            </div>
+          </CardContent>
+        </Card>
+
+        {/* Totaux */}
+        <Card>
+          <CardContent className="p-4 space-y-2">
+            <div className="flex justify-between text-sm">
+              <span>Sous-total</span>
+              <span>{formatPrix(order.sousTotal)}</span>
+            </div>
+            <div className="flex justify-between text-sm">
+              <span>Livraison</span>
+              <span>{formatPrix(order.fraisLivraison)}</span>
+            </div>
+            <div className="flex justify-between text-lg font-bold pt-2 border-t">
+              <span>Total</span>
+              <span className="text-primary">{formatPrix(order.total)}</span>
+            </div>
+          </CardContent>
+        </Card>
+      </div>
+
+      <CustomerNavbar />
+    </div>
+  );
+};
+
+export default CustomerOrderDetail;
diff --git a/src/pages/customer/CustomerOrders.tsx b/src/pages/customer/CustomerOrders.tsx
new file mode 100644
index 0000000..4e90188
--- /dev/null
+++ b/src/pages/customer/CustomerOrders.tsx
@@ -0,0 +1,72 @@
+// src/pages/customer/CustomerOrders.tsx
+import { useNavigate } from 'react-router-dom';
+import { useCustomerOrders } from '@/hooks/useOnlineOrders';
+import { CustomerOrderMobileCard } from '@/components/customer/CustomerOrderMobileCard';
+import { CustomerNavbar } from '@/components/customer/CustomerNavbar';
+import { Button } from '@/components/ui/button';
+import { Loader2, Package, LogOut } from 'lucide-react';
+import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
+
+const formatPrix = (prix: number) => {
+  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
+};
+
+const formatDate = (date: string) => {
+  return new Date(date).toLocaleDateString('fr-FR', {
+    day: 'numeric',
+    month: 'long',
+    year: 'numeric',
+  });
+};
+
+const CustomerOrders = () => {
+  const navigate = useNavigate();
+  const { logout } = useCustomerAuth();
+  const { data, isLoading } = useCustomerOrders();
+
+  const orders = data?.data || [];
+
+  return (
+    <div className="min-h-screen bg-background pb-20">
+      {/* Header */}
+      <header className="sticky top-0 z-40 bg-background border-b">
+        <div className="flex items-center justify-between h-14 px-4">
+          <h1 className="text-lg font-bold">Mes commandes</h1>
+          <Button variant="ghost" size="icon" onClick={() => { logout(); navigate('/'); }}>
+            <LogOut className="h-5 w-5" />
+          </Button>
+        </div>
+      </header>
+
+      {/* Content */}
+      <div className="p-4">
+        {isLoading ? (
+          <div className="flex justify-center py-12">
+            <Loader2 className="h-8 w-8 animate-spin text-primary" />
+          </div>
+        ) : orders.length === 0 ? (
+          <div className="text-center py-12">
+            <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
+            <p className="text-muted-foreground">Aucune commande pour le moment</p>
+          </div>
+        ) : (
+          <div className="space-y-4">
+            {orders.map((order) => (
+              <CustomerOrderMobileCard
+                key={order.id}
+                order={order}
+                onViewDetails={() => navigate(`/customer/orders/${order.id}`)}
+                formatPrix={formatPrix}
+                formatDate={formatDate}
+              />
+            ))}
+          </div>
+        )}
+      </div>
+
+      <CustomerNavbar />
+    </div>
+  );
+};
+
+export default CustomerOrders;
diff --git a/src/pages/customer/CustomerProfile.tsx b/src/pages/customer/CustomerProfile.tsx
new file mode 100644
index 0000000..70534ad
--- /dev/null
+++ b/src/pages/customer/CustomerProfile.tsx
@@ -0,0 +1,108 @@
+// src/pages/customer/CustomerProfile.tsx
+import { useState } from 'react';
+import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
+import { CustomerNavbar } from '@/components/customer/CustomerNavbar';
+import { Button } from '@/components/ui/button';
+import { Input } from '@/components/ui/input';
+import { Label } from '@/components/ui/label';
+import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
+import { Loader2, Save, LogOut } from 'lucide-react';
+import { toast } from 'sonner';
+import { useNavigate } from 'react-router-dom';
+
+const CustomerProfile = () => {
+  const navigate = useNavigate();
+  const { customer, updateProfile, logout } = useCustomerAuth();
+  const [saving, setSaving] = useState(false);
+  const [form, setForm] = useState({
+    nom: customer?.nom || '',
+    email: customer?.email || '',
+  });
+
+  const handleSubmit = async (e: React.FormEvent) => {
+    e.preventDefault();
+    setSaving(true);
+    try {
+      await updateProfile(form);
+      toast.success('Profil mis à jour');
+    } catch (error: any) {
+      toast.error(error.response?.data?.message || 'Erreur');
+    } finally {
+      setSaving(false);
+    }
+  };
+
+  const handleLogout = () => {
+    logout();
+    navigate('/');
+  };
+
+  return (
+    <div className="min-h-screen bg-background pb-20">
+      <header className="sticky top-0 z-40 bg-background border-b">
+        <div className="flex items-center justify-between h-14 px-4">
+          <h1 className="text-lg font-bold">Mon profil</h1>
+        </div>
+      </header>
+
+      <div className="p-4 space-y-4">
+        <Card>
+          <CardHeader>
+            <CardTitle>Informations personnelles</CardTitle>
+          </CardHeader>
+          <CardContent>
+            <form onSubmit={handleSubmit} className="space-y-4">
+              <div>
+                <Label htmlFor="nom">Nom</Label>
+                <Input
+                  id="nom"
+                  value={form.nom}
+                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
+                  className="h-12 mt-1"
+                />
+              </div>
+              <div>
+                <Label htmlFor="telephone">Téléphone</Label>
+                <Input
+                  id="telephone"
+                  value={customer?.telephone || ''}
+                  disabled
+                  className="h-12 mt-1 bg-muted"
+                />
+                <p className="text-xs text-muted-foreground mt-1">
+                  Le téléphone ne peut pas être modifié
+                </p>
+              </div>
+              <div>
+                <Label htmlFor="email">Email</Label>
+                <Input
+                  id="email"
+                  type="email"
+                  value={form.email}
+                  onChange={(e) => setForm({ ...form, email: e.target.value })}
+                  className="h-12 mt-1"
+                />
+              </div>
+              <Button type="submit" className="w-full h-12" disabled={saving}>
+                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Enregistrer</>}
+              </Button>
+            </form>
+          </CardContent>
+        </Card>
+
+        <Button
+          variant="outline"
+          className="w-full h-12 text-destructive border-destructive/30"
+          onClick={handleLogout}
+        >
+          <LogOut className="h-4 w-4 mr-2" />
+          Se déconnecter
+        </Button>
+      </div>
+
+      <CustomerNavbar />
+    </div>
+  );
+};
+
+export default CustomerProfile;
diff --git a/src/pages/customer/CustomerRegister.tsx b/src/pages/customer/CustomerRegister.tsx
new file mode 100644
index 0000000..1a99fb0
--- /dev/null
+++ b/src/pages/customer/CustomerRegister.tsx
@@ -0,0 +1,135 @@
+// src/pages/customer/CustomerRegister.tsx
+import { useState } from 'react';
+import { useNavigate, Link } from 'react-router-dom';
+import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
+import { Button } from '@/components/ui/button';
+import { Input } from '@/components/ui/input';
+import { Label } from '@/components/ui/label';
+import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
+import { Loader2, ArrowLeft } from 'lucide-react';
+import { toast } from 'sonner';
+
+const CustomerRegister = () => {
+  const navigate = useNavigate();
+  const { register, isLoading } = useCustomerAuth();
+
+  const [form, setForm] = useState({
+    nom: '',
+    telephone: '',
+    email: '',
+    password: '',
+    confirmPassword: '',
+  });
+
+  const handleSubmit = async (e: React.FormEvent) => {
+    e.preventDefault();
+
+    if (form.password !== form.confirmPassword) {
+      toast.error('Les mots de passe ne correspondent pas');
+      return;
+    }
+
+    try {
+      await register({
+        nom: form.nom,
+        telephone: form.telephone,
+        email: form.email || undefined,
+        password: form.password,
+      });
+      toast.success('Compte créé avec succès');
+      navigate('/customer/orders');
+    } catch (error: any) {
+      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription');
+    }
+  };
+
+  return (
+    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
+      <Card className="w-full max-w-md">
+        <CardHeader>
+          <Button
+            variant="ghost"
+            size="sm"
+            className="w-fit mb-2"
+            onClick={() => navigate(-1)}
+          >
+            <ArrowLeft className="h-4 w-4 mr-2" />
+            Retour
+          </Button>
+          <CardTitle className="text-2xl">Créer un compte</CardTitle>
+        </CardHeader>
+        <CardContent>
+          <form onSubmit={handleSubmit} className="space-y-4">
+            <div>
+              <Label htmlFor="nom">Nom complet *</Label>
+              <Input
+                id="nom"
+                value={form.nom}
+                onChange={(e) => setForm({ ...form, nom: e.target.value })}
+                className="h-12 mt-1"
+                required
+              />
+            </div>
+            <div>
+              <Label htmlFor="telephone">Téléphone *</Label>
+              <Input
+                id="telephone"
+                type="tel"
+                placeholder="+224 6XX XXX XXX"
+                value={form.telephone}
+                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
+                className="h-12 mt-1"
+                required
+              />
+            </div>
+            <div>
+              <Label htmlFor="email">Email (optionnel)</Label>
+              <Input
+                id="email"
+                type="email"
+                value={form.email}
+                onChange={(e) => setForm({ ...form, email: e.target.value })}
+                className="h-12 mt-1"
+              />
+            </div>
+            <div>
+              <Label htmlFor="password">Mot de passe *</Label>
+              <Input
+                id="password"
+                type="password"
+                value={form.password}
+                onChange={(e) => setForm({ ...form, password: e.target.value })}
+                className="h-12 mt-1"
+                required
+                minLength={6}
+              />
+            </div>
+            <div>
+              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
+              <Input
+                id="confirmPassword"
+                type="password"
+                value={form.confirmPassword}
+                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
+                className="h-12 mt-1"
+                required
+              />
+            </div>
+            <Button type="submit" className="w-full h-12" disabled={isLoading}>
+              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Créer mon compte'}
+            </Button>
+          </form>
+
+          <p className="text-center text-sm text-muted-foreground mt-6">
+            Déjà un compte ?{' '}
+            <Link to="/customer/login" className="text-primary font-medium">
+              Se connecter
+            </Link>
+          </p>
+        </CardContent>
+      </Card>
+    </div>
+  );
+};
+
+export default CustomerRegister;
diff --git a/src/pages/storefront/StorefrontCart.tsx b/src/pages/storefront/StorefrontCart.tsx
new file mode 100644
index 0000000..599ae27
--- /dev/null
+++ b/src/pages/storefront/StorefrontCart.tsx
@@ -0,0 +1,88 @@
+// src/pages/storefront/StorefrontCart.tsx
+import { useParams, useNavigate } from 'react-router-dom';
+import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
+import { CartMobileItem } from '@/components/storefront/CartMobileItem';
+import { useStorefront } from '@/hooks/useStorefront';
+import { useCart } from '@/hooks/useCart';
+import { Button } from '@/components/ui/button';
+import { ArrowLeft, ShoppingBag } from 'lucide-react';
+
+const formatPrix = (prix: number) => {
+  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
+};
+
+const StorefrontCart = () => {
+  const { slug } = useParams<{ slug: string }>();
+  const navigate = useNavigate();
+  const { data: storefront } = useStorefront(slug || '');
+  const { items, subtotal, removeItem, updateQuantity } = useCart(slug || '');
+
+  if (!storefront) return null;
+
+  const total = subtotal + storefront.fraisLivraison;
+
+  return (
+    <StorefrontLayout>
+      <div className="p-4">
+        <Button
+          variant="ghost"
+          className="mb-4"
+          onClick={() => navigate(`/b/${slug}`)}
+        >
+          <ArrowLeft className="h-4 w-4 mr-2" />
+          Continuer mes achats
+        </Button>
+
+        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
+          <ShoppingBag className="h-5 w-5" />
+          Mon panier ({items.length})
+        </h1>
+
+        {items.length === 0 ? (
+          <div className="text-center py-12 text-muted-foreground">
+            <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-50" />
+            <p>Votre panier est vide</p>
+          </div>
+        ) : (
+          <>
+            <div className="space-y-2 mb-6">
+              {items.map((item) => (
+                <CartMobileItem
+                  key={`${item.articleId}_${item.modeVenteId || ''}`}
+                  item={item}
+                  onRemove={() => removeItem(item.articleId, item.modeVenteId)}
+                  onUpdateQuantity={(qty) => updateQuantity(item.articleId, qty, item.modeVenteId)}
+                  formatPrix={formatPrix}
+                />
+              ))}
+            </div>
+
+            <div className="bg-muted/50 rounded-lg p-4 space-y-2 mb-6">
+              <div className="flex justify-between text-sm">
+                <span>Sous-total</span>
+                <span>{formatPrix(subtotal)}</span>
+              </div>
+              <div className="flex justify-between text-sm">
+                <span>Livraison estimée</span>
+                <span>{formatPrix(storefront.fraisLivraison)}</span>
+              </div>
+              <div className="flex justify-between text-lg font-bold pt-2 border-t">
+                <span>Total</span>
+                <span className="text-primary">{formatPrix(total)}</span>
+              </div>
+            </div>
+
+            <Button
+              className="w-full h-14 text-base"
+              onClick={() => navigate(`/b/${slug}/checkout`)}
+            >
+              Passer la commande
+            </Button>
+          </>
+        )}
+      </div>
+    </StorefrontLayout>
+  );
+};
+
+export default StorefrontCart;
diff --git a/src/pages/storefront/StorefrontCheckout.tsx b/src/pages/storefront/StorefrontCheckout.tsx
new file mode 100644
index 0000000..54b68f5
--- /dev/null
+++ b/src/pages/storefront/StorefrontCheckout.tsx
@@ -0,0 +1,159 @@
+// src/pages/storefront/StorefrontCheckout.tsx
+import { useParams, useNavigate } from 'react-router-dom';
+import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
+import { CheckoutMobileForm } from '@/components/storefront/CheckoutMobileForm';
+import { useStorefront } from '@/hooks/useStorefront';
+import { useCart } from '@/hooks/useCart';
+import { useCreateOrder } from '@/hooks/useOnlineOrders';
+import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
+import { ModeLivraison, CartItem, StoreFront } from '@/types';
+import { ArrowLeft } from 'lucide-react';
+import { Button } from '@/components/ui/button';
+
+const formatPrix = (prix: number) => {
+  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
+};
+
+const generateWhatsAppMessage = (
+  order: { numero: string },
+  items: CartItem[],
+  formData: { modeLivraison: ModeLivraison; adresseLivraison?: string; nomClient?: string; telephoneLivraison: string },
+  storefront: StoreFront,
+  subtotal: number,
+  fraisLivraison: number
+) => {
+  const now = new Date();
+  const dateStr = now.toLocaleDateString('fr-FR');
+  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
+
+  const itemsText = items
+    .map((item) => `• ${item.articleNom} × ${item.quantity} = ${formatPrix(item.prixUnitaire * item.quantity)}`)
+    .join('\n');
+
+  const modeText = formData.modeLivraison === ModeLivraison.LIVRAISON
+    ? `Livraison à ${formData.adresseLivraison}`
+    : 'Retrait en boutique';
+
+  const total = subtotal + fraisLivraison;
+
+  return `🛒 *Nouvelle commande*
+
+📦 Commande: ${order.numero}
+📅 Date: ${dateStr} à ${timeStr}
+
+👤 Client: ${formData.nomClient || 'Non spécifié'}
+📱 Téléphone: ${formData.telephoneLivraison}
+📍 Mode: ${modeText}
+
+*Articles:*
+${itemsText}
+
+💰 Sous-total: ${formatPrix(subtotal)}
+🚚 Livraison: ${formatPrix(fraisLivraison)}
+*TOTAL: ${formatPrix(total)}*
+
+Merci de confirmer la réception de cette commande.`;
+};
+
+const StorefrontCheckout = () => {
+  const { slug } = useParams<{ slug: string }>();
+  const navigate = useNavigate();
+  const { data: storefront } = useStorefront(slug || '');
+  const { items, subtotal, clear } = useCart(slug || '');
+  const { customer, isAuthenticated } = useCustomerAuth();
+  const createOrder = useCreateOrder();
+
+  if (!storefront) return null;
+
+  if (items.length === 0) {
+    return (
+      <StorefrontLayout>
+        <div className="p-4 text-center">
+          <p className="text-muted-foreground mb-4">Votre panier est vide</p>
+          <Button onClick={() => navigate(`/b/${slug}`)}>
+            Voir le catalogue
+          </Button>
+        </div>
+      </StorefrontLayout>
+    );
+  }
+
+  const handleSubmit = async (formData: { modeLivraison: ModeLivraison; adresseLivraison?: string; nomClient?: string; telephoneLivraison: string }) => {
+    try {
+      const fraisLivraison = formData.modeLivraison === ModeLivraison.LIVRAISON
+        ? storefront.fraisLivraison
+        : 0;
+
+      const order = await createOrder.mutateAsync({
+        storefrontSlug: slug!,
+        modeLivraison: formData.modeLivraison,
+        adresseLivraison: formData.adresseLivraison,
+        telephoneLivraison: formData.telephoneLivraison,
+        nomClient: formData.nomClient,
+        items: items.map((item) => ({
+          articleId: item.articleId,
+          modeVenteId: item.modeVenteId,
+          quantite: item.quantity,
+        })),
+      });
+
+      // Générer message WhatsApp
+      const message = generateWhatsAppMessage(
+        order,
+        items,
+        formData,
+        storefront,
+        subtotal,
+        fraisLivraison
+      );
+
+      // Vider le panier
+      clear();
+
+      // Ouvrir WhatsApp
+      const whatsappUrl = `https://wa.me/${storefront.whatsappNumber}?text=${encodeURIComponent(message)}`;
+      window.open(whatsappUrl, '_blank');
+
+      // Rediriger vers confirmation ou historique
+      if (isAuthenticated) {
+        navigate('/customer/orders');
+      } else {
+        navigate(`/b/${slug}?success=1`);
+      }
+    } catch {
+      // Error handled by mutation
+    }
+  };
+
+  return (
+    <StorefrontLayout>
+      <div className="p-4">
+        <Button
+          variant="ghost"
+          className="mb-4"
+          onClick={() => navigate(`/b/${slug}/cart`)}
+        >
+          <ArrowLeft className="h-4 w-4 mr-2" />
+          Retour au panier
+        </Button>
+
+        <h1 className="text-xl font-bold mb-6">Finaliser la commande</h1>
+
+        <CheckoutMobileForm
+          storefront={storefront}
+          items={items}
+          subtotal={subtotal}
+          onSubmit={handleSubmit}
+          isLoading={createOrder.isPending}
+          defaultValues={
+            isAuthenticated && customer
+              ? { telephoneLivraison: customer.telephone, nomClient: customer.nom }
+              : undefined
+          }
+        />
+      </div>
+    </StorefrontLayout>
+  );
+};
+
+export default StorefrontCheckout;
diff --git a/src/pages/storefront/StorefrontHome.tsx b/src/pages/storefront/StorefrontHome.tsx
new file mode 100644
index 0000000..250dc75
--- /dev/null
+++ b/src/pages/storefront/StorefrontHome.tsx
@@ -0,0 +1,72 @@
+// src/pages/storefront/StorefrontHome.tsx
+import { useState, useMemo } from 'react';
+import { useParams, useNavigate } from 'react-router-dom';
+import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
+import { StorefrontSearch } from '@/components/storefront/StorefrontSearch';
+import { CategoryFilter } from '@/components/storefront/CategoryFilter';
+import { ProductGrid } from '@/components/storefront/ProductGrid';
+import { useStorefrontProducts, useStorefrontCategories } from '@/hooks/useStorefront';
+import { useCart } from '@/hooks/useCart';
+import { Loader2 } from 'lucide-react';
+import { toast } from 'sonner';
+import { useDebounce } from '@/hooks/useDebounce';
+import { StorefrontArticle } from '@/types';
+
+const formatPrix = (prix: number) => {
+  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
+};
+
+const StorefrontHome = () => {
+  const { slug } = useParams<{ slug: string }>();
+  const navigate = useNavigate();
+  const [search, setSearch] = useState('');
+  const [categoryId, setCategoryId] = useState<string | null>(null);
+
+  const debouncedSearch = useDebounce(search, 300);
+  const { addItem } = useCart(slug || '');
+
+  const { data: productsData, isLoading: loadingProducts } = useStorefrontProducts(slug || '', {
+    search: debouncedSearch || undefined,
+    categorieId: categoryId || undefined,
+  });
+
+  const { data: categories = [] } = useStorefrontCategories(slug || '');
+
+  const articles = useMemo(() => productsData?.data || [], [productsData]);
+
+  const handleAddToCart = (article: StorefrontArticle) => {
+    addItem(article);
+    toast.success(`${article.nom} ajouté au panier`);
+  };
+
+  return (
+    <StorefrontLayout>
+      <div className="p-4 space-y-4">
+        <StorefrontSearch value={search} onChange={setSearch} />
+
+        {categories.length > 0 && (
+          <CategoryFilter
+            categories={categories}
+            selected={categoryId}
+            onSelect={setCategoryId}
+          />
+        )}
+
+        {loadingProducts ? (
+          <div className="flex justify-center py-12">
+            <Loader2 className="h-8 w-8 animate-spin text-primary" />
+          </div>
+        ) : (
+          <ProductGrid
+            articles={articles}
+            onAddToCart={handleAddToCart}
+            onProductClick={(id) => navigate(`/b/${slug}/product/${id}`)}
+            formatPrix={formatPrix}
+          />
+        )}
+      </div>
+    </StorefrontLayout>
+  );
+};
+
+export default StorefrontHome;
diff --git a/src/pages/storefront/StorefrontProduct.tsx b/src/pages/storefront/StorefrontProduct.tsx
new file mode 100644
index 0000000..ed00f03
--- /dev/null
+++ b/src/pages/storefront/StorefrontProduct.tsx
@@ -0,0 +1,117 @@
+// src/pages/storefront/StorefrontProduct.tsx
+import { useParams, useNavigate } from 'react-router-dom';
+import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
+import { useStorefrontProduct } from '@/hooks/useStorefront';
+import { useCart } from '@/hooks/useCart';
+import { Button } from '@/components/ui/button';
+import { ArrowLeft, ShoppingCart, ImageOff, Loader2 } from 'lucide-react';
+import { toast } from 'sonner';
+import { getPhotoUrl } from '@/lib/api-client';
+
+const formatPrix = (prix: number) => {
+  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
+};
+
+const StorefrontProduct = () => {
+  const { slug, id } = useParams<{ slug: string; id: string }>();
+  const navigate = useNavigate();
+  const { addItem } = useCart(slug || '');
+
+  const { data: article, isLoading } = useStorefrontProduct(slug || '', id || '');
+
+  if (isLoading) {
+    return (
+      <StorefrontLayout>
+        <div className="flex justify-center py-12">
+          <Loader2 className="h-8 w-8 animate-spin text-primary" />
+        </div>
+      </StorefrontLayout>
+    );
+  }
+
+  if (!article) {
+    return (
+      <StorefrontLayout>
+        <div className="p-4 text-center">
+          <p className="text-muted-foreground">Produit introuvable</p>
+          <Button variant="link" onClick={() => navigate(`/b/${slug}`)}>
+            Retour au catalogue
+          </Button>
+        </div>
+      </StorefrontLayout>
+    );
+  }
+
+  const photoUrl = getPhotoUrl(article.photo);
+  const isOutOfStock = article.stock <= 0;
+
+  const handleAddToCart = () => {
+    addItem(article);
+    toast.success(`${article.nom} ajouté au panier`);
+  };
+
+  return (
+    <StorefrontLayout>
+      <div>
+        {/* Bouton retour */}
+        <Button
+          variant="ghost"
+          className="m-4"
+          onClick={() => navigate(`/b/${slug}`)}
+        >
+          <ArrowLeft className="h-4 w-4 mr-2" />
+          Retour
+        </Button>
+
+        {/* Image */}
+        <div className="aspect-square bg-muted relative">
+          {photoUrl ? (
+            <img src={photoUrl} alt={article.nom} className="w-full h-full object-cover" />
+          ) : (
+            <div className="w-full h-full flex items-center justify-center">
+              <ImageOff className="h-16 w-16 text-muted-foreground/50" />
+            </div>
+          )}
+        </div>
+
+        {/* Détails */}
+        <div className="p-4 space-y-4">
+          <div>
+            <h1 className="text-xl font-bold">{article.nom}</h1>
+            {article.reference && (
+              <p className="text-sm text-muted-foreground">Réf: {article.reference}</p>
+            )}
+          </div>
+
+          <p className="text-2xl font-bold text-primary">{formatPrix(article.prixEnLigne)}</p>
+
+          {!isOutOfStock ? (
+            <p className="text-sm text-muted-foreground">
+              {article.stock} en stock
+            </p>
+          ) : (
+            <p className="text-sm text-destructive font-medium">Rupture de stock</p>
+          )}
+
+          {article.description && (
+            <div>
+              <h2 className="font-medium mb-1">Description</h2>
+              <p className="text-sm text-muted-foreground">{article.description}</p>
+            </div>
+          )}
+
+          <Button
+            className="w-full h-14 text-base"
+            disabled={isOutOfStock}
+            onClick={handleAddToCart}
+          >
+            <ShoppingCart className="h-5 w-5 mr-2" />
+            Ajouter au panier
+          </Button>
+        </div>
+      </div>
+    </StorefrontLayout>
+  );
+};
+
+export default StorefrontProduct;
diff --git a/src/types/customer.ts b/src/types/customer.ts
new file mode 100644
index 0000000..ed725ee
--- /dev/null
+++ b/src/types/customer.ts
@@ -0,0 +1,132 @@
+// src/types/customer.ts
+export interface CustomerAccount {
+  id: string;
+  nom: string;
+  telephone: string;
+  email?: string;
+  isActive: boolean;
+  createdAt: string;
+}
+
+export interface StoreFront {
+  id: string;
+  slug: string;
+  organizationId: string;
+  organizationName: string;
+  description?: string;
+  logoUrl?: string;
+  whatsappNumber?: string;
+  horaires?: string;
+  fraisLivraison: number;
+  adresse?: string;
+  isActive: boolean;
+}
+
+export interface CartItem {
+  articleId: string;
+  articleNom: string;
+  articlePhoto?: string;
+  modeVenteId?: string;
+  modeVenteNom?: string;
+  prixUnitaire: number;
+  quantity: number;
+}
+
+export enum OnlineOrderStatut {
+  EN_ATTENTE = 'EN_ATTENTE',
+  CONFIRMEE = 'CONFIRMEE',
+  PRETE = 'PRETE',
+  LIVREE = 'LIVREE',
+  ANNULEE = 'ANNULEE',
+}
+
+export enum ModeLivraison {
+  LIVRAISON = 'LIVRAISON',
+  RETRAIT_BOUTIQUE = 'RETRAIT_BOUTIQUE',
+}
+
+export interface OnlineOrderItem {
+  id: string;
+  articleId: string;
+  articleNom: string;
+  modeVenteId?: string;
+  modeVenteNom?: string;
+  quantite: number;
+  prixUnitaire: number;
+  sousTotal: number;
+}
+
+export interface OnlineOrder {
+  id: string;
+  numero: string;
+  organizationId: string;
+  statut: OnlineOrderStatut;
+  modeLivraison: ModeLivraison;
+  adresseLivraison?: string;
+  telephoneLivraison?: string;
+  fraisLivraison: number;
+  sousTotal: number;
+  total: number;
+  items: OnlineOrderItem[];
+  customerAccount?: CustomerAccount;
+  clientNom?: string;
+  clientTelephone?: string;
+  motifAnnulation?: string;
+  confirmeePar?: string;
+  confirmeeLe?: string;
+  preteLe?: string;
+  livreeLe?: string;
+  annuleeLe?: string;
+  createdAt: string;
+  updatedAt: string;
+}
+
+export interface CreateOnlineOrderDto {
+  storefrontSlug: string;
+  modeLivraison: ModeLivraison;
+  adresseLivraison?: string;
+  telephoneLivraison: string;
+  nomClient?: string;
+  items: {
+    articleId: string;
+    modeVenteId?: string;
+    quantite: number;
+  }[];
+}
+
+export interface RegisterCustomerDto {
+  nom: string;
+  telephone: string;
+  email?: string;
+  password: string;
+}
+
+export interface LoginCustomerDto {
+  telephone: string;
+  password: string;
+}
+
+export interface UpdateCustomerDto {
+  nom?: string;
+  email?: string;
+}
+
+export interface StorefrontArticle {
+  id: string;
+  nom: string;
+  reference?: string;
+  description?: string;
+  photo?: string;
+  prixEnLigne: number;
+  stock: number;
+  categorieId: string;
+  categorieNom?: string;
+  modesVente?: { id: string; nom: string; prix: number; quantiteParUnite: number }[];
+}
+
+export interface OnlineOrderFilterParams {
+  page?: number;
+  limit?: number;
+  statut?: OnlineOrderStatut;
+  search?: string;
+}
diff --git a/src/types/index.ts b/src/types/index.ts
index c66099a..6a9d7f2 100644
--- a/src/types/index.ts
+++ b/src/types/index.ts
@@ -1154,10 +1154,12 @@ export interface DepenseStats {
   depensesVariables: number;
   depensesExceptionnelles: number;
   nombreDepenses: number;
   depenseMoyenne: number;
   repartitionParType: Array<{
     type: string;
     montant: number;
     pourcentage: number;
   }>;
 }
+
+export * from './customer';
```

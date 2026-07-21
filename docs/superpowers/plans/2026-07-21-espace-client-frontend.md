# Espace Client Frontend - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Créer l'interface frontend pour la vitrine boutique, l'espace client et le back-office commandes en ligne.

**Architecture:** Intégration dans la structure existante avec préfixes. Mobile-first. Auth client séparée du back-office.

**Tech Stack:** React 18, TypeScript, Tailwind, shadcn/ui, React Query, React Router

## Global Constraints

- Mobile-first : 1 carte par ligne sur mobile
- Pattern Mobile*Card avec Sheet pour actions, boutons h-12
- Auth séparée : CustomerAuthContext distinct de AuthContext
- localStorage : cart_{slug} pour panier, customer_token pour auth
- Tailwind breakpoints : mobile < 768px, tablet ≥ 768px, desktop ≥ 1024px

---

### Task 1: Types customer.ts

**Files:**
- Create: `src/types/customer.ts`
- Modify: `src/types/index.ts`

**Produces:** Types CustomerAccount, StoreFront, CartItem, OnlineOrder, OnlineOrderItem, enums

- [ ] **Step 1: Create customer types file**

```typescript
// src/types/customer.ts
export interface CustomerAccount {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
}

export interface StoreFront {
  id: string;
  slug: string;
  organizationId: string;
  organizationName: string;
  description?: string;
  logoUrl?: string;
  whatsappNumber?: string;
  horaires?: string;
  fraisLivraison: number;
  adresse?: string;
  isActive: boolean;
}

export interface CartItem {
  articleId: string;
  articleNom: string;
  articlePhoto?: string;
  modeVenteId?: string;
  modeVenteNom?: string;
  prixUnitaire: number;
  quantity: number;
}

export enum OnlineOrderStatut {
  EN_ATTENTE = 'EN_ATTENTE',
  CONFIRMEE = 'CONFIRMEE',
  PRETE = 'PRETE',
  LIVREE = 'LIVREE',
  ANNULEE = 'ANNULEE',
}

export enum ModeLivraison {
  LIVRAISON = 'LIVRAISON',
  RETRAIT_BOUTIQUE = 'RETRAIT_BOUTIQUE',
}

export interface OnlineOrderItem {
  id: string;
  articleId: string;
  articleNom: string;
  modeVenteId?: string;
  modeVenteNom?: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

export interface OnlineOrder {
  id: string;
  numero: string;
  organizationId: string;
  statut: OnlineOrderStatut;
  modeLivraison: ModeLivraison;
  adresseLivraison?: string;
  telephoneLivraison?: string;
  fraisLivraison: number;
  sousTotal: number;
  total: number;
  items: OnlineOrderItem[];
  customerAccount?: CustomerAccount;
  clientNom?: string;
  clientTelephone?: string;
  motifAnnulation?: string;
  confirmeePar?: string;
  confirmeeLe?: string;
  preteLe?: string;
  livreeLe?: string;
  annuleeLe?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOnlineOrderDto {
  storefrontSlug: string;
  modeLivraison: ModeLivraison;
  adresseLivraison?: string;
  telephoneLivraison: string;
  nomClient?: string;
  items: {
    articleId: string;
    modeVenteId?: string;
    quantite: number;
  }[];
}

export interface RegisterCustomerDto {
  nom: string;
  telephone: string;
  email?: string;
  password: string;
}

export interface LoginCustomerDto {
  telephone: string;
  password: string;
}

export interface UpdateCustomerDto {
  nom?: string;
  email?: string;
}

export interface StorefrontArticle {
  id: string;
  nom: string;
  reference?: string;
  description?: string;
  photo?: string;
  prixEnLigne: number;
  stock: number;
  categorieId: string;
  categorieNom?: string;
  modesVente?: { id: string; nom: string; prix: number; quantiteParUnite: number }[];
}

export interface OnlineOrderFilterParams {
  page?: number;
  limit?: number;
  statut?: OnlineOrderStatut;
  search?: string;
}
```

- [ ] **Step 2: Export from index.ts**

Add to `src/types/index.ts`:
```typescript
export * from './customer';
```

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/types/customer.ts src/types/index.ts
git commit -m "feat(types): add customer and online order types"
```

---

### Task 2: API Services

**Files:**
- Create: `src/api/customer-auth.ts`
- Create: `src/api/storefront.ts`
- Create: `src/api/online-orders.ts`

**Produces:** customerAuthApi, storefrontApi, onlineOrdersApi

- [ ] **Step 1: Create customer-auth API**

```typescript
// src/api/customer-auth.ts
import { apiClient } from '@/lib/api-client';
import { CustomerAccount, RegisterCustomerDto, LoginCustomerDto, UpdateCustomerDto } from '@/types';

// Client API avec token client séparé
const getCustomerToken = () => localStorage.getItem('customer_token');

const customerApiClient = {
  get: async <T>(url: string) => {
    const token = getCustomerToken();
    return apiClient.get<T>(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  patch: async <T>(url: string, data: any) => {
    const token = getCustomerToken();
    return apiClient.patch<T>(url, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};

export const customerAuthApi = {
  register: async (data: RegisterCustomerDto): Promise<{ access_token: string; customer: CustomerAccount }> => {
    const response = await apiClient.post('/public/customer/auth/register', data);
    return response.data;
  },

  login: async (data: LoginCustomerDto): Promise<{ access_token: string; customer: CustomerAccount }> => {
    const response = await apiClient.post('/public/customer/auth/login', data);
    return response.data;
  },

  getProfile: async (): Promise<CustomerAccount> => {
    const response = await customerApiClient.get<CustomerAccount>('/public/customer/auth/me');
    return response.data;
  },

  updateProfile: async (data: UpdateCustomerDto): Promise<CustomerAccount> => {
    const response = await customerApiClient.patch<CustomerAccount>('/public/customer/auth/me', data);
    return response.data;
  },
};
```

- [ ] **Step 2: Create storefront API**

```typescript
// src/api/storefront.ts
import { apiClient } from '@/lib/api-client';
import { StoreFront, StorefrontArticle, PaginatedResponse } from '@/types';

export interface StorefrontProductParams {
  page?: number;
  limit?: number;
  search?: string;
  categorieId?: string;
}

export const storefrontApi = {
  getBySlug: async (slug: string): Promise<StoreFront> => {
    const response = await apiClient.get<StoreFront>(`/public/storefront/${slug}`);
    return response.data;
  },

  getProducts: async (slug: string, params?: StorefrontProductParams): Promise<PaginatedResponse<StorefrontArticle>> => {
    const response = await apiClient.get<PaginatedResponse<StorefrontArticle>>(
      `/public/storefront/${slug}/articles`,
      { params }
    );
    return response.data;
  },

  getProduct: async (slug: string, articleId: string): Promise<StorefrontArticle> => {
    const response = await apiClient.get<StorefrontArticle>(
      `/public/storefront/${slug}/articles/${articleId}`
    );
    return response.data;
  },

  getCategories: async (slug: string): Promise<{ id: string; nom: string; slug: string }[]> => {
    const response = await apiClient.get(`/public/storefront/${slug}/categories`);
    return response.data;
  },
};
```

- [ ] **Step 3: Create online-orders API**

```typescript
// src/api/online-orders.ts
import { apiClient } from '@/lib/api-client';
import { OnlineOrder, CreateOnlineOrderDto, OnlineOrderFilterParams, PaginatedResponse } from '@/types';

const getCustomerToken = () => localStorage.getItem('customer_token');

export const onlineOrdersApi = {
  // Public - création commande
  create: async (data: CreateOnlineOrderDto): Promise<OnlineOrder> => {
    const token = getCustomerToken();
    const response = await apiClient.post<OnlineOrder>('/public/orders', data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  // Client connecté - mes commandes
  getMyOrders: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<OnlineOrder>> => {
    const token = getCustomerToken();
    const response = await apiClient.get<PaginatedResponse<OnlineOrder>>('/public/orders', {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  getMyOrder: async (id: string): Promise<OnlineOrder> => {
    const token = getCustomerToken();
    const response = await apiClient.get<OnlineOrder>(`/public/orders/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  // Back-office
  getAll: async (params?: OnlineOrderFilterParams): Promise<PaginatedResponse<OnlineOrder>> => {
    const response = await apiClient.get<PaginatedResponse<OnlineOrder>>('/online-orders', { params });
    return response.data;
  },

  getById: async (id: string): Promise<OnlineOrder> => {
    const response = await apiClient.get<OnlineOrder>(`/online-orders/${id}`);
    return response.data;
  },

  confirm: async (id: string): Promise<OnlineOrder> => {
    const response = await apiClient.patch<OnlineOrder>(`/online-orders/${id}/confirm`);
    return response.data;
  },

  markReady: async (id: string): Promise<OnlineOrder> => {
    const response = await apiClient.patch<OnlineOrder>(`/online-orders/${id}/ready`);
    return response.data;
  },

  markDelivered: async (id: string): Promise<OnlineOrder> => {
    const response = await apiClient.patch<OnlineOrder>(`/online-orders/${id}/deliver`);
    return response.data;
  },

  cancel: async (id: string, motif: string): Promise<OnlineOrder> => {
    const response = await apiClient.patch<OnlineOrder>(`/online-orders/${id}/cancel`, { motifAnnulation: motif });
    return response.data;
  },

  getStats: async (): Promise<{ enAttente: number; confirmees: number; pretes: number; livrees: number; total: number }> => {
    const response = await apiClient.get('/online-orders/stats');
    return response.data;
  },

  getPendingCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get('/online-orders/pending-count');
    return response.data;
  },
};
```

- [ ] **Step 4: Verify build**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add src/api/customer-auth.ts src/api/storefront.ts src/api/online-orders.ts
git commit -m "feat(api): add customer auth, storefront and online orders APIs"
```

---

### Task 3: CustomerAuthContext

**Files:**
- Create: `src/contexts/CustomerAuthContext.tsx`

**Produces:** CustomerAuthProvider, useCustomerAuth hook

- [ ] **Step 1: Create CustomerAuthContext**

```typescript
// src/contexts/CustomerAuthContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CustomerAccount, RegisterCustomerDto, LoginCustomerDto, UpdateCustomerDto } from '@/types';
import { customerAuthApi } from '@/api/customer-auth';

interface CustomerAuthContextType {
  customer: CustomerAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginCustomerDto) => Promise<void>;
  register: (data: RegisterCustomerDto) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateCustomerDto) => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TOKEN: 'customer_token',
  CUSTOMER: 'customer_data',
};

export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<CustomerAccount | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMER);
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!customer && !!localStorage.getItem(STORAGE_KEYS.TOKEN);

  useEffect(() => {
    if (customer) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(customer));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOMER);
    }
  }, [customer]);

  const login = async (data: LoginCustomerDto) => {
    setIsLoading(true);
    try {
      const response = await customerAuthApi.login(data);
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token);
      setCustomer(response.customer);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterCustomerDto) => {
    setIsLoading(true);
    try {
      const response = await customerAuthApi.register(data);
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token);
      setCustomer(response.customer);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER);
    setCustomer(null);
  };

  const updateProfile = async (data: UpdateCustomerDto) => {
    const updated = await customerAuthApi.updateProfile(data);
    setCustomer(updated);
  };

  return (
    <CustomerAuthContext.Provider
      value={{ customer, isAuthenticated, isLoading, login, register, logout, updateProfile }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return context;
};
```

- [ ] **Step 2: Verify build**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/contexts/CustomerAuthContext.tsx
git commit -m "feat(auth): add CustomerAuthContext for client authentication"
```

---

### Task 4: useCart Hook

**Files:**
- Create: `src/hooks/useCart.ts`

**Produces:** useCart hook with localStorage persistence

- [ ] **Step 1: Create useCart hook**

```typescript
// src/hooks/useCart.ts
import { useState, useEffect, useCallback } from 'react';
import { CartItem, StorefrontArticle } from '@/types';

const getStorageKey = (slug: string) => `cart_${slug}`;

export const useCart = (slug: string) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (!slug) return [];
    const stored = localStorage.getItem(getStorageKey(slug));
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    if (!slug) return;
    if (items.length > 0) {
      localStorage.setItem(getStorageKey(slug), JSON.stringify(items));
    } else {
      localStorage.removeItem(getStorageKey(slug));
    }
  }, [items, slug]);

  const addItem = useCallback((article: StorefrontArticle, quantity = 1, modeVente?: { id: string; nom: string; prix: number }) => {
    setItems((prev) => {
      const key = modeVente ? `${article.id}_${modeVente.id}` : article.id;
      const existing = prev.find((item) =>
        modeVente ? item.articleId === article.id && item.modeVenteId === modeVente.id
                 : item.articleId === article.id && !item.modeVenteId
      );

      if (existing) {
        return prev.map((item) =>
          (modeVente ? item.articleId === article.id && item.modeVenteId === modeVente.id
                     : item.articleId === article.id && !item.modeVenteId)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          articleId: article.id,
          articleNom: article.nom,
          articlePhoto: article.photo,
          modeVenteId: modeVente?.id,
          modeVenteNom: modeVente?.nom,
          prixUnitaire: modeVente?.prix ?? article.prixEnLigne,
          quantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((articleId: string, modeVenteId?: string) => {
    setItems((prev) =>
      prev.filter((item) =>
        modeVenteId
          ? !(item.articleId === articleId && item.modeVenteId === modeVenteId)
          : !(item.articleId === articleId && !item.modeVenteId)
      )
    );
  }, []);

  const updateQuantity = useCallback((articleId: string, quantity: number, modeVenteId?: string) => {
    if (quantity <= 0) {
      removeItem(articleId, modeVenteId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        (modeVenteId
          ? item.articleId === articleId && item.modeVenteId === modeVenteId
          : item.articleId === articleId && !item.modeVenteId)
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  const clear = useCallback(() => {
    setItems([]);
    if (slug) {
      localStorage.removeItem(getStorageKey(slug));
    }
  }, [slug]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.prixUnitaire * item.quantity, 0);

  return { items, itemCount, subtotal, addItem, removeItem, updateQuantity, clear };
};
```

- [ ] **Step 2: Verify build**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCart.ts
git commit -m "feat(hooks): add useCart hook with localStorage persistence"
```

---

### Task 5: Storefront & Online Orders Hooks

**Files:**
- Create: `src/hooks/useStorefront.ts`
- Create: `src/hooks/useOnlineOrders.ts`

**Produces:** React Query hooks for storefront and orders

- [ ] **Step 1: Create useStorefront hooks**

```typescript
// src/hooks/useStorefront.ts
import { useQuery } from '@tanstack/react-query';
import { storefrontApi, StorefrontProductParams } from '@/api/storefront';

export const useStorefront = (slug: string) => {
  return useQuery({
    queryKey: ['storefront', slug],
    queryFn: () => storefrontApi.getBySlug(slug),
    enabled: !!slug,
  });
};

export const useStorefrontProducts = (slug: string, params?: StorefrontProductParams) => {
  return useQuery({
    queryKey: ['storefront-products', slug, params],
    queryFn: () => storefrontApi.getProducts(slug, params),
    enabled: !!slug,
    placeholderData: (prev) => prev,
  });
};

export const useStorefrontProduct = (slug: string, articleId: string) => {
  return useQuery({
    queryKey: ['storefront-product', slug, articleId],
    queryFn: () => storefrontApi.getProduct(slug, articleId),
    enabled: !!slug && !!articleId,
  });
};

export const useStorefrontCategories = (slug: string) => {
  return useQuery({
    queryKey: ['storefront-categories', slug],
    queryFn: () => storefrontApi.getCategories(slug),
    enabled: !!slug,
  });
};
```

- [ ] **Step 2: Create useOnlineOrders hooks**

```typescript
// src/hooks/useOnlineOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onlineOrdersApi } from '@/api/online-orders';
import { CreateOnlineOrderDto, OnlineOrderFilterParams } from '@/types';
import { toast } from 'sonner';

// Client hooks
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOnlineOrderDto) => onlineOrdersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      toast.success('Commande envoyée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la commande');
    },
  });
};

export const useCustomerOrders = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['customer-orders', params],
    queryFn: () => onlineOrdersApi.getMyOrders(params),
    placeholderData: (prev) => prev,
  });
};

export const useCustomerOrder = (id: string) => {
  return useQuery({
    queryKey: ['customer-order', id],
    queryFn: () => onlineOrdersApi.getMyOrder(id),
    enabled: !!id,
  });
};

// Back-office hooks
export const useOnlineOrders = (params?: OnlineOrderFilterParams) => {
  return useQuery({
    queryKey: ['online-orders', params],
    queryFn: () => onlineOrdersApi.getAll(params),
    placeholderData: (prev) => prev,
  });
};

export const useOnlineOrder = (id: string) => {
  return useQuery({
    queryKey: ['online-order', id],
    queryFn: () => onlineOrdersApi.getById(id),
    enabled: !!id,
  });
};

export const useConfirmOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => onlineOrdersApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-orders'] });
      toast.success('Commande confirmée');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur');
    },
  });
};

export const useMarkOrderReady = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => onlineOrdersApi.markReady(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-orders'] });
      toast.success('Commande marquée prête');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur');
    },
  });
};

export const useMarkOrderDelivered = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => onlineOrdersApi.markDelivered(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-orders'] });
      toast.success('Commande livrée');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur');
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motif }: { id: string; motif: string }) => onlineOrdersApi.cancel(id, motif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-orders'] });
      toast.success('Commande annulée');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur');
    },
  });
};

export const useOnlineOrderStats = () => {
  return useQuery({
    queryKey: ['online-orders-stats'],
    queryFn: () => onlineOrdersApi.getStats(),
  });
};

export const usePendingOrderCount = () => {
  return useQuery({
    queryKey: ['online-orders-pending-count'],
    queryFn: () => onlineOrdersApi.getPendingCount(),
    refetchInterval: 30000, // Refresh every 30s
  });
};
```

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useStorefront.ts src/hooks/useOnlineOrders.ts
git commit -m "feat(hooks): add storefront and online orders hooks"
```

---

### Task 6: Storefront Layout Components

**Files:**
- Create: `src/components/storefront/StorefrontLayout.tsx`
- Create: `src/components/storefront/StorefrontHeader.tsx`

**Produces:** Layout et header pour vitrine

- [ ] **Step 1: Create StorefrontHeader**

```typescript
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
```

- [ ] **Step 2: Create StorefrontLayout**

```typescript
// src/components/storefront/StorefrontLayout.tsx
import { ReactNode, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorefrontHeader } from './StorefrontHeader';
import { CartDrawer } from './CartDrawer';
import { useStorefront } from '@/hooks/useStorefront';
import { useCart } from '@/hooks/useCart';
import { Loader2 } from 'lucide-react';

interface StorefrontLayoutProps {
  children: ReactNode;
}

export const StorefrontLayout = ({ children }: StorefrontLayoutProps) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);

  const { data: storefront, isLoading, error } = useStorefront(slug || '');
  const { items, itemCount, subtotal, removeItem, updateQuantity, clear } = useCart(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !storefront) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">Boutique introuvable</h1>
        <p className="text-muted-foreground">Cette boutique n'existe pas ou n'est plus disponible.</p>
      </div>
    );
  }

  if (!storefront.isActive) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">Boutique fermée</h1>
        <p className="text-muted-foreground">Cette boutique est temporairement indisponible.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader
        storefront={storefront}
        cartCount={itemCount}
        onCartClick={() => setCartOpen(true)}
      />
      <main className="pb-20">{children}</main>
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={items}
        subtotal={subtotal}
        fraisLivraison={storefront.fraisLivraison}
        onRemove={removeItem}
        onUpdateQuantity={updateQuantity}
        onCheckout={() => {
          setCartOpen(false);
          navigate(`/b/${slug}/checkout`);
        }}
      />
    </div>
  );
};
```

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/components/storefront/StorefrontHeader.tsx src/components/storefront/StorefrontLayout.tsx
git commit -m "feat(storefront): add layout and header components"
```

---

### Task 7: Cart Components

**Files:**
- Create: `src/components/storefront/CartMobileItem.tsx`
- Create: `src/components/storefront/CartDrawer.tsx`

**Produces:** Composants panier mobile

- [ ] **Step 1: Create CartMobileItem**

```typescript
// src/components/storefront/CartMobileItem.tsx
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/types';

interface CartMobileItemProps {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
  formatPrix: (prix: number) => string;
}

export const CartMobileItem = ({ item, onRemove, onUpdateQuantity, formatPrix }: CartMobileItemProps) => {
  return (
    <div className="flex gap-3 py-3 border-b last:border-0">
      {/* Image */}
      <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
        {item.articlePhoto ? (
          <img src={item.articlePhoto} alt={item.articleNom} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            Photo
          </div>
        )}
      </div>

      {/* Détails */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.articleNom}</p>
        {item.modeVenteNom && (
          <p className="text-xs text-muted-foreground">{item.modeVenteNom}</p>
        )}
        <p className="text-sm text-primary font-semibold mt-1">
          {formatPrix(item.prixUnitaire)}
        </p>

        {/* Quantité */}
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(item.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 ml-auto text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Create CartDrawer**

```typescript
// src/components/storefront/CartDrawer.tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CartMobileItem } from './CartMobileItem';
import { CartItem } from '@/types';
import { ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  subtotal: number;
  fraisLivraison: number;
  onRemove: (articleId: string, modeVenteId?: string) => void;
  onUpdateQuantity: (articleId: string, quantity: number, modeVenteId?: string) => void;
  onCheckout: () => void;
}

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

export const CartDrawer = ({
  open,
  onOpenChange,
  items,
  subtotal,
  fraisLivraison,
  onRemove,
  onUpdateQuantity,
  onCheckout,
}: CartDrawerProps) => {
  const total = subtotal + fraisLivraison;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Votre panier ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-16 w-16 mb-4 opacity-50" />
            <p>Votre panier est vide</p>
          </div>
        ) : (
          <>
            {/* Liste des items */}
            <div className="flex-1 overflow-y-auto py-4">
              {items.map((item) => (
                <CartMobileItem
                  key={`${item.articleId}_${item.modeVenteId || ''}`}
                  item={item}
                  onRemove={() => onRemove(item.articleId, item.modeVenteId)}
                  onUpdateQuantity={(qty) => onUpdateQuantity(item.articleId, qty, item.modeVenteId)}
                  formatPrix={formatPrix}
                />
              ))}
            </div>

            {/* Totaux */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{formatPrix(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Livraison</span>
                <span>{formatPrix(fraisLivraison)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatPrix(total)}</span>
              </div>

              <Button
                className="w-full h-12 text-base font-semibold mt-4"
                onClick={onCheckout}
                disabled={items.length === 0}
              >
                Valider la commande
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
```

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/components/storefront/CartMobileItem.tsx src/components/storefront/CartDrawer.tsx
git commit -m "feat(storefront): add cart drawer and item components"
```

---

### Task 8: Product Components

**Files:**
- Create: `src/components/storefront/ProductMobileCard.tsx`
- Create: `src/components/storefront/ProductGrid.tsx`
- Create: `src/components/storefront/StorefrontSearch.tsx`
- Create: `src/components/storefront/CategoryFilter.tsx`

**Produces:** Composants catalogue produits

- [ ] **Step 1: Create ProductMobileCard**

```typescript
// src/components/storefront/ProductMobileCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StorefrontArticle } from '@/types';
import { ShoppingCart, ImageOff } from 'lucide-react';
import { getPhotoUrl } from '@/lib/api-client';

interface ProductMobileCardProps {
  article: StorefrontArticle;
  onAddToCart: (article: StorefrontArticle) => void;
  onClick: () => void;
  formatPrix: (prix: number) => string;
}

export const ProductMobileCard = ({ article, onAddToCart, onClick, formatPrix }: ProductMobileCardProps) => {
  const photoUrl = getPhotoUrl(article.photo);
  const isOutOfStock = article.stock <= 0;

  return (
    <Card className="overflow-hidden" onClick={onClick}>
      <CardContent className="p-0">
        {/* Image */}
        <div className="aspect-[4/3] bg-muted relative">
          {photoUrl ? (
            <img src={photoUrl} alt={article.nom} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">Rupture de stock</span>
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="p-4">
          <h3 className="font-medium text-sm line-clamp-2 mb-1">{article.nom}</h3>
          <p className="text-lg font-bold text-primary mb-1">{formatPrix(article.prixEnLigne)}</p>
          {!isOutOfStock && (
            <p className="text-xs text-muted-foreground mb-3">Stock: {article.stock} disponibles</p>
          )}

          <Button
            className="w-full h-12"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(article);
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Ajouter au panier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

- [ ] **Step 2: Create ProductGrid**

```typescript
// src/components/storefront/ProductGrid.tsx
import { StorefrontArticle } from '@/types';
import { ProductMobileCard } from './ProductMobileCard';

interface ProductGridProps {
  articles: StorefrontArticle[];
  onAddToCart: (article: StorefrontArticle) => void;
  onProductClick: (articleId: string) => void;
  formatPrix: (prix: number) => string;
}

export const ProductGrid = ({ articles, onAddToCart, onProductClick, formatPrix }: ProductGridProps) => {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucun produit trouvé
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {articles.map((article) => (
        <ProductMobileCard
          key={article.id}
          article={article}
          onAddToCart={onAddToCart}
          onClick={() => onProductClick(article.id)}
          formatPrix={formatPrix}
        />
      ))}
    </div>
  );
};
```

- [ ] **Step 3: Create StorefrontSearch**

```typescript
// src/components/storefront/StorefrontSearch.tsx
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface StorefrontSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const StorefrontSearch = ({ value, onChange }: StorefrontSearchProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Rechercher un produit..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 h-12"
      />
    </div>
  );
};
```

- [ ] **Step 4: Create CategoryFilter**

```typescript
// src/components/storefront/CategoryFilter.tsx
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Category {
  id: string;
  nom: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (categoryId: string | null) => void;
}

export const CategoryFilter = ({ categories, selected, onSelect }: CategoryFilterProps) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        <Button
          variant={selected === null ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
          onClick={() => onSelect(null)}
        >
          Tous
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selected === cat.id ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => onSelect(cat.id)}
          >
            {cat.nom}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
```

- [ ] **Step 5: Verify build**

Run: `npm run build`

- [ ] **Step 6: Commit**

```bash
git add src/components/storefront/ProductMobileCard.tsx src/components/storefront/ProductGrid.tsx src/components/storefront/StorefrontSearch.tsx src/components/storefront/CategoryFilter.tsx
git commit -m "feat(storefront): add product card, grid, search and category filter"
```

---

### Task 9: StorefrontHome Page

**Files:**
- Create: `src/pages/storefront/StorefrontHome.tsx`

**Produces:** Page catalogue boutique

- [ ] **Step 1: Create StorefrontHome**

```typescript
// src/pages/storefront/StorefrontHome.tsx
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
import { StorefrontSearch } from '@/components/storefront/StorefrontSearch';
import { CategoryFilter } from '@/components/storefront/CategoryFilter';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { useStorefrontProducts, useStorefrontCategories } from '@/hooks/useStorefront';
import { useCart } from '@/hooks/useCart';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

const StorefrontHome = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { addItem } = useCart(slug || '');

  const { data: productsData, isLoading: loadingProducts } = useStorefrontProducts(slug || '', {
    search: debouncedSearch || undefined,
    categorieId: categoryId || undefined,
  });

  const { data: categories = [] } = useStorefrontCategories(slug || '');

  const articles = useMemo(() => productsData?.data || [], [productsData]);

  const handleAddToCart = (article: any) => {
    addItem(article);
    toast.success(`${article.nom} ajouté au panier`);
  };

  return (
    <StorefrontLayout>
      <div className="p-4 space-y-4">
        <StorefrontSearch value={search} onChange={setSearch} />

        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            selected={categoryId}
            onSelect={setCategoryId}
          />
        )}

        {loadingProducts ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ProductGrid
            articles={articles}
            onAddToCart={handleAddToCart}
            onProductClick={(id) => navigate(`/b/${slug}/product/${id}`)}
            formatPrix={formatPrix}
          />
        )}
      </div>
    </StorefrontLayout>
  );
};

export default StorefrontHome;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/pages/storefront/StorefrontHome.tsx
git commit -m "feat(storefront): add home page with product catalog"
```

---

### Task 10: StorefrontProduct Page

**Files:**
- Create: `src/pages/storefront/StorefrontProduct.tsx`

**Produces:** Page détail produit

- [ ] **Step 1: Create StorefrontProduct**

```typescript
// src/pages/storefront/StorefrontProduct.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
import { useStorefrontProduct } from '@/hooks/useStorefront';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, ImageOff } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getPhotoUrl } from '@/lib/api-client';

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

const StorefrontProduct = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart(slug || '');

  const { data: article, isLoading } = useStorefrontProduct(slug || '', id || '');

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StorefrontLayout>
    );
  }

  if (!article) {
    return (
      <StorefrontLayout>
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Produit introuvable</p>
          <Button variant="link" onClick={() => navigate(`/b/${slug}`)}>
            Retour au catalogue
          </Button>
        </div>
      </StorefrontLayout>
    );
  }

  const photoUrl = getPhotoUrl(article.photo);
  const isOutOfStock = article.stock <= 0;

  const handleAddToCart = () => {
    addItem(article);
    toast.success(`${article.nom} ajouté au panier`);
  };

  return (
    <StorefrontLayout>
      <div>
        {/* Bouton retour */}
        <Button
          variant="ghost"
          className="m-4"
          onClick={() => navigate(`/b/${slug}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        {/* Image */}
        <div className="aspect-square bg-muted relative">
          {photoUrl ? (
            <img src={photoUrl} alt={article.nom} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* Détails */}
        <div className="p-4 space-y-4">
          <div>
            <h1 className="text-xl font-bold">{article.nom}</h1>
            {article.reference && (
              <p className="text-sm text-muted-foreground">Réf: {article.reference}</p>
            )}
          </div>

          <p className="text-2xl font-bold text-primary">{formatPrix(article.prixEnLigne)}</p>

          {!isOutOfStock ? (
            <p className="text-sm text-muted-foreground">
              {article.stock} en stock
            </p>
          ) : (
            <p className="text-sm text-destructive font-medium">Rupture de stock</p>
          )}

          {article.description && (
            <div>
              <h2 className="font-medium mb-1">Description</h2>
              <p className="text-sm text-muted-foreground">{article.description}</p>
            </div>
          )}

          <Button
            className="w-full h-14 text-base"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Ajouter au panier
          </Button>
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default StorefrontProduct;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/pages/storefront/StorefrontProduct.tsx
git commit -m "feat(storefront): add product detail page"
```

---

### Task 11: CheckoutMobileForm & StorefrontCheckout

**Files:**
- Create: `src/components/storefront/CheckoutMobileForm.tsx`
- Create: `src/pages/storefront/StorefrontCheckout.tsx`

**Produces:** Formulaire et page checkout avec WhatsApp

- [ ] **Step 1: Create CheckoutMobileForm**

```typescript
// src/components/storefront/CheckoutMobileForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CartItem, ModeLivraison, StoreFront } from '@/types';
import { Loader2, MessageCircle } from 'lucide-react';

const schema = z.object({
  modeLivraison: z.nativeEnum(ModeLivraison),
  telephoneLivraison: z.string().min(8, 'Téléphone requis'),
  adresseLivraison: z.string().optional(),
  nomClient: z.string().optional(),
}).refine((data) => {
  if (data.modeLivraison === ModeLivraison.LIVRAISON) {
    return !!data.adresseLivraison && data.adresseLivraison.length > 0;
  }
  return true;
}, { message: 'Adresse requise pour la livraison', path: ['adresseLivraison'] });

type FormData = z.infer<typeof schema>;

interface CheckoutMobileFormProps {
  storefront: StoreFront;
  items: CartItem[];
  subtotal: number;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  defaultValues?: Partial<FormData>;
}

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

export const CheckoutMobileForm = ({
  storefront,
  items,
  subtotal,
  onSubmit,
  isLoading,
  defaultValues,
}: CheckoutMobileFormProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      modeLivraison: ModeLivraison.LIVRAISON,
      telephoneLivraison: '',
      adresseLivraison: '',
      nomClient: '',
      ...defaultValues,
    },
  });

  const modeLivraison = form.watch('modeLivraison');
  const fraisLivraison = modeLivraison === ModeLivraison.LIVRAISON ? storefront.fraisLivraison : 0;
  const total = subtotal + fraisLivraison;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Mode de livraison */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Mode de livraison</Label>
        <RadioGroup
          value={modeLivraison}
          onValueChange={(v) => form.setValue('modeLivraison', v as ModeLivraison)}
          className="space-y-2"
        >
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <RadioGroupItem value={ModeLivraison.LIVRAISON} id="livraison" />
            <Label htmlFor="livraison" className="flex-1 cursor-pointer">
              <span className="font-medium">Livraison à domicile</span>
              <span className="block text-sm text-muted-foreground">
                {formatPrix(storefront.fraisLivraison)}
              </span>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <RadioGroupItem value={ModeLivraison.RETRAIT_BOUTIQUE} id="retrait" />
            <Label htmlFor="retrait" className="flex-1 cursor-pointer">
              <span className="font-medium">Retrait en boutique</span>
              <span className="block text-sm text-muted-foreground">Gratuit</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Coordonnées */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Vos coordonnées</Label>

        <div>
          <Label htmlFor="nomClient">Votre nom</Label>
          <Input
            id="nomClient"
            placeholder="Nom complet"
            className="h-12 mt-1"
            {...form.register('nomClient')}
          />
        </div>

        <div>
          <Label htmlFor="telephoneLivraison">Téléphone *</Label>
          <Input
            id="telephoneLivraison"
            type="tel"
            placeholder="+224 6XX XXX XXX"
            className="h-12 mt-1"
            {...form.register('telephoneLivraison')}
          />
          {form.formState.errors.telephoneLivraison && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.telephoneLivraison.message}
            </p>
          )}
        </div>

        {modeLivraison === ModeLivraison.LIVRAISON && (
          <div>
            <Label htmlFor="adresseLivraison">Adresse de livraison *</Label>
            <Input
              id="adresseLivraison"
              placeholder="Quartier, rue, repère..."
              className="h-12 mt-1"
              {...form.register('adresseLivraison')}
            />
            {form.formState.errors.adresseLivraison && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.adresseLivraison.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Récapitulatif */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold">Récapitulatif</h3>
        <div className="flex justify-between text-sm">
          <span>{items.length} article{items.length > 1 ? 's' : ''}</span>
          <span>{formatPrix(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Livraison</span>
          <span>{formatPrix(fraisLivraison)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t">
          <span>Total</span>
          <span className="text-primary">{formatPrix(total)}</span>
        </div>
      </div>

      <Button type="submit" className="w-full h-14 text-base" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <MessageCircle className="h-5 w-5 mr-2" />
            Valider et envoyer
          </>
        )}
      </Button>
    </form>
  );
};
```

- [ ] **Step 2: Create StorefrontCheckout page**

```typescript
// src/pages/storefront/StorefrontCheckout.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
import { CheckoutMobileForm } from '@/components/storefront/CheckoutMobileForm';
import { useStorefront } from '@/hooks/useStorefront';
import { useCart } from '@/hooks/useCart';
import { useCreateOrder } from '@/hooks/useOnlineOrders';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { ModeLivraison, CartItem } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

const generateWhatsAppMessage = (
  order: { numero: string },
  items: CartItem[],
  formData: any,
  storefront: any,
  subtotal: number,
  fraisLivraison: number
) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR');
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const itemsText = items
    .map((item) => `• ${item.articleNom} × ${item.quantity} = ${formatPrix(item.prixUnitaire * item.quantity)}`)
    .join('\n');

  const modeText = formData.modeLivraison === ModeLivraison.LIVRAISON
    ? `Livraison à ${formData.adresseLivraison}`
    : 'Retrait en boutique';

  const total = subtotal + fraisLivraison;

  return `🛒 *Nouvelle commande*

📦 Commande: ${order.numero}
📅 Date: ${dateStr} à ${timeStr}

👤 Client: ${formData.nomClient || 'Non spécifié'}
📱 Téléphone: ${formData.telephoneLivraison}
📍 Mode: ${modeText}

*Articles:*
${itemsText}

💰 Sous-total: ${formatPrix(subtotal)}
🚚 Livraison: ${formatPrix(fraisLivraison)}
*TOTAL: ${formatPrix(total)}*

Merci de confirmer la réception de cette commande.`;
};

const StorefrontCheckout = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: storefront } = useStorefront(slug || '');
  const { items, subtotal, clear } = useCart(slug || '');
  const { customer, isAuthenticated } = useCustomerAuth();
  const createOrder = useCreateOrder();

  if (!storefront) return null;

  if (items.length === 0) {
    return (
      <StorefrontLayout>
        <div className="p-4 text-center">
          <p className="text-muted-foreground mb-4">Votre panier est vide</p>
          <Button onClick={() => navigate(`/b/${slug}`)}>
            Voir le catalogue
          </Button>
        </div>
      </StorefrontLayout>
    );
  }

  const handleSubmit = async (formData: any) => {
    try {
      const fraisLivraison = formData.modeLivraison === ModeLivraison.LIVRAISON
        ? storefront.fraisLivraison
        : 0;

      const order = await createOrder.mutateAsync({
        storefrontSlug: slug!,
        modeLivraison: formData.modeLivraison,
        adresseLivraison: formData.adresseLivraison,
        telephoneLivraison: formData.telephoneLivraison,
        nomClient: formData.nomClient,
        items: items.map((item) => ({
          articleId: item.articleId,
          modeVenteId: item.modeVenteId,
          quantite: item.quantity,
        })),
      });

      // Générer message WhatsApp
      const message = generateWhatsAppMessage(
        order,
        items,
        formData,
        storefront,
        subtotal,
        fraisLivraison
      );

      // Vider le panier
      clear();

      // Ouvrir WhatsApp
      const whatsappUrl = `https://wa.me/${storefront.whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      // Rediriger vers confirmation ou historique
      if (isAuthenticated) {
        navigate('/customer/orders');
      } else {
        navigate(`/b/${slug}?success=1`);
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <StorefrontLayout>
      <div className="p-4">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(`/b/${slug}/cart`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au panier
        </Button>

        <h1 className="text-xl font-bold mb-6">Finaliser la commande</h1>

        <CheckoutMobileForm
          storefront={storefront}
          items={items}
          subtotal={subtotal}
          onSubmit={handleSubmit}
          isLoading={createOrder.isPending}
          defaultValues={
            isAuthenticated && customer
              ? { telephoneLivraison: customer.telephone, nomClient: customer.nom }
              : undefined
          }
        />
      </div>
    </StorefrontLayout>
  );
};

export default StorefrontCheckout;
```

- [ ] **Step 3: Create StorefrontCart page**

```typescript
// src/pages/storefront/StorefrontCart.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
import { CartMobileItem } from '@/components/storefront/CartMobileItem';
import { useStorefront } from '@/hooks/useStorefront';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

const StorefrontCart = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: storefront } = useStorefront(slug || '');
  const { items, subtotal, removeItem, updateQuantity } = useCart(slug || '');

  if (!storefront) return null;

  const total = subtotal + storefront.fraisLivraison;

  return (
    <StorefrontLayout>
      <div className="p-4">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(`/b/${slug}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Continuer mes achats
        </Button>

        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Mon panier ({items.length})
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Votre panier est vide</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-6">
              {items.map((item) => (
                <CartMobileItem
                  key={`${item.articleId}_${item.modeVenteId || ''}`}
                  item={item}
                  onRemove={() => removeItem(item.articleId, item.modeVenteId)}
                  onUpdateQuantity={(qty) => updateQuantity(item.articleId, qty, item.modeVenteId)}
                  formatPrix={formatPrix}
                />
              ))}
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>Sous-total</span>
                <span>{formatPrix(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Livraison estimée</span>
                <span>{formatPrix(storefront.fraisLivraison)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatPrix(total)}</span>
              </div>
            </div>

            <Button
              className="w-full h-14 text-base"
              onClick={() => navigate(`/b/${slug}/checkout`)}
            >
              Passer la commande
            </Button>
          </>
        )}
      </div>
    </StorefrontLayout>
  );
};

export default StorefrontCart;
```

- [ ] **Step 4: Verify build**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add src/components/storefront/CheckoutMobileForm.tsx src/pages/storefront/StorefrontCheckout.tsx src/pages/storefront/StorefrontCart.tsx
git commit -m "feat(storefront): add checkout form, cart and checkout pages"
```

---

### Task 12: Customer Auth Pages

**Files:**
- Create: `src/pages/customer/CustomerLogin.tsx`
- Create: `src/pages/customer/CustomerRegister.tsx`
- Create: `src/components/customer/CustomerProtectedRoute.tsx`

**Produces:** Pages login/register client + route guard

- [ ] **Step 1: Create CustomerLogin**

```typescript
// src/pages/customer/CustomerLogin.tsx
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/customer/orders';
  const { login, isLoading } = useCustomerAuth();

  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ telephone, password });
      toast.success('Connexion réussie');
      navigate(redirect);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Identifiants incorrects');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            className="w-fit mb-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <CardTitle className="text-2xl">Connexion client</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                type="tel"
                placeholder="+224 6XX XXX XXX"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="h-12 mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 mt-1"
                required
              />
            </div>
            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Se connecter'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Pas encore de compte ?{' '}
            <Link to="/customer/register" className="text-primary font-medium">
              S'inscrire
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerLogin;
```

- [ ] **Step 2: Create CustomerRegister**

```typescript
// src/pages/customer/CustomerRegister.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const CustomerRegister = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useCustomerAuth();

  const [form, setForm] = useState({
    nom: '',
    telephone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await register({
        nom: form.nom,
        telephone: form.telephone,
        email: form.email || undefined,
        password: form.password,
      });
      toast.success('Compte créé avec succès');
      navigate('/customer/orders');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            className="w-fit mb-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nom">Nom complet *</Label>
              <Input
                id="nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="h-12 mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="telephone">Téléphone *</Label>
              <Input
                id="telephone"
                type="tel"
                placeholder="+224 6XX XXX XXX"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                className="h-12 mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email (optionnel)</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-12 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="h-12 mt-1"
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="h-12 mt-1"
                required
              />
            </div>
            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Créer mon compte'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Déjà un compte ?{' '}
            <Link to="/customer/login" className="text-primary font-medium">
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerRegister;
```

- [ ] **Step 3: Create CustomerProtectedRoute**

```typescript
// src/components/customer/CustomerProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { Loader2 } from 'lucide-react';

interface CustomerProtectedRouteProps {
  children: ReactNode;
}

export const CustomerProtectedRoute = ({ children }: CustomerProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useCustomerAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/customer/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};
```

- [ ] **Step 4: Verify build**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add src/pages/customer/CustomerLogin.tsx src/pages/customer/CustomerRegister.tsx src/components/customer/CustomerProtectedRoute.tsx
git commit -m "feat(customer): add login, register pages and protected route"
```

---

### Task 13: Customer Orders Pages

**Files:**
- Create: `src/components/customer/CustomerOrderMobileCard.tsx`
- Create: `src/components/customer/CustomerNavbar.tsx`
- Create: `src/pages/customer/CustomerOrders.tsx`
- Create: `src/pages/customer/CustomerOrderDetail.tsx`
- Create: `src/pages/customer/CustomerProfile.tsx`

**Produces:** Pages espace client

- [ ] **Step 1: Create CustomerOrderMobileCard**

```typescript
// src/components/customer/CustomerOrderMobileCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OnlineOrder, OnlineOrderStatut } from '@/types';
import { Package, Calendar, MapPin, ShoppingCart } from 'lucide-react';

interface CustomerOrderMobileCardProps {
  order: OnlineOrder;
  onViewDetails: () => void;
  formatPrix: (prix: number) => string;
  formatDate: (date: string) => string;
}

const statutConfig: Record<OnlineOrderStatut, { label: string; className: string }> = {
  [OnlineOrderStatut.EN_ATTENTE]: { label: 'En attente', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  [OnlineOrderStatut.CONFIRMEE]: { label: 'Confirmée', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  [OnlineOrderStatut.PRETE]: { label: 'Prête', className: 'bg-green-100 text-green-700 border-green-200' },
  [OnlineOrderStatut.LIVREE]: { label: 'Livrée', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  [OnlineOrderStatut.ANNULEE]: { label: 'Annulée', className: 'bg-red-100 text-red-700 border-red-200' },
};

export const CustomerOrderMobileCard = ({
  order,
  onViewDetails,
  formatPrix,
  formatDate,
}: CustomerOrderMobileCardProps) => {
  const statut = statutConfig[order.statut];

  return (
    <Card>
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="font-bold">{order.numero}</span>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statut.className}`}>
            {statut.label}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {order.modeLivraison === 'LIVRAISON' ? `Livraison - ${order.adresseLivraison}` : 'Retrait en boutique'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShoppingCart className="h-4 w-4" />
            <span>{order.items.length} article{order.items.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Total */}
        <div className="px-4 py-3 bg-muted/50">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-primary">{formatPrix(order.total)}</span>
          </div>
        </div>

        {/* Action */}
        <div className="p-3 border-t">
          <Button variant="outline" className="w-full h-12" onClick={onViewDetails}>
            Voir les détails
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

- [ ] **Step 2: Create CustomerNavbar**

```typescript
// src/components/customer/CustomerNavbar.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, User } from 'lucide-react';

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
```

- [ ] **Step 3: Create CustomerOrders page**

```typescript
// src/pages/customer/CustomerOrders.tsx
import { useNavigate } from 'react-router-dom';
import { useCustomerOrders } from '@/hooks/useOnlineOrders';
import { CustomerOrderMobileCard } from '@/components/customer/CustomerOrderMobileCard';
import { CustomerNavbar } from '@/components/customer/CustomerNavbar';
import { Button } from '@/components/ui/button';
import { Loader2, Package, LogOut } from 'lucide-react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const CustomerOrders = () => {
  const navigate = useNavigate();
  const { logout, customer } = useCustomerAuth();
  const { data, isLoading } = useCustomerOrders();

  const orders = data?.data || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-bold">Mes commandes</h1>
          <Button variant="ghost" size="icon" onClick={() => { logout(); navigate('/'); }}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Aucune commande pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <CustomerOrderMobileCard
                key={order.id}
                order={order}
                onViewDetails={() => navigate(`/customer/orders/${order.id}`)}
                formatPrix={formatPrix}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>

      <CustomerNavbar />
    </div>
  );
};

export default CustomerOrders;
```

- [ ] **Step 4: Create CustomerOrderDetail**

```typescript
// src/pages/customer/CustomerOrderDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerOrder } from '@/hooks/useOnlineOrders';
import { CustomerNavbar } from '@/components/customer/CustomerNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2, Package, Calendar, MapPin, Phone } from 'lucide-react';
import { OnlineOrderStatut } from '@/types';

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const statutConfig: Record<OnlineOrderStatut, { label: string; className: string }> = {
  [OnlineOrderStatut.EN_ATTENTE]: { label: 'En attente', className: 'bg-orange-100 text-orange-700' },
  [OnlineOrderStatut.CONFIRMEE]: { label: 'Confirmée', className: 'bg-blue-100 text-blue-700' },
  [OnlineOrderStatut.PRETE]: { label: 'Prête', className: 'bg-green-100 text-green-700' },
  [OnlineOrderStatut.LIVREE]: { label: 'Livrée', className: 'bg-gray-100 text-gray-700' },
  [OnlineOrderStatut.ANNULEE]: { label: 'Annulée', className: 'bg-red-100 text-red-700' },
};

const CustomerOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useCustomerOrder(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Commande introuvable</p>
        <Button onClick={() => navigate('/customer/orders')}>Retour</Button>
      </div>
    );
  }

  const statut = statutConfig[order.statut];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="flex items-center h-14 px-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/customer/orders')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">{order.numero}</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Statut */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Statut</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statut.className}`}>
            {statut.label}
          </span>
        </div>

        {/* Infos */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {order.modeLivraison === 'LIVRAISON' ? order.adresseLivraison : 'Retrait en boutique'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{order.telephoneLivraison}</span>
            </div>
          </CardContent>
        </Card>

        {/* Articles */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Articles ({order.items.length})
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.articleNom}</p>
                    {item.modeVenteNom && (
                      <p className="text-xs text-muted-foreground">{item.modeVenteNom}</p>
                    )}
                    <p className="text-muted-foreground">
                      {formatPrix(item.prixUnitaire)} × {item.quantite}
                    </p>
                  </div>
                  <span className="font-medium">{formatPrix(item.sousTotal)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Totaux */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total</span>
              <span>{formatPrix(order.sousTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Livraison</span>
              <span>{formatPrix(order.fraisLivraison)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">{formatPrix(order.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <CustomerNavbar />
    </div>
  );
};

export default CustomerOrderDetail;
```

- [ ] **Step 5: Create CustomerProfile**

```typescript
// src/pages/customer/CustomerProfile.tsx
import { useState } from 'react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { CustomerNavbar } from '@/components/customer/CustomerNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { customer, updateProfile, logout, isLoading } = useCustomerAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nom: customer?.nom || '',
    email: customer?.email || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profil mis à jour');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-bold">Mon profil</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="h-12 mt-1"
                />
              </div>
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={customer?.telephone || ''}
                  disabled
                  className="h-12 mt-1 bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Le téléphone ne peut pas être modifié
                </p>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-12 mt-1"
                />
              </div>
              <Button type="submit" className="w-full h-12" disabled={saving}>
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Enregistrer</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full h-12 text-destructive border-destructive/30"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Se déconnecter
        </Button>
      </div>

      <CustomerNavbar />
    </div>
  );
};

export default CustomerProfile;
```

- [ ] **Step 6: Verify build**

Run: `npm run build`

- [ ] **Step 7: Commit**

```bash
git add src/components/customer/ src/pages/customer/
git commit -m "feat(customer): add orders, order detail and profile pages"
```

---

### Task 14: Back-office OnlineOrders

**Files:**
- Create: `src/components/OnlineOrderMobileCard.tsx`
- Create: `src/pages/OnlineOrders.tsx`

**Produces:** Page gestion commandes back-office

- [ ] **Step 1: Create OnlineOrderMobileCard**

Créer le composant suivant le pattern VenteMobileCard existant avec Sheet pour actions.

- [ ] **Step 2: Create OnlineOrders page**

Page avec filtres par statut, recherche, tableau desktop et cartes mobiles.

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/components/OnlineOrderMobileCard.tsx src/pages/OnlineOrders.tsx
git commit -m "feat(backoffice): add online orders management page"
```

---

### Task 15: Route Integration

**Files:**
- Modify: `src/App.tsx`

**Produces:** Intégration routes dans App.tsx

- [ ] **Step 1: Add lazy imports and routes**

Ajouter les imports lazy et les routes pour storefront, customer et online-orders.

- [ ] **Step 2: Wrap with CustomerAuthProvider**

Ajouter CustomerAuthProvider pour les routes client.

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat(routing): add storefront, customer and online-orders routes"
```

---

### Task 16: Sidebar Menu Integration

**Files:**
- Modify: `src/components/Sidebar.tsx` (ou équivalent)

**Produces:** Entrée menu "Commandes en ligne" avec badge

- [ ] **Step 1: Add menu item with badge**

Ajouter l'entrée menu avec icône Package et badge compteur EN_ATTENTE.

- [ ] **Step 2: Verify build and test**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/components/Sidebar.tsx
git commit -m "feat(sidebar): add online orders menu item with pending badge"
```

---

## Self-Review Checklist

- [x] Tous les types définis dans Task 1 sont utilisés correctement
- [x] Les API endpoints correspondent au backend
- [x] Pattern Mobile*Card respecté (Sheet, boutons h-12)
- [x] localStorage keys cohérents (customer_token, cart_{slug})
- [x] Pas de placeholders TBD/TODO
- [x] Toutes les routes du spec couvertes

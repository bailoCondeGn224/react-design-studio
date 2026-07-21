# Espace Client & Commandes en Ligne - Frontend Design

## Vue d'ensemble

**Objectif :** Créer l'interface frontend pour permettre aux clients de parcourir le catalogue d'une boutique, passer des commandes en ligne, et suivre leurs commandes. Inclut également l'interface back-office pour la gestion des commandes reçues.

**Approche :** Intégration directe dans la structure existante avec préfixes de nommage. Mobile-first obligatoire.

**Backend :** Déjà implémenté (modules customer-auth, storefront, online-orders, notifications).

---

## Global Constraints

- **Mobile-first** : Toutes les pages doivent être conçues pour mobile en priorité
- **1 carte par ligne** sur mobile pour les produits (ProductMobileCard)
- **Pattern Mobile*Card** : Suivre le pattern existant (Sheet pour actions, boutons h-12)
- **Auth séparée** : CustomerAuthContext distinct de AuthContext (back-office)
- **localStorage** : Panier persistant + tokens client séparés
- **Charte graphique** : Utiliser les couleurs et composants shadcn/ui existants
- **Tailwind breakpoints** : mobile < 768px, tablet ≥ 768px, desktop ≥ 1024px

---

## Architecture

### Structure des fichiers

```
src/
├── api/
│   ├── customer-auth.ts         # Auth client
│   ├── storefront.ts            # API vitrine publique
│   └── online-orders.ts         # Commandes en ligne
├── components/
│   ├── storefront/              # Composants vitrine (100% mobile-first)
│   │   ├── StorefrontLayout.tsx
│   │   ├── StorefrontHeader.tsx
│   │   ├── StorefrontSearch.tsx
│   │   ├── ProductMobileCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── CartMobileItem.tsx
│   │   ├── CategoryFilter.tsx
│   │   └── CheckoutMobileForm.tsx
│   ├── customer/                # Composants espace client
│   │   ├── CustomerOrderMobileCard.tsx
│   │   ├── CustomerNavbar.tsx
│   │   └── CustomerProfileForm.tsx
│   └── OnlineOrderMobileCard.tsx
├── contexts/
│   └── CustomerAuthContext.tsx
├── hooks/
│   ├── useCart.ts
│   ├── useStorefront.ts
│   ├── useCustomerAuth.ts
│   └── useOnlineOrders.ts
├── pages/
│   ├── storefront/
│   │   ├── StorefrontHome.tsx
│   │   ├── StorefrontProduct.tsx
│   │   ├── StorefrontCart.tsx
│   │   └── StorefrontCheckout.tsx
│   ├── customer/
│   │   ├── CustomerLogin.tsx
│   │   ├── CustomerRegister.tsx
│   │   ├── CustomerOrders.tsx
│   │   ├── CustomerOrderDetail.tsx
│   │   └── CustomerProfile.tsx
│   └── OnlineOrders.tsx
└── types/
    └── customer.ts
```

---

## Routes

### Routes publiques (vitrine)

| Route | Page | Description |
|-------|------|-------------|
| `/b/:slug` | StorefrontHome | Catalogue produits de la boutique |
| `/b/:slug/product/:id` | StorefrontProduct | Détail d'un produit |
| `/b/:slug/cart` | StorefrontCart | Page panier |
| `/b/:slug/checkout` | StorefrontCheckout | Validation commande + WhatsApp |

### Routes client (auth client requise)

| Route | Page | Description |
|-------|------|-------------|
| `/customer/login` | CustomerLogin | Connexion client |
| `/customer/register` | CustomerRegister | Inscription client |
| `/customer/orders` | CustomerOrders | Liste des commandes |
| `/customer/orders/:id` | CustomerOrderDetail | Détail d'une commande |
| `/customer/profile` | CustomerProfile | Profil client |

### Routes back-office (auth employé)

| Route | Page | Description |
|-------|------|-------------|
| `/online-orders` | OnlineOrders | Gestion des commandes reçues |

### Protection des routes

- `/b/*` : Public, aucune auth requise
- `/b/:slug/checkout` : Public, auth client optionnelle (pré-remplit le formulaire)
- `/customer/*` : Protégé par `CustomerProtectedRoute` (customer_token)
- `/online-orders` : Protégé par `ProtectedRoute` existant (access_token employé)

---

## Composants

### Vitrine - StorefrontLayout

Layout principal pour toutes les pages `/b/:slug/*` :
- Header sticky avec logo boutique et badge panier
- Contenu scrollable
- Pas de footer (espace maximal)

### Vitrine - StorefrontHeader

```
┌─────────────────────────────┐
│ ☰  Logo Boutique    🛒 (3) │
└─────────────────────────────┘
```

- Menu hamburger (infos boutique, contact)
- Logo/nom boutique centré
- Icône panier avec badge compteur
- Position sticky top-0

### Vitrine - StorefrontSearch

- Input pleine largeur avec icône recherche
- Placeholder : "Rechercher un produit..."
- Debounce 300ms sur la saisie

### Vitrine - CategoryFilter

- Scroll horizontal de badges/chips
- Premier élément : "Tous" (sélectionné par défaut)
- Catégories de la boutique
- Style : badges outline, selected = filled primary

### Vitrine - ProductMobileCard

```
┌─────────────────────────────┐
│  📷 Image produit (aspect   │
│     ratio 4:3, object-cover)│
├─────────────────────────────┤
│  Nom du produit (truncate)  │
│  25,000 GNF (text-lg bold)  │
│  Stock: 15 disponibles      │
├─────────────────────────────┤
│  [    Ajouter au panier    ]│  ← Button h-12 w-full
└─────────────────────────────┘
```

- Card avec shadow-sm, rounded-lg
- Image placeholder si pas de photo
- Afficher stock disponible
- Bouton désactivé si stock = 0
- Click sur carte → page détail produit

### Vitrine - ProductGrid

- Grille responsive :
  - Mobile (< 768px) : 1 colonne, gap-4
  - Tablet (≥ 768px) : 2 colonnes, gap-6
  - Desktop (≥ 1024px) : 3 colonnes, gap-6
- Infinite scroll ou pagination simple

### Vitrine - CartDrawer

Sheet (drawer) depuis le bas de l'écran :

```
┌─────────────────────────────┐
│ Votre panier (3)        ✕   │
├─────────────────────────────┤
│ [Liste CartMobileItem]      │
│ (scroll si > 3 items)       │
├─────────────────────────────┤
│ Sous-total:      50,000 GNF │
│ Livraison:        5,000 GNF │
│ ─────────────────────────── │
│ TOTAL:           55,000 GNF │
├─────────────────────────────┤
│ [    Valider la commande   ]│
└─────────────────────────────┘
```

- Hauteur max 80vh
- Bouton fermer en haut à droite
- Bouton validation → `/b/:slug/checkout`

### Vitrine - CartMobileItem

```
┌─────────────────────────────┐
│ 📷 │ Nom produit            │
│ 40 │ 25,000 GNF × 2         │
│ px │ [-]  2  [+]        🗑  │
└─────────────────────────────┘
```

- Image miniature 40×40
- Nom produit (truncate)
- Prix unitaire × quantité
- Boutons +/- (h-10, w-10) avec quantité entre
- Bouton supprimer (icône trash)

### Vitrine - CheckoutMobileForm

Formulaire de validation de commande :

```
┌─────────────────────────────┐
│ Finaliser la commande       │
├─────────────────────────────┤
│ Mode de livraison:          │
│ ○ Livraison à domicile      │
│ ○ Retrait en boutique       │
├─────────────────────────────┤
│ Vos coordonnées:            │
│ [Téléphone *]               │
│ [Adresse livraison]         │
│ (si livraison sélectionnée) │
├─────────────────────────────┤
│ Récapitulatif:              │
│ 3 articles       50,000 GNF │
│ Livraison         5,000 GNF │
│ TOTAL            55,000 GNF │
├─────────────────────────────┤
│ [  Valider et envoyer 📱   ]│
└─────────────────────────────┘
```

- Radio buttons pour mode livraison
- Champs pré-remplis si client connecté
- Validation : téléphone requis, adresse requise si livraison
- Bouton unique "Valider et envoyer" :
  1. Crée la commande en BDD
  2. Ouvre WhatsApp avec message pré-formaté

### Customer - CustomerOrderMobileCard

Pattern Mobile*Card standard :

```
┌─────────────────────────────┐
│ 📦 CMD-2026-0042    [CONF.] │
├─────────────────────────────┤
│ 📅 21 juillet 2026          │
│ 📍 Livraison - Kaloum       │
│ 🛒 3 articles               │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ Total:       55,000 GNF │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ [      Voir les détails    ]│
└─────────────────────────────┘
```

- Badge statut coloré (EN_ATTENTE=orange, CONFIRMEE=blue, PRETE=green, LIVREE=gray, ANNULEE=red)
- Section montant avec fond coloré (bg-muted)
- Bouton ouvre Sheet avec détails complets

### Customer - CustomerNavbar

Bottom navigation (tab bar) fixe :

```
┌─────────────────────────────┐
│  🏠      📦      👤         │
│ Accueil Commandes Profil    │
└─────────────────────────────┘
```

- Position fixed bottom-0
- 3 onglets avec icône + label
- Highlight onglet actif (primary color)
- Safe area padding pour iPhone

### Back-office - OnlineOrderMobileCard

```
┌─────────────────────────────┐
│ 📦 CMD-2026-0042    [CONF.] │
├─────────────────────────────┤
│ 👤 Mamadou Diallo           │
│ 📱 +224 621 00 00 00        │
│ 📍 Livraison - Kaloum       │
│ 📅 21 juil. 2026 à 14:30    │
│ 🛒 3 articles               │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ Total:       55,000 GNF │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ [        Actions ▼         ]│
└─────────────────────────────┘
```

Actions dans Sheet :
- Voir détails
- Confirmer (si EN_ATTENTE)
- Marquer prête (si CONFIRMEE)
- Marquer livrée (si PRETE)
- Annuler (avec dialog motif)
- Appeler client (tel:)
- Ouvrir WhatsApp

---

## Contexte d'authentification client

### CustomerAuthContext

```typescript
interface CustomerAuthContextType {
  customer: CustomerAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (telephone: string, password: string) => Promise<void>;
  register: (data: RegisterCustomerDto) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateCustomerDto) => Promise<void>;
}
```

### Stockage localStorage

- `customer_token` : JWT client
- `customer_data` : Données client (cache)
- `cart_{slug}` : Panier par boutique

### CustomerProtectedRoute

```typescript
// Redirige vers /customer/login?redirect=... si non connecté
// Vérifie customer_token dans localStorage
// Complètement séparé de ProtectedRoute (back-office)
```

---

## API Services

### customer-auth.ts

```typescript
const customerAuthApi = {
  register: (data: RegisterCustomerDto) =>
    apiClient.post('/public/customer/auth/register', data),

  login: (data: LoginCustomerDto) =>
    apiClient.post('/public/customer/auth/login', data),

  getProfile: () =>
    customerApiClient.get('/public/customer/auth/me'),

  updateProfile: (data: UpdateCustomerDto) =>
    customerApiClient.patch('/public/customer/auth/me', data),
};
```

### storefront.ts

```typescript
const storefrontApi = {
  getBySlug: (slug: string) =>
    apiClient.get(`/public/storefront/${slug}`),

  getProducts: (slug: string, params?: ProductFilterParams) =>
    apiClient.get(`/public/storefront/${slug}/articles`, { params }),

  getProduct: (slug: string, articleId: string) =>
    apiClient.get(`/public/storefront/${slug}/articles/${articleId}`),

  getCategories: (slug: string) =>
    apiClient.get(`/public/storefront/${slug}/categories`),
};
```

### online-orders.ts

```typescript
const onlineOrdersApi = {
  // Client (public)
  create: (data: CreateOnlineOrderDto) =>
    apiClient.post('/public/orders', data),

  getMyOrders: (params?: PaginationParams) =>
    customerApiClient.get('/public/orders', { params }),

  getMyOrder: (id: string) =>
    customerApiClient.get(`/public/orders/${id}`),

  // Back-office
  getAll: (params?: OrderFilterParams) =>
    apiClient.get('/online-orders', { params }),

  getById: (id: string) =>
    apiClient.get(`/online-orders/${id}`),

  confirm: (id: string) =>
    apiClient.patch(`/online-orders/${id}/confirm`),

  markReady: (id: string) =>
    apiClient.patch(`/online-orders/${id}/ready`),

  markDelivered: (id: string) =>
    apiClient.patch(`/online-orders/${id}/deliver`),

  cancel: (id: string, data: CancelOrderDto) =>
    apiClient.patch(`/online-orders/${id}/cancel`, data),

  getStats: () =>
    apiClient.get('/online-orders/stats'),

  getPendingCount: () =>
    apiClient.get('/online-orders/pending-count'),
};
```

---

## Hooks

### useCart

```typescript
interface UseCartReturn {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (article: Article, quantity?: number) => void;
  removeItem: (articleId: string) => void;
  updateQuantity: (articleId: string, quantity: number) => void;
  clear: () => void;
}

// Stocke dans localStorage par slug : cart_{slug}
// Synchronise avec React state
```

### useStorefront

```typescript
const useStorefront = (slug: string) => useQuery({
  queryKey: ['storefront', slug],
  queryFn: () => storefrontApi.getBySlug(slug),
});

const useStorefrontProducts = (slug: string, filters?: ProductFilterParams) => useQuery({
  queryKey: ['storefront-products', slug, filters],
  queryFn: () => storefrontApi.getProducts(slug, filters),
});
```

### useCustomerAuth

```typescript
const useCustomerLogin = () => useMutation({...});
const useCustomerRegister = () => useMutation({...});
const useCustomerProfile = () => useQuery({...});
const useUpdateCustomerProfile = () => useMutation({...});
```

### useOnlineOrders

```typescript
// Côté client
const useCustomerOrders = (params) => useQuery({...});
const useCustomerOrder = (id) => useQuery({...});
const useCreateOrder = () => useMutation({...});

// Back-office
const useOnlineOrders = (params) => useQuery({...});
const useOnlineOrder = (id) => useQuery({...});
const useConfirmOrder = () => useMutation({...});
const useMarkOrderReady = () => useMutation({...});
const useMarkOrderDelivered = () => useMutation({...});
const useCancelOrder = () => useMutation({...});
const useOnlineOrderStats = () => useQuery({...});
const usePendingOrderCount = () => useQuery({...});
```

---

## Types

### customer.ts

```typescript
interface CustomerAccount {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
}

interface StoreFront {
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

interface CartItem {
  articleId: string;
  articleNom: string;
  articlePhoto?: string;
  modeVenteId?: string;
  modeVenteNom?: string;
  prixUnitaire: number;
  quantity: number;
}

enum OnlineOrderStatut {
  EN_ATTENTE = 'EN_ATTENTE',
  CONFIRMEE = 'CONFIRMEE',
  PRETE = 'PRETE',
  LIVREE = 'LIVREE',
  ANNULEE = 'ANNULEE',
}

enum ModeLivraison {
  LIVRAISON = 'LIVRAISON',
  RETRAIT_BOUTIQUE = 'RETRAIT_BOUTIQUE',
}

interface OnlineOrder {
  id: string;
  numero: string;
  statut: OnlineOrderStatut;
  modeLivraison: ModeLivraison;
  adresseLivraison?: string;
  telephoneLivraison?: string;
  fraisLivraison: number;
  sousTotal: number;
  total: number;
  items: OnlineOrderItem[];
  customerAccount?: CustomerAccount;
  motifAnnulation?: string;
  confirmeeLe?: string;
  preteLe?: string;
  livreeLe?: string;
  annuleeLe?: string;
  createdAt: string;
}

interface OnlineOrderItem {
  id: string;
  articleId: string;
  articleNom: string;
  modeVenteId?: string;
  modeVenteNom?: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

interface CreateOnlineOrderDto {
  storefrontSlug: string;
  modeLivraison: ModeLivraison;
  adresseLivraison?: string;
  telephoneLivraison: string;
  items: {
    articleId: string;
    modeVenteId?: string;
    quantite: number;
  }[];
}
```

---

## Intégration Back-office

### Menu latéral

Ajouter dans le menu existant :
- Icône : `Package` (lucide-react)
- Label : "Commandes en ligne"
- Badge : compteur commandes EN_ATTENTE (rouge)
- Position : après "Commandes" existantes

### Page OnlineOrders

- Header avec titre + bouton stats
- Filtres : statut (tabs), recherche, date
- Vue tableau (desktop) / cartes mobiles (mobile)
- Pagination standard
- Actions rapides par commande

### Workflow des statuts

```
EN_ATTENTE → Confirmer → CONFIRMEE (décrémente stock)
CONFIRMEE → Prête → PRETE
PRETE → Livrée → LIVREE (crée Vente)
* → Annuler → ANNULEE (motif requis)
```

---

## Message WhatsApp

Format du message généré lors de "Valider et envoyer" :

```
🛒 *Nouvelle commande*

📦 Commande: CMD-2026-0042
📅 Date: 21/07/2026 à 14:30

👤 Client: Mamadou Diallo
📱 Téléphone: +224 621 00 00 00
📍 Mode: Livraison à Kaloum

*Articles:*
• Produit 1 × 2 = 50,000 GNF
• Produit 2 × 1 = 18,000 GNF

💰 Sous-total: 68,000 GNF
🚚 Livraison: 5,000 GNF
*TOTAL: 73,000 GNF*

Merci de confirmer la réception de cette commande.
```

URL WhatsApp : `https://wa.me/{whatsappNumber}?text={encodedMessage}`

---

## Tests

### Scénarios critiques

1. **Parcours complet client non connecté** :
   - Accéder à `/b/ma-boutique`
   - Parcourir le catalogue
   - Ajouter des produits au panier
   - Passer commande (saisir téléphone + adresse)
   - Vérifier ouverture WhatsApp

2. **Parcours client connecté** :
   - Se connecter
   - Commander (infos pré-remplies)
   - Voir historique commandes
   - Suivre statut commande

3. **Gestion back-office** :
   - Recevoir notification nouvelle commande
   - Confirmer commande (vérifier décrémentation stock)
   - Workflow complet jusqu'à livraison
   - Annulation avec motif

4. **Edge cases** :
   - Boutique inactive
   - Produit en rupture de stock
   - Panier avec produit devenu indisponible
   - Session expirée pendant checkout

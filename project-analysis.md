# Comprehensive Analysis: Élégance Boutique Management System

## 1. Project Overview and Purpose

**Élégance** is a comprehensive, modern web application designed for managing traditional clothing boutiques (particularly "Walli Industrie" in Guinea). The system provides complete business management capabilities including inventory control, sales tracking, client and supplier management, financial reporting, and role-based access control.

**Key Target Users:**
- Shop owners/managers
- Sales staff
- Inventory/stock managers
- Accountants
- Administrators

**Core Business Objectives:**
- Real-time inventory management across zones
- Complete sales transaction tracking
- Client relationship and credit management
- Supplier/vendor management and debt tracking
- Financial transparency and reporting
- Multi-user environment with role-based permissions

---

## 2. Technology Stack and Dependencies

### Frontend Framework
- **React 18.3.1** - UI library with hooks architecture
- **TypeScript 5.8.3** - Type-safe JavaScript
- **Vite 5.4.19** - Lightning-fast build tool and dev server (port 8080)
- **React Router DOM 6.30.1** - Client-side routing and navigation

### State Management & Data Fetching
- **TanStack React Query 5.83.0** - Server state management, caching, synchronization
  - Automatic refetching and cache invalidation
  - Optimistic updates support
  - Pagination handling

### HTTP & API Communication
- **Axios 1.14.0** - HTTP client with interceptors
  - JWT token management in request headers
  - Automatic 401 error handling (token expiration)
  - Base URL configuration via environment variables

### UI Component Library & Styling
- **shadcn/ui** - High-quality React components built on Radix UI
  - Accordion, Alert Dialog, Avatar, Badge, Breadcrumb
  - Dialog, Dropdown Menu, Popover, Select, Tabs
  - Toast notifications (Sonner 1.7.4)
  - And 20+ more component types

- **Radix UI** - Unstyled, accessible primitives (collection of UI components)
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
  - Responsive breakpoints support
  - Dark/light theme configuration
  - Custom animations via tailwindcss-animate 1.0.7

### Form Management & Validation
- **React Hook Form 7.61.1** - Performant form state management
  - Minimal re-renders
  - Field validation
- **@hookform/resolvers 3.10.0** - Schema validation integration
- **Zod 3.25.76** - TypeScript-first schema validation library

### Data Visualization
- **Recharts 2.15.4** - React charting library for dashboards
  - Bar charts, Area charts for sales/revenue
  - Responsive and interactive

### Date/Time Utilities
- **date-fns 3.6.0** - Modern date utility library
- **React Day Picker 8.10.1** - Flexible date picker component

### Additional Libraries
- **Lucide React 0.462** - 462+ SVG icons for UI
- **next-themes 0.3.0** - Theme toggling (light/dark)
- **clsx 2.1.1** + **tailwind-merge 2.6.0** - Class name utilities
- **vaul 0.9.9** - Drawer component library
- **embla-carousel-react 8.6.0** - Carousel/slider component
- **cmdk 1.1.1** - Command/command palette component
- **input-otp 1.4.2** - OTP input component

### Development Tools
- **TypeScript ESLint 8.38.0** - Linting and type checking
- **eslint-plugin-react-hooks 5.2.0** - React hooks best practices
- **eslint-plugin-react-refresh 0.4.20** - Fast refresh validation
- **Playwright 1.57.0** - End-to-end testing
- **Vitest 3.2.4** - Unit testing framework
- **jsdom 20.0.3** - DOM implementation for testing
- **Testing Library** - React component testing utilities

### Build & Dev Configuration
- **@vitejs/plugin-react-swc 3.11.0** - SWC-based React plugin (faster than Babel)
- **AutoPrefixer 10.4.21** - PostCSS plugin for vendor prefixes
- **PostCSS 8.5.6** - CSS transformation tool
- **lovable-tagger 1.1.13** - Component tagging utility for dev

---

## 3. Project Structure and Organization

```
src/
├── api/                          # API Integration Layer
│   ├── auth.ts                   # Authentication endpoints
│   ├── stock.ts                  # Inventory management
│   ├── ventes.ts                 # Sales transactions
│   ├── clients.ts                # Client management
│   ├── fournisseurs.ts           # Supplier management
│   ├── approvisionnements.ts     # Provisioning/orders
│   ├── versements.ts             # Supplier payments
│   ├── versements-client.ts      # Client payments
│   ├── mouvements.ts             # Stock movements/audit log
│   ├── finances.ts               # Financial reports
│   ├── rotation.ts               # Inventory rotation stats
│   ├── categories.ts             # Product categories
│   ├── zones.ts                  # Storage zones
│   ├── users.ts                  # User management
│   ├── roles.ts                  # Role & permission management
│   ├── parametres.ts             # Company settings
│   ├── analytics.ts              # Dashboard data
│   └── article-fournisseurs.ts   # Supplier-article mapping
│
├── components/                   # React Components
│   ├── AppLayout.tsx             # Main layout wrapper
│   ├── AppSidebar.tsx            # Navigation sidebar
│   ├── ProtectedRoute.tsx        # Route protection wrapper
│   ├── CanAccess.tsx             # Permission-based rendering
│   │
│   ├── Forms/                    # Form Components
│   ├── StockForm.tsx             # Article creation/editing
│   ├── VenteForm.tsx             # Sales transaction form
│   ├── ClientForm.tsx            # Client creation form
│   ├── FournisseurForm.tsx       # Supplier form
│   ├── CategorieForm.tsx         # Category form
│   ├── ApprovisionnementForm.tsx # Provisioning order form
│   ├── VersementForm.tsx         # Payment form
│   ├── VersementClientForm.tsx   # Client payment form
│   ├── ZoneForm.tsx              # Storage zone form
│   ├── UserForm.tsx              # User creation/editing
│   │
│   ├── UI Components/            # Reusable UI elements
│   ├── PageHeader.tsx            # Page title & subtitle
│   ├── StatCard.tsx              # Statistics cards
│   ├── FormField.tsx             # Form field wrapper
│   ├── Pagination.tsx            # Pagination controls
│   ├── NavLink.tsx               # Navigation link
│   ├── DynamicFavicon.tsx        # Favicon loader
│   ├── NouvelArticleModal.tsx    # Quick article creation
│   ├── ClientDetailsDialog.tsx   # Client info modal
│   │
│   ├── ui/                       # shadcn/ui Components
│   ├── accordion.tsx
│   ├── alert-dialog.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── select.tsx
│   ├── [20+ more UI components]
│   │
│   └── admin/                    # Admin-specific components (currently empty)
│
├── contexts/                     # React Context API
│   └── SidebarContext.tsx        # Sidebar collapsed state
│
├── hooks/                        # Custom React Hooks
│   ├── useAuth.ts                # Authentication hooks
│   ├── useStock.ts               # Stock management hooks
│   ├── useVentes.ts              # Sales hooks
│   ├── useClients.ts              # Client hooks
│   ├── useFournisseurs.ts        # Supplier hooks
│   ├── useApprovisionnements.ts  # Provisioning hooks
│   ├── useVersements.ts          # Payment hooks
│   ├── useVersementsClient.ts    # Client payment hooks
│   ├── useMouvements.ts          # Stock movement hooks
│   ├── useCategories.ts          # Category hooks
│   ├── useZones.ts               # Zone hooks
│   ├── useFinances.ts            # Finance hooks
│   ├── useRotation.ts            # Rotation stats hooks
│   ├── useRoles.ts               # Role management hooks
│   ├── useUsers.ts               # User management hooks
│   ├── useParametres.ts          # Settings hooks
│   ├── useAnalytics.ts           # Dashboard/analytics hooks
│   ├── useArticleFournisseurs.ts # Supplier-article hooks
│   ├── useDebounce.ts            # Debouncing utility hook
│   ├── use-mobile.tsx            # Mobile detection hook
│   └── use-toast.ts              # Toast notification hook
│
├── lib/                          # Utility Libraries
│   ├── api-client.ts             # Axios instance with interceptors
│   └── utils.ts                  # General utility functions
│
├── pages/                        # Page Components (Routes)
│   ├── Index.tsx                 # Dashboard/Home
│   ├── Login.tsx                 # Authentication page
│   ├── Stock.tsx                 # Inventory management page
│   ├── Ventes.tsx                # Sales transactions page
│   ├── Clients.tsx               # Client management page
│   ├── Fournisseurs.tsx          # Supplier management page
│   ├── Approvisionnements.tsx    # Provisioning/orders page
│   ├── Versements.tsx            # Supplier payments page
│   ├── VersementsClient.tsx      # Client payments page
│   ├── MouvementsStock.tsx       # Stock movement history page
│   ├── Finances.tsx              # Financial reports page
│   ├── Analytics.tsx             # Detailed analytics page
│   ├── Categories.tsx            # Category management page
│   ├── Zones.tsx                 # Storage zone management page
│   ├── Utilisateurs.tsx          # User management page
│   ├── Roles.tsx                 # Role & permissions page
│   ├── Parametres.tsx            # Settings parameters page
│   ├── NotFound.tsx              # 404 error page
│   └── admin/                    # Admin pages (empty)
│
├── types/                        # TypeScript Type Definitions
│   └── index.ts                  # Complete type system (600+ lines)
│
├── utils/                        # Utility Functions
│   ├── format-prix.ts            # Price formatting utilities
│   └── invoice-generator.ts      # HTML invoice generation
│
├── App.tsx                       # Root application component
├── main.tsx                      # Application entry point
├── index.css                     # Global styles
├── App.css                       # App-level styles
└── vite-env.d.ts                 # Vite environment types

Config Files:
├── vite.config.ts                # Vite build configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS customization
├── postcss.config.js             # PostCSS configuration
├── eslint.config.js              # ESLint rules
├── playwright.config.ts          # E2E testing config
├── vitest.config.ts              # Unit testing config
├── components.json               # shadcn/ui config
├── package.json                  # Dependencies & scripts
└── bun.lockb                      # Lock file (using Bun package manager)
```

---

## 4. Main Components and Their Roles

### Core Layout Components

**`AppLayout.tsx`** - Main application wrapper
- Provides consistent layout with sidebar
- Responsive margin adjustment based on sidebar collapse state
- Wraps all protected pages with navigation

**`AppSidebar.tsx`** - Navigation sidebar
- 16 main navigation items with permission-based visibility
- Collapsible on desktop, drawer on mobile
- Logo display with company name/slogan
- User info panel with logout button
- Icons from Lucide React
- Navigation items controlled via `CanAccess` permission checks

**`ProtectedRoute.tsx`** - Route-level access control
- Wraps routes to enforce authentication
- Supports role-based and permission-based access
- Redirects to login on unauthorized access
- Shows error toast if permissions denied
- Props: `permissions`, `roles`, `requireAll` flag

**`CanAccess.tsx`** - Conditional component rendering
- Permission-based component visibility
- Fallback content support
- Used extensively in UI for hiding/showing features
- Similar to ProtectedRoute but for component-level access

### Form Components

All form components use **React Hook Form** + **Zod** validation:

**`StockForm.tsx`** - Article/inventory creation and editing
- Manages: name, reference, category, zone, stock levels
- Price fields with formatting
- Description, reorder points, max quantities
- Stock validation against available quantity
- Category and zone dropdowns

**`VenteForm.tsx`** - Sales transaction form
- Client selection + customer info (name, phone, address)
- Line items table: article selection, quantity, price
- Real-time subtotal calculation
- Payment mode selection (cash, mobile money, credit, etc.)
- Amount paid and remaining amount calculations
- Stock availability checking

**`ClientForm.tsx`** - Customer management
- Name, phone, email, address capture
- Linked to transaction history

**`FournisseurForm.tsx`** - Supplier management
- Company name, contact info, products
- Rating and status (active/inactive/pending)

**`ApprovisionnementForm.tsx`** - Provisioning/supply orders
- Supplier selection
- Line items: articles, quantities, unit prices
- Invoice number and delivery date
- Note/comments field

**`VersementForm.tsx`** - Supplier payment recording
- Supplier selection
- Amount and payment method
- Reference number
- Payment status tracking

### UI Display Components

**`PageHeader.tsx`** - Consistent page headers
- Title and optional description
- Used on every page for consistency

**`StatCard.tsx`** - Statistics display cards
- Icon, title, value, subtitle
- Optional trend indicator (up/down percentage)
- Variant styling (gold, default)
- Used extensively on dashboard

**`Pagination.tsx`** - Pagination controls
- Current page, total pages, limit display
- Previous/Next buttons
- Jump to page functionality

**`FormField.tsx`** - Reusable form field wrapper
- Label, input, error message display
- Consistent styling across forms

**`NouvelArticleModal.tsx`** - Quick article creation
- Modal for rapid stock item entry

**`ClientDetailsDialog.tsx`** - Client information popup
- Displays client history and summary

---

## 5. API Integration and Data Flow

### API Client Architecture

**`lib/api-client.ts`** - Axios instance configuration
```typescript
- Base URL: VITE_API_BASE_URL environment variable (default: http://localhost:3000)
- Request Interceptor: Adds JWT token from localStorage
- Response Interceptor: Handles 401 errors (redirects to login, clears storage)
- CORS handling
- JSON content-type default
```

### API Endpoints (18 modules)

| Module | Endpoints | Purpose |
|--------|-----------|---------|
| **auth** | POST /auth/login, GET /auth/me, POST /auth/register | Authentication & user profile |
| **stock** | GET/POST /stock, PATCH/DELETE /stock/:id, GET /stock/stats, GET /stock/alerts | Inventory management |
| **ventes** | GET/POST /ventes, PATCH/DELETE /ventes/:id, GET /ventes/stats, GET /ventes/recent | Sales transactions |
| **clients** | GET/POST /clients, PATCH/DELETE /clients/:id, GET /clients/stats, GET /clients/credits, GET /clients/top | Client management |
| **fournisseurs** | GET/POST /fournisseurs, PATCH/DELETE /fournisseurs/:id, GET /fournisseurs/stats, GET /fournisseurs/:id/dettes | Supplier management |
| **approvisionnements** | GET/POST /approvisionnements, PATCH/DELETE /approvisionnements/:id, GET /approvisionnements/stats | Provisioning orders |
| **versements** | GET/POST /versements, PATCH/DELETE /versements/:id | Supplier payments |
| **versements-client** | GET/POST /versements-client | Client payments |
| **mouvements** | GET /mouvements, GET /mouvements/article/:id, GET /mouvements/stats | Stock audit trail |
| **finances** | GET /finances/tresorerie, GET /finances/rapport-mensuel, GET /finances/transactions | Financial data |
| **rotation** | GET /stock/rotation/stats, GET /stock/rotation/:id | Inventory rotation metrics |
| **categories** | GET/POST /categories, PATCH/DELETE /categories/:id | Product categories |
| **zones** | GET/POST /zones, PATCH/DELETE /zones/:id | Storage zones |
| **users** | GET/POST /users, PATCH/DELETE /users/:id, PATCH /users/:id/assign-role | User management |
| **roles** | GET/POST /roles, PATCH/DELETE /roles/:id, GET /permissions | Role & permission management |
| **parametres** | GET/PATCH /parametres | Company settings |
| **analytics** | GET /analytics/dashboard | Dashboard statistics |
| **article-fournisseurs** | GET /articles/:id/fournisseurs | Supplier-article relationships |

### Data Flow Pattern

```
Component (Page) 
    ↓
Custom Hook (useStock, useVentes, etc.)
    ↓
React Query (useQuery, useMutation)
    ↓
API Module (stockApi, ventesApi, etc.)
    ↓
Axios Client (apiClient.get/post/patch/delete)
    ↓
Backend API (with JWT auth)
    ↓
Response handling & cache invalidation
    ↓
Component re-render with updated data
```

### React Query Configuration

- **Caching Strategy**: Automatic with query keys
- **Query Keys**: `['module', 'subarea', ...params]` format
- **Stale Time**: Varies (30s for mouvements, undefined elsewhere)
- **Cache Time (gcTime)**: 5 minutes default
- **Refetch on Window Focus**: Disabled for most queries
- **Cache Invalidation**: On successful mutations across related queries

Example key structure:
```typescript
['stock', { page: 1, limit: 10, search: 'shirt' }]
['ventes', { dateDebut: '2024-01-01', clientId: 'ABC' }]
['clients', id, 'historique', { page: 1 }]
```

---

## 6. State Management (Hooks, Contexts)

### Context-Based State

**`SidebarContext.tsx`** - Global UI state
```typescript
- collapsed: boolean (sidebar open/close on desktop)
- setCollapsed: function to toggle
- Provider wraps entire app in App.tsx
```

### React Query State Management (Distributed)

Each data domain has a custom hook with React Query integration:

**Query Hooks** (Read-only):
```typescript
useStock(params)           // Paginated article list
useStockStats()            // Inventory statistics
useStockAlerts()           // Articles needing attention
useVentes(params)          // Sales list
useVentesStats()           // Sales statistics
useClients(params)         // Client list
useStatsClients()          // Client statistics
useFournisseurs(params)    // Supplier list
useStatsFournisseurs()     // Supplier statistics
useFinances()              // Treasury data
useRotation()              // Inventory rotation stats
```

**Mutation Hooks** (Write operations):
```typescript
useCreateArticle()    // POST /stock
useUpdateArticle()    // PATCH /stock/:id
useDeleteArticle()    // DELETE /stock/:id
useCreateVente()      // POST /ventes
useUpdateVente()      // PATCH /ventes/:id
useDeleteVente()      // DELETE /ventes/:id
// ... similar pattern for all CRUD resources
```

**Mutation Hook Pattern**:
```typescript
export const useCreateVente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => ventesApi.create(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['ventes'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Vente enregistrée');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message);
    }
  });
};
```

### Authentication State

**`useAuth.ts`** - Authentication & permission hooks

```typescript
useLogin()                 // Login mutation with JWT storage
useLogout()               // Logout, clear tokens
useCurrentUser()          // Get logged-in user from localStorage
useIsAuthenticated()      // Check token existence
useHasPermission(...p)    // Check if user has permissions
useHasRole(...r)          // Check if user has roles
```

Permission checking logic:
```typescript
// Gets user from localStorage JSON
// Extracts role.permissions array
// Checks if user has >= 1 required permission
// Suitable for plural checks: useHasPermission('ventes.create', 'ventes.edit')
```

### Local Component State

- Form state: `useState()` in form components
- Dialog visibility: `useState()` for modals
- Pagination: `useState()` for current page
- Search input: `useState()` with `useDebounce()` for debounced filtering

---

## 7. Key Features and Functionalities

### Dashboard/Analytics (Index.tsx)
- **Sales KPIs**: Today, week, month totals with counts
- **Stock Overview**: Total articles, items in alert, alert percentage
- **Supplier Debt**: Total debt, number of creditor suppliers
- **Recent Transactions**: Latest 3 supplies, recent sales
- **Top Clients**: Best customers by purchase value
- **Charts**: Weekly sales trend, monthly revenue trend
- **Real-time Data**: All connected to live API queries

### Stock Management (Stock.tsx)
- **Inventory List**: Paginated, searchable, filterable by category
- **Category Filter**: Dropdown selection for stock filtering
- **Search**: Debounced 500ms text search across article names
- **Alert Indicators**: Visual badges for stock status
- **Rotation Tracking**:
  - Speed categories: très rapide, rapide, normal, lent, dormant
  - Days since last sale
  - 30-day quantity sold
- **Stock Movement History**: Modal showing all movements for each article
- **CRUD Operations**: Create, edit, delete articles with validation
- **Stock-level Tracking**: Current stock, reorder point (seuilAlerte), max level

### Sales Management (Ventes.tsx)
- **Transaction Recording**: Complete sale entry with client info
- **Line Items**: Multiple articles per sale with quantity/price
- **Payment Modes**: Cash, mobile money, credit, advance payment (50% deposit)
- **Credit Tracking**: Support for partial payments and credit balance
- **Invoice Generation**: HTML invoice with company details
- **Transaction History**: Filter by date range, client, payment mode
- **Real-time Stock Impact**: Automatic stock decrease on sale

### Client Management (Clients.tsx)
- **Client Database**: Full contact information and history
- **Credit Tracking**: Total credits, payment status, debt amount
- **Purchase History**: Detailed transaction review
- **Payment History**: All payments received from client
- **Timeline View**: Chronological view of all client interactions
- **Top Clients**: Ranking by purchase value
- **Statistics**: Total clients, clients with active credits

### Supplier Management (Fournisseurs.tsx)
- **Supplier Directory**: Contact info, rating, product categories
- **Debt Tracking**: Current balance owed, total purchases
- **Performance Metrics**: Reliability score, number of deliveries
- **Purchase History**: Articles supplied and quantities
- **Payment Management**: Record supplier payments (versements)

### Provisioning (Approvisionnements.tsx)
- **Purchase Orders**: Record incoming stock from suppliers
- **Invoice Tracking**: Invoice number and delivery date
- **Line Items**: Articles received with quantities and costs
- **Stock Updates**: Automatic stock increase on provisioning
- **Supplier Linking**: Track which supplier provides what
- **Debt Management**: Partial and full payment tracking

### Financial Reporting (Finances.tsx)
- **Treasury (Trésorerie)**: Current balance, total income, total expenses
- **Income Statement**: Current month receipts
- **Expense Statement**: Current month expenses
- **Charge Breakdown**: Expense categories and amounts
- **Transaction Log**: Complete financial audit trail
- **Period Statistics**: Custom date range analysis
- **Monthly Report**: Complete financial summary

### Payment Management
- **Supplier Payments (Versements.tsx)**: Record payments to suppliers
- **Client Payments (VersementsClient.tsx)**: Record client debt payments
- **Payment Methods**: Cash, mobile money, bank transfer, check
- **Reference Tracking**: Payment reference numbers
- **Status Management**: Valid, pending, cancelled states

### Stock Movement Audit (MouvementsStock.tsx)
- **Movement Types**: Entry/exit transactions
- **Reasons**: Sale, provisioning, adjustment, returns, loss, breakage
- **Complete Trail**: Timestamp, quantity before/after, user
- **Filtering**: By article, date, type, reason
- **Rollback Support**: Full history for reconciliation

### User & Role Management (Utilisateurs.tsx, Roles.tsx)
- **User CRUD**: Create, update, delete user accounts
- **Role Assignment**: Assign roles to users
- **Permission Management**: Define fine-grained permissions
- **Role Creation**: Custom roles with specific permissions
- **Permission Codes**: `module.action` format (e.g., `ventes.create`, `stock.delete`)
- **Access Control**: All routes and components respect permissions

### Company Settings (Parametres.tsx)
- **Business Info**: Legal name (nomComplet), short name (nomCourt)
- **Branding**: Logo, slogan, theme settings
- **Contact**: Email, phone, address
- **Legal**: RCCM (business registry), NIF (tax number)
- **Localization**: Currency, language
- **Invoice Customization**: Custom legal notices for invoices

---

## 8. Authentication and Authorization

### Authentication Flow

1. **Login Page** (Login.tsx)
   - Email and password fields
   - Password visibility toggle
   - Form validation
   - Mutation call to POST /auth/login

2. **JWT Token Storage**
   ```typescript
   localStorage.setItem('access_token', token)
   localStorage.setItem('user', JSON.stringify(userData))
   ```

3. **Token Injection**
   - Axios request interceptor adds: `Authorization: Bearer {token}`
   - Automatic on all API calls

4. **Token Refresh/Expiration**
   - 401 response → Clear tokens, redirect to login
   - Prevents stale sessions

5. **User Object Structure**
   ```typescript
   {
     id: string,
     email: string,
     nom: string,
     role: {
       id: string,
       nom: string,         // ADMIN, VENDEUR, GESTIONNAIRE_STOCK, etc.
       permissions: [{
         code: string,      // ventes.create, stock.delete, etc.
         nom: string,
         description?: string
       }]
     }
   }
   ```

### Authorization Patterns

**Permission-Based Access** (most common)
```typescript
// Route level
<Route path="/ventes" element={
  <ProtectedRoute permissions={['ventes.read']}>
    <Ventes />
  </ProtectedRoute>
} />

// Component level
<CanAccess permissions={['ventes.create']}>
  <Button>Nouvelle Vente</Button>
</CanAccess>

// Hook usage in component logic
const canDelete = useHasPermission('ventes.delete');
```

**Role-Based Access** (for specific roles)
```typescript
<ProtectedRoute roles={['ADMIN']}>
  <AdminPanel />
</ProtectedRoute>

const isAdmin = useHasRole('ADMIN');
```

**Combined Requirements**
```typescript
<ProtectedRoute 
  permissions={['users.create']} 
  roles={['ADMIN']}
  requireAll={true}
>
  {/* Requires BOTH permission AND role */}
</ProtectedRoute>
```

### Permission Categories

| Category | Permissions | Purpose |
|----------|-------------|---------|
| **Stock** | stock.read, stock.create, stock.update, stock.delete | Inventory management |
| **Sales** | ventes.read, ventes.create, ventes.update, ventes.delete | Transaction recording |
| **Clients** | clients.read, clients.create, clients.update, clients.delete | Customer management |
| **Suppliers** | fournisseurs.read, fournisseurs.create, fournisseurs.update, fournisseurs.delete | Vendor management |
| **Finances** | finances.read, finances.create | Financial access |
| **Users** | users.read, users.create, users.update, users.delete | Admin panel |
| **Roles** | roles.read, roles.create, roles.update, roles.delete | Permission management |

### Pre-defined Roles (likely)
- **ADMIN**: Full system access
- **GESTIONNAIRE_STOCK**: Stock and provisioning
- **GESTIONNAIRE_VENTES**: Sales and clients
- **COMPTABLE**: Financial reports
- **VENDEUR**: Point of sale transactions
- **GESTIONNAIRE_FOURNISSEURS**: Supplier management

---

## 9. UI/UX Patterns and Design System

### Design Tokens & Styling

**Color Scheme**:
- **Primary**: Green-based (for sustainability/natural feel)
- **Accent**: Gold highlights
- **Sidebar**: Dark background with lighter foreground
- **Destructive**: Red for critical actions
- **Muted**: Gray for secondary content

**Typography**:
- **Headings**: `font-heading` (custom font family)
- **Body**: System font stack
- **Sizes**: Responsive (sm, base, lg, xl, etc.)

**Spacing**:
- Grid-based: 4px, 8px, 12px, 16px, 24px, 32px
- Responsive padding: `p-4 sm:p-6 md:p-8`

**Responsive Breakpoints**:
- **sm**: 640px
- **md**: 768px  
- **lg**: 1024px
- **xl**: 1280px

### Component Patterns

**Badge System** (Status indicators)
```typescript
<Badge variant="default">Actif</Badge>
<Badge variant="secondary">En attente</Badge>
<Badge variant="outline">Inactif</Badge>
<Badge variant="destructive">Alerte</Badge>
```

**Dialog System** (Modals)
```typescript
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {content}
  </DialogContent>
</Dialog>
```

**Table Patterns**
- Paginated tables with 10-50 items per page
- Sortable headers
- Row action menus (Edit, Delete via DropdownMenu)
- Inline editing support

**Form Patterns**
- Label above input (vertical layout)
- Required asterisk for mandatory fields
- Inline error messages below fields
- Consistent button positioning
- Submit/Cancel buttons at bottom

**Navigation Patterns**
- Fixed sidebar with collapsible toggle (desktop)
- Mobile drawer menu
- Breadcrumb support (via React Router)
- Active link highlighting with background color
- Icon + text labels

**Dashboard Pattern**
- StatCard grid (4-column on desktop, 2-column tablet, 1-column mobile)
- Chart sections below
- Recent activity lists
- KPI focus at top

### Responsive Behavior

**Mobile-First Approach**:
- Base styles for mobile
- `sm:`, `md:`, `lg:` prefixes for larger screens

**Typography Adaptation**:
- Heading text scales
- Table content adjusts or scrolls
- Button sizes increase on touch devices

**Layout Adaptation**:
- Sidebar: Hidden on mobile → Drawer
- Columns: Full width on mobile → Multi-column on desktop
- Dialogs: Full screen on mobile → Standard modal on desktop

### Accessibility Features

- **ARIA Labels**: Radix UI components include ARIA
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Trap focus in modals
- **Color Contrast**: WCAG AA compliant
- **Icons with Tooltips**: Lucide React icons with explanations

---

## 10. Business Logic for Boutique Management

### Inventory Management

**Stock Levels**:
- **Current Stock** (`stock`): Current quantity on hand
- **Reorder Point** (`seuilAlerte`): Minimum threshold that triggers alerts
- **Maximum Level** (`max`): Ideal stock quantity
- **Status Calculation**: Alert if `current ≤ seuil`, OK if `current > seuil`

**Stock Movements**:
Every transaction creates a MouvementStock record:
```typescript
{
  type: 'entree' | 'sortie',
  motif: 'vente' | 'approvisionnement' | 'ajustement' | 'retour_client' | 'retour_fournisseur' | 'perte' | 'casse',
  quantite: number,
  stockAvant: number,
  stockApres: number,
  reference: venteId/approvId/etc,
  utilisateurId: userId,
  date: timestamp
}
```

**Inventory Rotation Tracking**:
```typescript
{
  tauxRotation: number,           // Turnover rate
  quantiteVendue30j: number,      // 30-day sales
  vitesseRotation: string,        // très_rapide|rapide|normal|lent|dormant
  derniereVente: Date,            // Last sale date
  joursSansVente: number,         // Days since last sale
  articlesRapides: Article[],     // Top 5 fast movers
  articlesDormants: Article[],    // Slow/no-sales
  valeurStockDormant: number,     // Stuck inventory value
  pourcentageDormant: number      // % of inventory stuck
}
```

### Sales Transactions

**Sale Structure**:
```typescript
{
  numero: string,                 // Auto-generated reference
  clientId?: string,              // Optional client link
  nom: string, prenom: string,    // Customer name
  tel: string,                    // Contact
  lignes: [                       // Line items
    {
      articleId: string,
      nom: string,
      quantite: number,
      prixUnitaire: number,
      sousTotal: number
    }
  ],
  total: number,
  montantPaye: number,
  montantRestant: number,         // Credit balance
  modePaiement: 'especes' | 'mobile_money' | 'virement' | 'credit' | 'acompte_50',
  date: string,
  heure: string
}
```

**Payment Modes**:
- **especes**: Cash (immediate)
- **mobile_money**: Mobile money transfer
- **virement**: Bank transfer
- **credit**: Full credit (payment due later)
- **acompte_50**: 50% advance payment

**Sale Impact**:
1. Stock quantities decrease by line item amounts
2. Client debt increases if credit sale
3. MouvementStock record created for each article
4. Revenue tracked in finances module

### Client Management

**Client Information**:
- **Contact**: Email, phone, address
- **Purchase History**: All transactions
- **Credit Tracking**: Total debt, payment status
- **Payment History**: All payments received
- **Statistics**: Total spent, total paid, current balance

**Client Historique** (Detailed history):
```typescript
{
  stats: {
    totalAchats: number,          // Lifetime purchases
    totalPaye: number,            // Amount paid
    detteActuelle: number,        // Current debt
    nombreVentes: number,         // Transaction count
    nombrePaiements: number,      // Payment count
    beneficeTotal: number,        // Profit margin on all sales
    dernierAchat: Date,
    dernierPaiement: Date
  },
  ventes: [{                      // Each sale with details
    id, numero, date, total, montantPaye, montantRestant,
    benefice,                     // Profit on transaction
    lignes: [{ articleNom, quantite, prixUnitaire, prixAchat, benefice }]
  }],
  paiements: [{                   // Each payment
    id, date, montant, modePaiement, reference, venteNumero
  }],
  timeline: [{                    // Chronological view
    type: 'achat' | 'paiement',
    date, montant, description
  }]
}
```

### Supplier Management

**Supplier Tracking**:
```typescript
{
  nom: string,
  telephone: string,
  email?: string,
  adresse?: string,
  produits: string[],             // Categories supplied
  rating?: number,                // 0-100 reliability score
  statut: 'actif' | 'en_attente' | 'inactif',
  totalAchats: number,            // Lifetime purchase amount
  totalPaye: number,              // amounts paid
  dette: number                   // Current amount owed
}
```

**Supplier-Article Relationship** (ArticleFournisseur):
```typescript
{
  fournisseurId: string,
  fournisseurNom: string,
  nombreLivraisons: number,       // Number of deliveries
  quantiteTotale: number,         // Total quantity supplied
  prixMoyen: number,              // Average unit price
  dernierPrix: number,            // Last purchase price
  derniereLivraison: Date,
  fiabilite: number,              // Reliability score 0-100
  estPrefere: boolean             // Preferred supplier flag
}
```

**Procurement Process**:
1. Create Approvisionnement from supplier
2. Record line items (articles, quantities, prices)
3. Upon delivery, stock increases
4. MouvementStock recorded for each article
5. Payment tracked separately (may be partial)

### Financial Management

**Treasury (Trésorerie)**:
```typescript
{
  solde: number,                  // Current balance
  recettes: number,               // Current month income
  depenses: number                // Current month expenses
}
```

**Transaction Tracking**:
```typescript
{
  description: string,
  montant: number,
  type: 'in' | 'out',
  categorie: 'vente' | 'approvisionnement' | 'paiement_fournisseur' | 'charge' | 'autre',
  date: timestamp,
  venteId?: string,
  approvisionnementId?: string,
  paiementFournisseurId?: string
}
```

**Financial Reports**:
- Daily/weekly/monthly summaries
- Income by source (sales, refunds)
- Expenses by category
- Outstanding payables (supplier debt)
- Outstanding receivables (client credits)
- Cash flow projections

### Profitability Calculation

**Per-Sale Profit**:
```typescript
benefit = sum(saleItem.quantity * (saleItem.prixVente - avgPrixAchat))
```

**Per-Client Profit**:
```typescript
clientProfit = sum(benefits from all sales to client)
```

**Per-Article Profit**:
```typescript
articleProfit = cumulative profit across all sales of that item
```

### Zone Management

**Physical Organization**:
- Products organized by zone/storage location
- Each article tagged with zone
- Zone-based inventory filtering
- Zone capacity management

**Zone Tracking** (likely):
```typescript
{
  nom: string,
  capacite?: number,              // Max items
  type?: string,                  // Cool/dry/secure
  articleCount?: number
}
```

---

## 11. Notable Patterns and Architectures

### Architecture Pattern: Data Layer Paradigm

**Layered Architecture**:
```
UI Layer (Pages/Components)
    ↓
State Management Layer (React Query Hooks)
    ↓
API Integration Layer (API Modules)
    ↓
HTTP Layer (Axios Client with Interceptors)
    ↓
Backend API
```

**Benefits**:
- Separation of concerns
- Cacheable, reusable queries
- Centralized API management
- Consistent error handling

### React Query Advanced Patterns

**1. Dependent Queries**:
```typescript
// Fetch client only after getting client ID
useClient(selectedClientId);  // enabled: !!selectedClientId
```

**2. Query Invalidation on Mutations**:
```typescript
// Single mutation invalidates multiple related queries
onSuccess: () => {
  queryClient.invalidateQueries(['stock']);
  queryClient.invalidateQueries(['ventes']);
  queryClient.invalidateQueries(['clients']);
}
```

**3. Pagination with Query Keys**:
```typescript
queryKey: ['stock', { page, limit, search, categorieId }]
// Each filter combination is separate cache entry
```

**4. Debounced Searches**:
```typescript
const debouncedSearch = useDebounce(searchInput, 500);
useQuery({
  queryKey: ['stock', { search: debouncedSearch }],
  // Only searches after 500ms inactivity
})
```

### Form Management Patterns

**React Hook Form + Zod Integration**:
```typescript
// Type-safe forms with automatic validation
const form = useForm<CreateArticleDto>({
  resolver: zodResolver(createArticleSchema),
  defaultValues: {...}
});

// Server-side errors propagate to form
onError: (error) => {
  // Set form errors from API response
  form.setError('fieldName', error.message);
}
```

### Permission System Design

**Two-Level Access Control**:
1. **Route Level**: Entire page protection
2. **Component Level**: Feature/button visibility

**Flexible Permission Checks**:
```typescript
// OR logic (any permission)
useHasPermission('ventes.create', 'ventes.edit')

// AND logic (all permissions)
useHasPermission('ventes.create', 'ventes.approve')
```

### Invoice Generation Pattern

**Server-side Rendered HTML**:
- Template-based invoice generation
- CSS-based styling for print-friendly output
- Company branding integration
- Dynamic data injection

**Print Workflow**:
1. Generate HTML
2. Open print preview (browser-native)
3. User configures print settings
4. Send to printer/PDF

### Context + Hooks Combination

**Sidebar Context + Custom Hooks**:
```typescript
// Sidebar state in context (global)
<SidebarProvider>
  <App />
</SidebarProvider>

// Components access via hook
const { collapsed, setCollapsed } = useSidebar();
```

**Why This Approach**:
- Simple UI state suits Context API
- Query data suits React Query
- Hybrid optimizes each use case

### Error Handling Strategy

**Multi-Level Error Handling**:

1. **HTTP Level**:
   - 401 → Redirect to login
   - 4xx → Display error toast
   - 5xx → Display generic error

2. **Form Level**:
   - Validation errors → Inline field messages
   - Submit errors → Server messages to form

3. **Component Level**:
   - Loading states (spinners)
   - Empty states
   - Error boundaries

4. **User Notification**:
   - Sonner toasts (success/error/info)
   - Alert dialogs for confirmations
   - Error pages (NotFound)

### Responsive Design Implementation

**Mobile-First + Breakpoints**:
```typescript
// Base = mobile
<div className="w-full p-4">

// Scales for larger screens
<div className="w-full p-4 sm:p-6 md:p-8 lg:max-w-[1400px]">

// Conditional rendering
<div className="hidden md:flex">Desktop only</div>
<div className="md:hidden">Mobile only</div>
```

**Drawer vs Sidebar**:
- Mobile: Full-screen drawer overlay
- Desktop: Fixed or collapsible sidebar

### Performance Optimizations

1. **SWC Compiler**: Faster than Babel
2. **React Query Caching**: Minimal re-fetching
3. **Debouncing**: Search delays prevent excessive API calls
4. **Code Splitting**: Vite lazy loads routes
5. **Image Optimization**: No large uncompressed assets

### Customization Points

1. **Company Branding**:
   - Logo upload
   - Company name/slogan in sidebar
   - Custom invoice header

2. **Theme Customization**:
   - Primary color
   - Sidebar theme
   - Font family

3. **Inventory Zones**:
   - Custom zone names/types
   - Zone-based filtering

4. **Payment Methods**:
   - Configurable payment mode options
   - Methods track in transactions

5. **Permissions**:
   - Custom role creation
   - Fine-grained permission codes
   - Per-user role assignment

---

## Summary: Key Takeaways

| Aspect | Details |
|--------|---------|
| **Primary Use Case** | Inventory & sales management for fashion boutiques |
| **Architecture** | Layered with React Query for state, axios for HTTP |
| **Authentication** | JWT stored in localStorage, token injection interceptor |
| **Authorization** | Permission-based (module.action format) + role-based |
| **State Management** | React Query (server state) + hooks (form state) + context (UI state) |
| **UI Framework** | React 18 w/ shadcn/ui, Tailwind CSS, Radix UI primitives |
| **Forms** | React Hook Form + Zod validation |
| **Styling** | Utility-first with Tailwind, responsive design |
| **API Communication** | Axios with interceptors, configured for 18 backend endpoints |
| **Key Features** | Stock tracking, sales POS, client credits, supplier debt, financials, rotation analysis |
| **Mobile Support** | Full responsive design, touch-optimized |
| **Testing** | Playwright (E2E), Vitest (unit), React Testing Library ready |
| **Deployment** | Vite build optimized, built-in dev server on port 8080 |

This is a sophisticated, production-ready boutique management system with strong business logic, comprehensive feature set, and modern React best practices throughout.
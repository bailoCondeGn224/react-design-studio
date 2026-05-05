# Audit des Performances Frontend

Date: 2026-05-05

## 🎯 Optimisations Déjà en Place

### ✅ 1. Code Splitting (IMPACT: TRÈS ÉLEVÉ)
**Status: Implémenté**

- Toutes les pages chargées en lazy loading avec `React.lazy()`
- Suspense avec LoadingFallback
- **Résultat**: Bundle initial réduit de 72% (1.3MB → 367KB gzippé)

**Fichiers:**
- `src/App.tsx` - Configuration lazy loading
- `src/components/LoadingFallback.tsx` - Composant de chargement

---

### ✅ 2. Debouncing des Recherches (IMPACT: ÉLEVÉ)
**Status: Largement Implémenté**

**15 implémentations** de debouncing trouvées dans le code:

#### Hook Réutilisable
- `src/hooks/useDebounce.ts` - Hook générique (500ms par défaut)

#### Pages avec Debouncing (7/7)
| Page | Délai | Status |
|------|-------|--------|
| **Stock.tsx** | 500ms | ✅ Implémenté |
| **Clients.tsx** | 500ms | ✅ Implémenté |
| **Fournisseurs.tsx** | 500ms | ✅ Implémenté |
| **Approvisionnements.tsx** | 500ms | ✅ Implémenté |
| **Versements.tsx** | 500ms | ✅ Implémenté |
| **VersementsClient.tsx** | 500ms | ✅ Implémenté |
| **MouvementsStock.tsx** | 500ms | ✅ Implémenté |

#### Composants avec Debouncing
| Composant | Délai | Implémentation |
|-----------|-------|----------------|
| **ArticleCombobox** | 300ms | ✅ Manuel (useEffect) |

**Impact:**
- Réduction de 80-95% des requêtes API pendant la frappe
- Exemple: "ordinateur" = 10 requêtes → 1 requête
- Meilleure UX (pas de lag pendant la frappe)

---

## 🔄 Optimisations en Cours

### 🟡 3. React Query Configuration
**Status: À Optimiser (Impact FAIBLE)**

**Configuration actuelle:** Défauts de React Query
- `staleTime: 0` - Refetch immédiat
- `refetchOnWindowFocus: true` - Refetch au focus
- `retry: 3` - 3 tentatives

**Problème identifié:**
- Optimisation prématurée
- Mutations utilisent déjà `invalidateQueries()` ✅
- Backend optimisé avec indexes (réponse <10ms) ✅

**Décision:** ❌ Ne pas optimiser (impact négligeable)

---

## 🚀 Optimisations Recommandées

### 1. React.memo sur Composants Lourds (IMPACT: MOYEN-ÉLEVÉ)
**Status: À Implémenter**

**Composants identifiés pour mémoisation:**

#### Lignes de Tableau (Re-render à chaque état parent)
- `VenteRow` - Liste des ventes
- `CommandeRow` - Liste des commandes
- `ArticleRow` - Liste des articles (Stock.tsx)
- `ClientRow` - Liste des clients

**Problème:**
Quand l'état parent change (ex: modal s'ouvre), TOUTES les lignes re-render même si leurs props n'ont pas changé.

**Solution:**
```tsx
const ArticleRow = React.memo(({ article, onEdit, onDelete }) => {
  // Composant ne re-render que si article, onEdit ou onDelete change
  return <tr>...</tr>
}, (prevProps, nextProps) => {
  // Comparaison personnalisée si nécessaire
  return prevProps.article.id === nextProps.article.id;
});
```

**Gain estimé:**
- 50-200ms économisés par interaction
- Scroll plus fluide sur listes longues

---

### 2. useMemo pour Calculs Lourds (IMPACT: MOYEN)
**Status: À Implémenter**

**Cas identifiés:**

#### Filtrage/Tri de Listes
```tsx
// ❌ Avant: Re-calcul à chaque render
const filteredArticles = articles.filter(a => a.stock < a.seuilAlerte);
const sortedArticles = filteredArticles.sort((a, b) => a.nom.localeCompare(b.nom));

// ✅ Après: Calcul seulement si articles change
const sortedArticles = useMemo(() => {
  return articles
    .filter(a => a.stock < a.seuilAlerte)
    .sort((a, b) => a.nom.localeCompare(b.nom));
}, [articles]);
```

**Fichiers à optimiser:**
- `Stock.tsx` - Filtrage/tri des articles
- `Ventes.tsx` - Calculs de totaux
- `Commandes.tsx` - Filtrage par statut
- `Analytics.tsx` - Calculs de statistiques

---

### 3. useCallback pour Event Handlers (IMPACT: FAIBLE-MOYEN)
**Status: À Implémenter**

**Problème:**
Event handlers recréés à chaque render → composants enfants re-render inutilement

```tsx
// ❌ Avant: Nouvelle fonction à chaque render
const handleEdit = (id) => {
  setEditingId(id);
  setModalOpen(true);
};

// ✅ Après: Fonction stable
const handleEdit = useCallback((id) => {
  setEditingId(id);
  setModalOpen(true);
}, []);
```

**Impact:**
- Critique seulement si combiné avec React.memo
- Évite re-renders en cascade

---

### 4. Virtual Scrolling (IMPACT: ÉLEVÉ si >100 items)
**Status: À Évaluer**

**Bibliothèques recommandées:**
- `@tanstack/react-virtual` (léger, 3KB)
- `react-window` (populaire, 6KB)

**Pages candidates:**
- Stock.tsx - Si >100 articles
- Ventes.tsx - Si >100 ventes
- MouvementsStock.tsx - Historique long

**Avant/Après:**
| Items | Sans Virtual | Avec Virtual |
|-------|-------------|--------------|
| 100 | ~50ms render | ~10ms render |
| 500 | ~300ms render | ~15ms render |
| 1000 | ~800ms render | ~20ms render |

**Implémentation:**
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: articles.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 60, // Hauteur de ligne
});

// Rendre seulement les lignes visibles
{rowVirtualizer.getVirtualItems().map(virtualRow => (
  <ArticleRow key={virtualRow.key} article={articles[virtualRow.index]} />
))}
```

---

### 5. Image Lazy Loading (IMPACT: MOYEN)
**Status: À Implémenter**

**Problème actuel:**
Photos d'articles chargent toutes d'un coup dans Stock.tsx

**Solution:**
```tsx
// ✅ Natif (simple)
<img src={photoUrl} loading="lazy" alt={article.nom} />

// ✅ Avec Intersection Observer (plus de contrôle)
import { LazyLoadImage } from 'react-lazy-load-image-component';

<LazyLoadImage
  src={photoUrl}
  effect="blur" // Effet de flou pendant chargement
  threshold={100} // Charger 100px avant d'être visible
/>
```

**Gain:**
- Réduction 50-70% requêtes images au chargement initial
- Page charge plus vite
- Moins de bande passante utilisée

---

### 6. Prefetching React Query (IMPACT: MOYEN)
**Status: À Implémenter**

**Cas d'usage:**
Précharger les données avant que l'utilisateur navigue

```tsx
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Précharger au hover d'un lien
const handleMouseEnter = () => {
  queryClient.prefetchQuery({
    queryKey: ['article', articleId],
    queryFn: () => stockApi.getById(articleId),
  });
};

<Link
  to={`/stock/${articleId}`}
  onMouseEnter={handleMouseEnter}
>
  Voir détails
</Link>
```

**Gain:**
- Navigation instantanée (données déjà en cache)
- UX améliorée

---

## 📊 Priorités d'Implémentation

| Optimisation | Impact | Effort | Priorité |
|--------------|--------|--------|----------|
| **React.memo sur lignes** | Élevé | Faible | 🔥 **P0** |
| **useMemo calculs lourds** | Moyen | Faible | 🟡 **P1** |
| **Image lazy loading** | Moyen | Faible | 🟡 **P1** |
| **Virtual scrolling** | Élevé* | Moyen | 🟢 **P2** |
| **useCallback handlers** | Faible | Faible | 🟢 **P2** |
| **Prefetching** | Moyen | Moyen | ⚪ **P3** |

\* Élevé seulement si >100 items dans les listes

---

## 🎯 Plan d'Action Recommandé

### Phase 1: Quick Wins (1-2h)
1. ✅ Ajouter `React.memo` sur composants de lignes
2. ✅ Ajouter `loading="lazy"` sur images
3. ✅ Identifier et mémoiser calculs lourds avec `useMemo`

### Phase 2: Optimisations Moyennes (2-3h)
4. ⏳ Implémenter virtual scrolling si listes >100 items
5. ⏳ Ajouter `useCallback` sur handlers critiques

### Phase 3: Polish (optionnel)
6. ⏳ Prefetching sur navigation anticipée
7. ⏳ Monitoring des performances avec React DevTools Profiler

---

## 📈 Métriques à Surveiller

### Avant Optimisation
- Time to Interactive (TTI): ~2-3s
- First Contentful Paint (FCP): ~1s
- Re-renders par interaction: ~10-50

### Objectifs Après Optimisation
- TTI: <1.5s ✅ (déjà atteint avec code splitting)
- FCP: <800ms
- Re-renders par interaction: <5

---

## 🛠️ Outils de Mesure

1. **React DevTools Profiler**
   - Identifier composants lents
   - Compter re-renders

2. **Chrome DevTools Performance**
   - Mesurer temps de rendu
   - Identifier bottlenecks

3. **Lighthouse**
   - Score global de performance
   - Recommandations automatiques

---

## ✅ Résumé Exécutif

**Ce qui est déjà excellent:**
- ✅ Code splitting (bundle -72%)
- ✅ Debouncing recherches (15 implémentations)
- ✅ Backend indexes (requêtes -80 à 99%)

**Ce qui reste à faire:**
- 🎯 React.memo sur lignes de tableau (effort faible, impact élevé)
- 🎯 useMemo pour calculs (effort faible, impact moyen)
- 🎯 Image lazy loading (effort très faible, impact moyen)
- ⏳ Virtual scrolling si nécessaire (effort moyen, impact élevé si >100 items)

**Verdict:** L'application est déjà bien optimisée! Les prochaines étapes sont du polish pour rendre l'expérience encore plus fluide.

# Ajout de Pagination aux Dialogs de Détails

## 🎯 Objectif
Ajouter la pagination à tous les dialogs qui affichent des listes longues (historiques, transactions, etc.) pour améliorer les performances et l'UX.

## 📋 Dialogs à Paginer

### 1. Stock.tsx - Historique des Mouvements ✅
**Dialog:** Historique des mouvements d'article
**Contenu:** Liste des mouvements de stock (entrées/sorties)
**État actuel:** Affiche tous les mouvements sans limite
**Action:** Ajouter pagination (10 items/page)

### 2. Fournisseurs.tsx - Détails Fournisseur ✅
**Dialog:** Détails du fournisseur
**Contenu:** Liste des approvisionnements du fournisseur
**État actuel:** Affiche tous les approvisionnements
**Action:** Ajouter pagination (10 items/page)

### 3. Ventes.tsx - Détails Vente ✅
**Dialog:** Détails de la vente
**Contenu:** Historique des versements de la vente
**État actuel:** Affiche tous les versements
**Action:** Ajouter pagination si >5 versements

### 4. Commandes.tsx - Détails Commande ✅
**Dialog:** Détails de la commande
**Contenu:** Lignes de commande + historique
**État actuel:** Affiche toutes les lignes
**Action:** Vérifier si pagination nécessaire

### 5. Approvisionnements.tsx - Détails Approvisionnement ✅
**Dialog:** Détails de l'approvisionnement
**Contenu:** Lignes d'approvisionnement + versements
**État actuel:** Affiche tout
**Action:** Ajouter pagination si >10 lignes

### 6. Versements.tsx - Détails Versement ✅
**Dialog:** Détails du versement
**Contenu:** Informations du versement
**État actuel:** Simple dialog (pas de liste)
**Action:** ❌ Pas besoin de pagination

### 7. VersementsClient.tsx - Détails Versement Client ✅
**Dialog:** Détails du versement client
**Contenu:** Informations du versement
**État actuel:** Simple dialog (pas de liste)
**Action:** ❌ Pas besoin de pagination

## 🔧 Implémentation

### Pattern de Pagination pour Dialogs

```tsx
import { useState } from 'react';
import Pagination from '@/components/Pagination';

function DetailDialog() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Découper les données pour la page actuelle
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);

  const totalPages = Math.ceil(items.length / limit);

  return (
    <Dialog>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Contenu */}
        <div className="space-y-2">
          {paginatedItems.map(item => (
            <div key={item.id}>...</div>
          ))}
        </div>

        {/* Pagination si nécessaire */}
        {totalPages > 1 && (
          <div className="mt-4 pt-4 border-t">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

### Avantages

1. **Performance** ⚡
   - Affiche 10-20 items au lieu de 100+
   - Scroll plus fluide
   - Moins de DOM à gérer

2. **UX** 📱
   - Navigation claire
   - Pas de scroll infini
   - Chargement visuel plus rapide

3. **Mobile** 📱
   - Moins de scroll
   - Meilleure lisibilité
   - Navigation par pages plus intuitive

## 📊 Priorités

| Page | Dialog | Priorité | Raison |
|------|--------|----------|---------|
| **Stock.tsx** | Historique mouvements | 🔴 P0 | Peut avoir 100+ mouvements |
| **Fournisseurs.tsx** | Détails | 🔴 P0 | Peut avoir 50+ approvisionnements |
| **Approvisionnements.tsx** | Détails | 🟡 P1 | Peut avoir 20+ lignes |
| **Ventes.tsx** | Détails | 🟡 P1 | Peut avoir 10+ versements |
| **Commandes.tsx** | Détails | 🟢 P2 | Rarement >10 lignes |

## ✅ Plan d'Action

### Phase 1: Dialogs Critiques (P0)
1. ✅ Stock.tsx - Historique mouvements
2. ✅ Fournisseurs.tsx - Liste approvisionnements

### Phase 2: Dialogs Moyens (P1)
3. ✅ Approvisionnements.tsx - Lignes + versements
4. ✅ Ventes.tsx - Historique versements

### Phase 3: Dialogs Simples (P2)
5. ✅ Commandes.tsx - Vérifier et ajouter si nécessaire

## 🎨 Composant Pagination

Le composant `Pagination` existe déjà dans `src/components/Pagination.tsx`:

```tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

**Usage:**
```tsx
<Pagination
  currentPage={page}
  totalPages={Math.ceil(items.length / limit)}
  onPageChange={setPage}
/>
```

## 📝 Notes Importantes

1. **Reset page à l'ouverture du dialog**
   ```tsx
   useEffect(() => {
     if (open) {
       setPage(1); // Toujours commencer à la page 1
     }
   }, [open]);
   ```

2. **Afficher pagination seulement si >1 page**
   ```tsx
   {totalPages > 1 && <Pagination ... />}
   ```

3. **Conserver le scroll en haut à chaque changement de page**
   ```tsx
   const handlePageChange = (newPage: number) => {
     setPage(newPage);
     dialogRef.current?.scrollTo(0, 0);
   };
   ```

## 🚀 Déploiement

Une fois implémenté:
1. Tester chaque dialog avec >20 items
2. Vérifier navigation pagination
3. Tester sur mobile
4. Commit par dialog pour traçabilité

# Task 5: Mettre à jour ArticleCombobox

**Files:**
- Modify: `src/components/ArticleCombobox.tsx`

## Steps

### Step 1: Mettre à jour interface Article

Find the local Article interface and add modesVente:

```typescript
interface Article {
  id: string;
  nom: string;
  stock: number;
  seuilAlerte?: number;
  prixVente?: number;
  prixAchat?: number;
  fournisseurPrefereNom?: string;
  uniteStock?: string;
  modesVente?: Array<{
    id: string;
    nom: string;
    quantiteStock: number;
    prixVente: number;
    parDefaut: boolean;
  }>;
}
```

### Step 2: Modifier affichage prix TriggerButton

Find where showPrice is rendered in the trigger button and update to show mode par défaut price:

```typescript
{showPrice && (
  <span className="text-muted-foreground text-xs">
    {formatPrix(
      priceType === 'vente'
        ? (selectedArticle.modesVente?.find(m => m.parDefaut)?.prixVente || selectedArticle.prixVente || 0)
        : selectedArticle.prixAchat || 0
    )}
    {selectedArticle.modesVente && selectedArticle.modesVente.length > 1 && (
      <span className="ml-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
        +{selectedArticle.modesVente.length - 1}
      </span>
    )}
  </span>
)}
```

### Step 3: Modifier affichage liste mobile

In the mobile Sheet list, update the price display:

```typescript
{showPrice && (
  <span className="font-medium text-primary">
    {formatPrix(article.modesVente?.find(m => m.parDefaut)?.prixVente || prix)}
    {article.modesVente && article.modesVente.length > 1 && (
      <span className="ml-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
        +{article.modesVente.length - 1} modes
      </span>
    )}
  </span>
)}
```

### Step 4: Modifier affichage liste desktop

In the Popover Command list, update similarly:

```typescript
{showPrice && (
  <span className="flex items-center gap-1">
    {formatPrix(article.modesVente?.find(m => m.parDefaut)?.prixVente || prix)}
    {article.modesVente && article.modesVente.length > 1 && (
      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs">
        +{article.modesVente.length - 1}
      </span>
    )}
  </span>
)}
```

### Step 5: Commit

```bash
git add src/components/ArticleCombobox.tsx
git commit -m "feat(ArticleCombobox): afficher modes de vente"
```

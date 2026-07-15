# Task 1: Ajouter les Types ModeVente

**Files:**
- Modify: `src/types/index.ts`

## Steps

### Step 1: Ajouter interfaces ModeVente après Article (~ligne 270)

```typescript
// Types pour les Modes de Vente (Gros/Détail)
export interface ModeVente {
  id: string;
  articleId: string;
  nom: string;
  quantiteStock: number;
  prixVente: number;
  codeBarre?: string;
  parDefaut: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModeVenteInline {
  nom: string;
  quantiteStock: number;
  prixVente: number;
  codeBarre?: string;
  parDefaut?: boolean;
}

export interface CreateModeVenteDto {
  articleId: string;
  nom: string;
  quantiteStock: number;
  prixVente: number;
  codeBarre?: string;
  parDefaut?: boolean;
}
```

### Step 2: Ajouter uniteStock et modesVente à Article

Find the Article interface and add after `joursSansVente`:

```typescript
  // Modes de vente (gros/détail)
  uniteStock?: string;
  modesVente?: ModeVente[];
```

### Step 3: Ajouter à CreateArticleDto

```typescript
  uniteStock?: string;
  modesVente?: ModeVenteInline[];
```

### Step 4: Mettre à jour LigneVente

Update the LigneVente interface to add modeVenteId and modeVenteNom:

```typescript
export interface LigneVente {
  articleId: string;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  modeVenteId?: string;
  modeVenteNom?: string;
}
```

### Step 5: Commit

```bash
cd "C:\Users\Bailo conde\Documents\projects\Gestion _boutique _walli_indistrie\react-design-studio"
npx tsc --noEmit && git add src/types/index.ts && git commit -m "feat(types): ajouter ModeVente types"
```

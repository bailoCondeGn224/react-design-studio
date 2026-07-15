# ModeVente Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter les modes de vente (gros/détail) dans le frontend React en respectant exactement la charte graphique verte du projet.

**Architecture:** Types ModeVente + StockForm avec section modes + VenteForm avec sélecteur mode par ligne. Conversion stock côté serveur.

**Tech Stack:** React, TypeScript, TanStack Query, Shadcn UI, Tailwind CSS

## Global Constraints - Charte Graphique

- **Couleur principale:** `primary` (vert hsl 119 80% 35%)
- **Sections:** `bg-gradient-to-br from-primary/5 via-background to-background`
- **Cercles décoratifs:** `bg-primary/5 rounded-full`
- **Icônes container:** `w-8 h-8 rounded-lg bg-primary/10`
- **Badges:** `rounded-full bg-primary/10 text-primary`
- **Bordures sélection:** `border-2 border-primary/30`
- **Focus inputs:** `focus:ring-2 focus:ring-primary/30 focus:border-primary`
- **Inputs:** `h-11`, `border border-border`, `rounded-lg`
- **Boutons:** `gradient-gold` ou `bg-primary`, `active:scale-95`

---

### Task 1: Ajouter les Types ModeVente

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Ajouter interfaces ModeVente après Article (~ligne 270)**

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

- [ ] **Step 2: Ajouter uniteStock et modesVente à Article**

Après `joursSansVente`:

```typescript
  // Modes de vente (gros/détail)
  uniteStock?: string;
  modesVente?: ModeVente[];
```

- [ ] **Step 3: Ajouter à CreateArticleDto**

```typescript
  uniteStock?: string;
  modesVente?: ModeVenteInline[];
```

- [ ] **Step 4: Mettre à jour LigneVente**

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

- [ ] **Step 5: Commit**

```bash
cd "C:\Users\Bailo conde\Documents\projects\Gestion _boutique _walli_indistrie\react-design-studio"
npx tsc --noEmit && git add src/types/index.ts && git commit -m "feat(types): ajouter ModeVente types"
```

---

### Task 2: Créer API et Hook Modes de Vente

**Files:**
- Create: `src/api/modes-vente.ts`
- Create: `src/hooks/useModesVente.ts`

- [ ] **Step 1: Créer src/api/modes-vente.ts**

```typescript
import { apiClient } from '@/lib/api-client';
import { ModeVente, CreateModeVenteDto } from '@/types';

export const modesVenteApi = {
  getByArticle: async (articleId: string): Promise<ModeVente[]> => {
    const response = await apiClient.get<ModeVente[]>(`/modes-vente/article/${articleId}`);
    return response.data;
  },

  create: async (data: CreateModeVenteDto): Promise<ModeVente> => {
    const response = await apiClient.post<ModeVente>('/modes-vente', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateModeVenteDto>): Promise<ModeVente> => {
    const response = await apiClient.patch<ModeVente>(`/modes-vente/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/modes-vente/${id}`);
  },
};
```

- [ ] **Step 2: Créer src/hooks/useModesVente.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modesVenteApi } from '@/api/modes-vente';
import { CreateModeVenteDto } from '@/types';
import { toast } from 'sonner';

export const useModesVenteByArticle = (articleId: string | null) => {
  return useQuery({
    queryKey: ['modes-vente', 'article', articleId],
    queryFn: () => modesVenteApi.getByArticle(articleId!),
    enabled: !!articleId,
  });
};

export const useCreateModeVente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateModeVenteDto) => modesVenteApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['modes-vente', 'article', variables.articleId] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      toast.success('Mode de vente ajouté');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout');
    },
  });
};

export const useDeleteModeVente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => modesVenteApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modes-vente'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      toast.success('Mode de vente supprimé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};
```

- [ ] **Step 3: Commit**

```bash
git add src/api/modes-vente.ts src/hooks/useModesVente.ts
git commit -m "feat: ajouter API et hooks modes-vente"
```

---

### Task 3: Mettre à jour API Stock pour modesVente

**Files:**
- Modify: `src/api/stock.ts`

- [ ] **Step 1: Modifier create pour sérialiser modesVente**

```typescript
  create: async (data: CreateArticleDto, photo?: File): Promise<Article> => {
    if (photo) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'modesVente' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      formData.append('photo', photo);

      const response = await apiClient.post<Article>('/stock', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }

    const response = await apiClient.post<Article>('/stock', data);
    return response.data;
  },
```

- [ ] **Step 2: Modifier update de la même façon**

```typescript
  update: async (id: string, data: Partial<CreateArticleDto>, photo?: File): Promise<Article> => {
    if (photo) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'modesVente' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      formData.append('photo', photo);

      const response = await apiClient.patch<Article>(`/stock/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }

    const response = await apiClient.patch<Article>(`/stock/${id}`, data);
    return response.data;
  },
```

- [ ] **Step 3: Commit**

```bash
git add src/api/stock.ts
git commit -m "feat(api/stock): sérialiser modesVente dans FormData"
```

---

### Task 4: Mettre à jour StockForm - Charte Graphique Verte

**Files:**
- Modify: `src/components/StockForm.tsx`

- [ ] **Step 1: Ajouter imports**

Après les imports existants (~ligne 10):

```typescript
import { Plus, Trash2, Layers, Star, StarOff } from "lucide-react";
import { ModeVenteInline } from '@/types';
```

- [ ] **Step 2: Mettre à jour getInitialState**

Remplacer la fonction `getInitialState` (~ligne 24-50):

```typescript
  const getInitialState = () => {
    if (mode === 'edit' && initialData) {
      return {
        ...initialData,
        categorieId: initialData.categorieId || '',
        stock: String(initialData.stock),
        seuilAlerte: String(initialData.seuilAlerte),
        prixVente: initialData.prixVente?.toString().replace(' GNF', '') || '',
        prixAchat: initialData.prixAchat?.toString().replace(' GNF', '') || '',
        reference: initialData.reference || '',
        dateExpiration: initialData.dateExpiration || '',
        delaiAlerteExpiration: initialData.delaiAlerteExpiration?.toString() || '30',
        uniteStock: initialData.uniteStock || 'Unité',
        modesVente: initialData.modesVente?.map((m: any) => ({
          nom: m.nom,
          quantiteStock: m.quantiteStock,
          prixVente: m.prixVente,
          codeBarre: m.codeBarre,
          parDefaut: m.parDefaut,
        })) || [],
      };
    }
    return {
      nom: "",
      reference: "",
      categorieId: "",
      zone: "A",
      stock: "",
      seuilAlerte: "",
      prixVente: "",
      prixAchat: "",
      dateExpiration: "",
      delaiAlerteExpiration: "30",
      uniteStock: "Unité",
      modesVente: [] as ModeVenteInline[],
    };
  };
```

- [ ] **Step 3: Mettre à jour useEffect mode édition (~ligne 97-121)**

```typescript
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        ...initialData,
        stock: String(initialData.stock),
        seuilAlerte: String(initialData.seuilAlerte),
        prixVente: initialData.prixVente?.replace(' GNF', '') || '',
        prixAchat: initialData.prixAchat?.replace(' GNF', '') || '',
        reference: initialData.reference || '',
        dateExpiration: initialData.dateExpiration || '',
        delaiAlerteExpiration: initialData.delaiAlerteExpiration?.toString() || '30',
        uniteStock: initialData.uniteStock || 'Unité',
        modesVente: initialData.modesVente?.map((m: any) => ({
          nom: m.nom,
          quantiteStock: m.quantiteStock,
          prixVente: m.prixVente,
          codeBarre: m.codeBarre,
          parDefaut: m.parDefaut,
        })) || [],
      });

      if (initialData.photo) {
        setPhotoPreview(getPhotoUrl(initialData.photo));
      } else {
        setPhotoPreview(null);
      }
      setPhotoFile(null);
    }
  }, [mode, initialData, open]);
```

- [ ] **Step 4: Ajouter fonctions gestion modes après `update` (~ligne 123)**

```typescript
  // Gestion des modes de vente
  const ajouterModeVente = () => {
    setForm(prev => ({
      ...prev,
      modesVente: [
        ...prev.modesVente,
        { nom: '', quantiteStock: 1, prixVente: 0, parDefaut: prev.modesVente.length === 0 },
      ],
    }));
  };

  const supprimerModeVente = (index: number) => {
    setForm(prev => {
      const newModes = prev.modesVente.filter((_, i) => i !== index);
      if (prev.modesVente[index].parDefaut && newModes.length > 0) {
        newModes[0].parDefaut = true;
      }
      return { ...prev, modesVente: newModes };
    });
  };

  const updateModeVente = (index: number, field: keyof ModeVenteInline, value: any) => {
    setForm(prev => {
      const newModes = [...prev.modesVente];
      newModes[index] = { ...newModes[index], [field]: value };
      return { ...prev, modesVente: newModes };
    });
  };

  const setModeDefaut = (index: number) => {
    setForm(prev => ({
      ...prev,
      modesVente: prev.modesVente.map((m, i) => ({ ...m, parDefaut: i === index })),
    }));
  };
```

- [ ] **Step 5: Mettre à jour articleData dans handleSubmit (~ligne 207)**

```typescript
    const articleData = {
      nom: form.nom,
      reference: form.reference || undefined,
      categorieId: form.categorieId,
      zone: form.zone,
      stock: Number(form.stock) || 0,
      seuilAlerte: Number(form.seuilAlerte),
      prixVente: Number(form.prixVente),
      prixAchat: form.prixAchat ? Number(form.prixAchat) : undefined,
      dateExpiration: form.dateExpiration || undefined,
      delaiAlerteExpiration: form.delaiAlerteExpiration ? Number(form.delaiAlerteExpiration) : undefined,
      uniteStock: form.uniteStock || 'Unité',
      modesVente: form.modesVente.length > 0 ? form.modesVente : undefined,
    };
```

- [ ] **Step 6: Ajouter champ uniteStock après référence (~ligne 258)**

```typescript
          <FormField
            label="Unité de stock"
            placeholder="Ex: Bouteille, Kilo, Pièce"
            value={form.uniteStock}
            onChange={e => update("uniteStock", (e.target as HTMLInputElement).value)}
            maxLength={50}
          />
```

- [ ] **Step 7: Ajouter section Modes de Vente (CHARTE VERTE) avant boutons (~ligne 518)**

```typescript
          {/* Section Modes de Vente - Charte Graphique Verte */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
            <div className="relative space-y-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Modes de Vente</h3>
                  {form.modesVente.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {form.modesVente.length}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={ajouterModeVente}
                  className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs sm:text-sm font-semibold active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Ajouter</span>
                </button>
              </div>

              {form.modesVente.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-border rounded-xl bg-muted/30">
                  <Layers className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-muted-foreground">Aucun mode de vente</p>
                  <p className="text-xs text-muted-foreground mt-1">L'article sera vendu à l'unité au prix défini</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.modesVente.map((mode, index) => (
                    <div
                      key={index}
                      className={`relative rounded-xl border-2 transition-all ${
                        mode.parDefaut
                          ? 'border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background'
                          : 'border-border bg-card'
                      } p-3 sm:p-4`}
                    >
                      {/* En-tête mode */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            mode.parDefaut
                              ? 'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          {mode.parDefaut && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              Par défaut
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {!mode.parDefaut && (
                            <button
                              type="button"
                              onClick={() => setModeDefaut(index)}
                              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 active:scale-95 transition-all"
                              title="Définir par défaut"
                            >
                              <StarOff className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => supprimerModeVente(index)}
                            className="p-2 rounded-lg text-destructive hover:bg-destructive/10 active:scale-95 transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Champs du mode */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-foreground mb-1.5 block">Nom du mode</label>
                            <input
                              type="text"
                              placeholder="Ex: Casier, Sac"
                              value={mode.nom}
                              onChange={(e) => updateModeVente(index, 'nom', e.target.value)}
                              maxLength={50}
                              className="w-full px-3 h-11 rounded-lg border border-border bg-card text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-foreground mb-1.5 block">
                              Contient ({form.uniteStock || 'unités'})
                            </label>
                            <input
                              type="number"
                              placeholder="12"
                              min="0.01"
                              step="0.01"
                              value={mode.quantiteStock}
                              onChange={(e) => updateModeVente(index, 'quantiteStock', parseFloat(e.target.value) || 1)}
                              className="w-full px-3 h-11 rounded-lg border border-border bg-card text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-foreground mb-1.5 block">Prix de vente (GNF)</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="120 000"
                              value={formatPrixInput(mode.prixVente)}
                              onChange={(e) => updateModeVente(index, 'prixVente', handlePrixChange(e.target.value))}
                              className="w-full px-3 h-11 rounded-lg border border-border bg-card text-base sm:text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Code-barres</label>
                            <input
                              type="text"
                              placeholder="Optionnel"
                              value={mode.codeBarre || ''}
                              onChange={(e) => updateModeVente(index, 'codeBarre', e.target.value)}
                              maxLength={50}
                              className="w-full px-3 h-11 rounded-lg border border-border bg-card text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
```

- [ ] **Step 8: Commit**

```bash
npx tsc --noEmit && git add src/components/StockForm.tsx && git commit -m "feat(StockForm): ajouter section modes de vente"
```

---

### Task 5: Mettre à jour ArticleCombobox

**Files:**
- Modify: `src/components/ArticleCombobox.tsx`

- [ ] **Step 1: Mettre à jour interface Article (~ligne 26-34)**

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

- [ ] **Step 2: Modifier affichage prix TriggerButton (~ligne 126-132)**

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

- [ ] **Step 3: Modifier affichage liste mobile (~ligne 238-244)**

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

- [ ] **Step 4: Modifier affichage liste desktop (~ligne 324-326)**

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

- [ ] **Step 5: Commit**

```bash
git add src/components/ArticleCombobox.tsx
git commit -m "feat(ArticleCombobox): afficher modes de vente"
```

---

### Task 6: Mettre à jour VenteForm avec Sélecteur Mode

**Files:**
- Modify: `src/components/VenteForm.tsx`

- [ ] **Step 1: Ajouter import Layers (~ligne 9)**

```typescript
import { Plus, Trash2, ShoppingCart, User, Phone, DollarSign, CreditCard, AlertTriangle, Package, CheckCircle2, Layers } from "lucide-react";
```

- [ ] **Step 2: Modifier onChange ArticleCombobox (~ligne 430-444)**

```typescript
onChange={(article) => {
  if (article) {
    const modeDefaut = article.modesVente?.find(m => m.parDefaut) || article.modesVente?.[0];
    const prixVente = modeDefaut?.prixVente || Number(article.prixVente) || 0;

    setForm(prev => {
      const newLignes = [...prev.lignes];
      newLignes[index] = {
        ...newLignes[index],
        articleId: article.id,
        nom: article.nom,
        prixUnitaire: prixVente,
        prixAchat: Number(article.prixAchat) || 0,
        stockDisponible: article.stock,
        uniteStock: article.uniteStock,
        modesVente: article.modesVente || [],
        modeVenteId: modeDefaut?.id,
        modeVenteNom: modeDefaut?.nom,
        sousTotal: Number(newLignes[index].quantite || 1) * prixVente
      };
      return { ...prev, lignes: newLignes };
    });
  }
}}
```

- [ ] **Step 3: Ajouter sélecteur mode après stock warning (~ligne 463)**

```typescript
{/* Sélecteur de Mode de Vente */}
{ligne.modesVente && ligne.modesVente.length > 0 && (
  <div>
    <label className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
      <Layers className="w-3.5 h-3.5 text-primary" />
      Mode de vente
    </label>
    <select
      value={ligne.modeVenteId || ''}
      onChange={(e) => {
        const selectedMode = ligne.modesVente.find((m: any) => m.id === e.target.value);
        if (selectedMode) {
          setForm(prev => {
            const newLignes = [...prev.lignes];
            newLignes[index] = {
              ...newLignes[index],
              modeVenteId: selectedMode.id,
              modeVenteNom: selectedMode.nom,
              prixUnitaire: selectedMode.prixVente,
              sousTotal: Number(newLignes[index].quantite || 1) * selectedMode.prixVente
            };
            return { ...prev, lignes: newLignes };
          });
        }
      }}
      className="w-full px-3 h-11 rounded-lg border-2 border-primary/20 bg-primary/5 text-base sm:text-sm font-medium cursor-pointer focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
    >
      {ligne.modesVente.map((mode: any) => (
        <option key={mode.id} value={mode.id}>
          {mode.nom} • {mode.quantiteStock} {ligne.uniteStock || 'unités'} • {new Intl.NumberFormat('fr-GN', { style: 'currency', currency: 'GNF', minimumFractionDigits: 0 }).format(mode.prixVente).replace('GNF', 'GNF')}
          {mode.parDefaut ? ' ★' : ''}
        </option>
      ))}
    </select>
    {ligne.modesVente.length > 1 && (
      <p className="text-xs text-muted-foreground mt-1">
        {ligne.modesVente.length} modes disponibles
      </p>
    )}
  </div>
)}
```

- [ ] **Step 4: Mettre à jour lignesClean dans handleSubmit (~ligne 232-238)**

```typescript
const lignesClean = form.lignes.map(ligne => ({
  articleId: ligne.articleId,
  nom: ligne.nom,
  quantite: Number(ligne.quantite),
  prixUnitaire: Number(ligne.prixUnitaire),
  sousTotal: Number(ligne.sousTotal),
  modeVenteId: ligne.modeVenteId || undefined,
}));
```

- [ ] **Step 5: Commit**

```bash
git add src/components/VenteForm.tsx
git commit -m "feat(VenteForm): ajouter sélecteur mode de vente"
```

---

### Task 7: Test et Build Final

- [ ] **Step 1: Vérifier compilation**

```bash
cd "C:\Users\Bailo conde\Documents\projects\Gestion _boutique _walli_indistrie\react-design-studio"
npx tsc --noEmit
```

- [ ] **Step 2: Build production**

```bash
npm run build
```

- [ ] **Step 3: Tests manuels**

```bash
npm run dev
```

Scénarios:
1. Créer article avec modes de vente
2. Modifier article pour ajouter/supprimer modes
3. Créer vente et changer de mode
4. Vérifier mise à jour prix automatique
5. Tester sur mobile

- [ ] **Step 4: Commit final si corrections**

```bash
git add -A && git commit -m "fix: ajustements mode-vente frontend"
```

---

## Résumé Charte Graphique Appliquée

| Élément | Classes (Thème Vert) |
|---------|---------------------|
| Section card | `bg-gradient-to-br from-primary/5 via-background to-background border-2 border-border` |
| Cercle décoratif | `bg-primary/5 rounded-full` |
| Icon container | `w-8 h-8 rounded-lg bg-primary/10` |
| Badge compteur | `rounded-full bg-primary/10 text-primary text-xs font-bold` |
| Mode sélectionné | `border-primary/30 bg-gradient-to-br from-primary/5` |
| Numéro actif | `bg-gradient-to-br from-primary to-primary/70 text-primary-foreground` |
| Focus inputs | `focus:ring-2 focus:ring-ring/30` |
| Bouton action | `bg-primary/10 text-primary hover:bg-primary/20 active:scale-95` |

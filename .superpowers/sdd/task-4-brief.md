# Task 4: Mettre à jour StockForm - Charte Graphique Verte

**Files:**
- Modify: `src/components/StockForm.tsx`

## Global Constraints - Charte Graphique

- **Couleur principale:** `primary` (vert hsl 119 80% 35%)
- **Sections:** `bg-gradient-to-br from-primary/5 via-background to-background`
- **Cercles décoratifs:** `bg-primary/5 rounded-full`
- **Icônes container:** `w-8 h-8 rounded-lg bg-primary/10`
- **Badges:** `rounded-full bg-primary/10 text-primary`
- **Bordures sélection:** `border-2 border-primary/30`
- **Inputs:** `h-11`, `border border-border`, `rounded-lg`

## Steps

### Step 1: Ajouter imports

After existing imports (~line 10), add:

```typescript
import { Plus, Trash2, Layers, Star, StarOff } from "lucide-react";
import { ModeVenteInline } from '@/types';
```

### Step 2: Mettre à jour getInitialState

Replace the `getInitialState` function to include uniteStock and modesVente:

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

### Step 3: Mettre à jour useEffect mode édition

Update the useEffect that handles edit mode to include uniteStock and modesVente.

### Step 4: Ajouter fonctions gestion modes

After the `update` function, add:

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

### Step 5: Mettre à jour articleData dans handleSubmit

Add uniteStock and modesVente to the articleData object:

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

### Step 6: Ajouter champ uniteStock

After the reference field in the form, add:

```typescript
          <FormField
            label="Unité de stock"
            placeholder="Ex: Bouteille, Kilo, Pièce"
            value={form.uniteStock}
            onChange={e => update("uniteStock", (e.target as HTMLInputElement).value)}
            maxLength={50}
          />
```

### Step 7: Ajouter section Modes de Vente (CHARTE VERTE)

Before the action buttons, add the full modes de vente section. This is the UI component with:
- Green gradient background
- Decorative circle
- Icon container
- Badge counter
- Cards for each mode with:
  - Numbered badge
  - Default star indicator
  - Delete button
  - Fields: nom, quantiteStock, prixVente, codeBarre

The full JSX is in the plan file. Key classes:
- Section: `bg-gradient-to-br from-primary/5 via-background to-background border-2 border-border`
- Icon container: `w-8 h-8 rounded-lg bg-primary/10`
- Badge: `rounded-full bg-primary/10 text-primary`
- Active mode: `border-primary/30 bg-gradient-to-br from-primary/5`
- Number active: `bg-gradient-to-br from-primary to-primary/70`

### Step 8: Commit

```bash
npx tsc --noEmit && git add src/components/StockForm.tsx && git commit -m "feat(StockForm): ajouter section modes de vente"
```

# Task 6: Mettre à jour VenteForm avec Sélecteur Mode

**Files:**
- Modify: `src/components/VenteForm.tsx`

## Steps

### Step 1: Ajouter import Layers

Add Layers to the lucide-react imports:

```typescript
import { Plus, Trash2, ShoppingCart, User, Phone, DollarSign, CreditCard, AlertTriangle, Package, CheckCircle2, Layers } from "lucide-react";
```

### Step 2: Modifier onChange ArticleCombobox

When an article is selected, we need to capture its modesVente and set the default mode:

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

### Step 3: Ajouter sélecteur mode après stock warning

After the stock warning message, add the mode selector:

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

### Step 4: Mettre à jour lignesClean dans handleSubmit

Add modeVenteId to the cleaned lignes:

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

### Step 5: Commit

```bash
npx tsc --noEmit && git add src/components/VenteForm.tsx && git commit -m "feat(VenteForm): ajouter sélecteur mode de vente"
```
